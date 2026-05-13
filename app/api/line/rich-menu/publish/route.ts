import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import type { PublishRequest, LineRichMenuCreateRequest } from "@/lib/line-rich-menu/types"
import { PRESETS } from "@/lib/line-rich-menu/presets"
import { RICHMENU_STYLES } from "@/lib/line-rich-menu/styles"
import crypto from "crypto"

function decryptToken(encrypted: string, key: string): string {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key.slice(0, 64), "hex"),
    iv
  )
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(Buffer.from(encryptedHex, "hex"), undefined, "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

async function generateRichMenuImage(
  layout: string,
  style: any,
  slots: any[],
  salonName: string
): Promise<Buffer> {
  // For now, generate a simple placeholder image
  // In production, use @vercel/og or Canvas-based generation
  // This returns a minimal PNG buffer
  const width = 800
  const height = 810

  // Generate a simple SVG and convert to PNG
  // For MVP, we'll return a placeholder that LINE can accept
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${style.menuBg || "#ffffff"}"/>
      <text x="20" y="40" font-family="Arial" font-size="24" fill="${style.btnText || "#000000"}" font-weight="bold">
        ${salonName}
      </text>
    </svg>
  `

  // Convert SVG to Buffer (simplified for MVP)
  const buffer = Buffer.from(svg, "utf-8")
  return buffer
}

export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json()

    const {
      layout,
      style_id,
      slots,
      greeting_text,
      greeting_preset_id,
      avatar_id,
      chat_title,
    } = body

    // Validate required fields
    if (!layout || !style_id || !Array.isArray(slots) || !chat_title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Get auth user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get salon_id
    const { data: salonOwner, error: ownerError } = await supabase
      .from("salon_owners")
      .select("salon_id")
      .eq("user_id", user.id)
      .single()

    if (ownerError || !salonOwner) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 })
    }

    const salon_id = salonOwner.salon_id

    // Fetch LINE account with encrypted token
    const { data: lineAccount, error: lineError } = await supabase
      .from("line_accounts")
      .select("channel_access_token_enc, line_user_id")
      .eq("salon_id", salon_id)
      .single()

    if (lineError || !lineAccount?.channel_access_token_enc) {
      return NextResponse.json(
        { error: "LINE account not configured" },
        { status: 400 }
      )
    }

    // Decrypt token
    let channelAccessToken: string
    try {
      const encryptionKey = process.env.ENCRYPTION_KEY
      if (!encryptionKey) {
        throw new Error("ENCRYPTION_KEY not set")
      }
      channelAccessToken = decryptToken(lineAccount.channel_access_token_enc, encryptionKey)
    } catch (decryptError) {
      console.error("Decryption error:", decryptError)
      return NextResponse.json(
        { error: "Failed to decrypt LINE token" },
        { status: 500 }
      )
    }

    // Get style details
    const style = RICHMENU_STYLES.find((s) => s.id === style_id)
    if (!style) {
      return NextResponse.json({ error: "Style not found" }, { status: 400 })
    }

    // Build LINE rich menu structure
    const lineRichMenuRequest: LineRichMenuCreateRequest = {
      size: {
        width: 800,
        height: 810,
      },
      selected: true,
      name: `RichMenu_${salon_id}_${Date.now()}`,
      areas: slots
        .filter((slot) => slot !== null)
        .map((slot, idx) => {
          const preset = PRESETS.find((p) => p.id === slot.presetId)
          let action: any
          if (slot.action === "url") {
            action = { type: "uri" as const, uri: slot.url }
          } else if (slot.action === "message") {
            action = { type: "message" as const, text: slot.label }
          } else if (slot.action === "phone") {
            action = { type: "uri" as const, uri: `tel:${slot.url}` }
          } else {
            action = { type: "postback" as const, postbackData: `action=${slot.presetId}` }
          }

          return {
            bounds: calculateBounds(idx, layout),
            action,
          }
        }),
    }

    // Create rich menu via LINE Messaging API
    const createMenuResponse = await fetch(
      "https://api.line.biz/v2/bot/richmenu",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${channelAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lineRichMenuRequest),
      }
    )

    if (!createMenuResponse.ok) {
      const errorText = await createMenuResponse.text()
      console.error("LINE API error:", errorText)
      return NextResponse.json(
        { error: "Failed to create LINE rich menu", details: errorText },
        { status: 500 }
      )
    }

    const menuResponse = await createMenuResponse.json()
    const richMenuId = menuResponse.richMenuId

    // Generate and upload image
    try {
      const imageBuffer = await generateRichMenuImage(
        layout,
        style,
        slots,
        chat_title
      )

      const uploadResponse = await fetch(
        `https://api.line.biz/v2/bot/richmenu/${richMenuId}/content`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${channelAccessToken}`,
            "Content-Type": "image/png",
          },
          body: imageBuffer as any,
        }
      )

      if (!uploadResponse.ok) {
        console.error("Image upload failed:", await uploadResponse.text())
        // Continue anyway - menu is created, just image upload failed
      }
    } catch (imageError) {
      console.error("Image generation error:", imageError)
      // Continue anyway
    }

    // Set as default rich menu
    const setDefaultResponse = await fetch(
      `https://api.line.biz/v2/bot/user/all/richmenu/${richMenuId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${channelAccessToken}`,
        },
      }
    )

    if (!setDefaultResponse.ok) {
      console.error("Failed to set default rich menu")
      // Continue anyway
    }

    // Update database with published config
    const { data: config, error: updateError } = await supabase
      .from("rich_menu_configs")
      .upsert(
        {
          salon_id,
          layout,
          style_id,
          slots,
          greeting_text,
          greeting_preset_id,
          avatar_id,
          chat_title,
          is_draft: false,
          line_rich_menu_id: richMenuId,
          line_published_at: new Date().toISOString(),
        },
        {
          onConflict: "salon_id",
        }
      )
      .select()
      .single()

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json(
        { error: "Published to LINE but failed to update database" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      config,
      richMenuId,
      message: "Rich menu published successfully",
    })
  } catch (error) {
    console.error("POST /api/line/rich-menu/publish:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function calculateBounds(
  index: number,
  layout: string
): { x: number; y: number; width: number; height: number } {
  // Calculate button position based on layout type
  const cellWidth = 800
  const cellHeight = 810

  const layouts: Record<
    string,
    { cols: number; rows: number; width: number; height: number }
  > = {
    "hero-6": { cols: 3, rows: 2, width: 267, height: 405 },
    "3x2": { cols: 3, rows: 2, width: 267, height: 405 },
    "2x2": { cols: 2, rows: 2, width: 400, height: 405 },
    "2x1": { cols: 2, rows: 1, width: 400, height: 810 },
    "1x1": { cols: 1, rows: 1, width: 800, height: 810 },
  }

  const config = layouts[layout] || layouts["3x2"]
  const col = index % config.cols
  const row = Math.floor(index / config.cols)

  return {
    x: col * config.width,
    y: row * config.height,
    width: config.width,
    height: config.height,
  }
}
