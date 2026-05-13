import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import type { RichMenuConfig } from "@/lib/line-rich-menu/types"

export async function GET(request: NextRequest) {
  try {
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

    // Fetch rich menu config (draft or published)
    const { data: config, error: configError } = await supabase
      .from("rich_menu_configs")
      .select("*")
      .eq("salon_id", salonOwner.salon_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (configError && configError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      return NextResponse.json(
        { error: "Failed to fetch configuration" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      config: config || null,
    })
  } catch (error) {
    console.error("GET /api/line/rich-menu:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
