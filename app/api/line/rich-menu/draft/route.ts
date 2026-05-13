import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import type { SaveDraftRequest } from "@/lib/line-rich-menu/types"

export async function POST(request: NextRequest) {
  try {
    const body: SaveDraftRequest = await request.json()

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
    if (!layout || !style_id || !Array.isArray(slots)) {
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

    // Get salon_id from auth user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get salon_id from salon_owners table
    const { data: salonOwner, error: ownerError } = await supabase
      .from("salon_owners")
      .select("salon_id")
      .eq("user_id", user.id)
      .single()

    if (ownerError || !salonOwner) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 })
    }

    const salon_id = salonOwner.salon_id

    // Upsert draft configuration
    const { data: config, error: upsertError } = await supabase
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
          is_draft: true,
        },
        {
          onConflict: "salon_id",
        }
      )
      .select()
      .single()

    if (upsertError) {
      console.error("Upsert error:", upsertError)
      return NextResponse.json(
        { error: "Failed to save draft" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      config,
      message: "Draft saved successfully",
    })
  } catch (error) {
    console.error("POST /api/line/rich-menu/draft:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
