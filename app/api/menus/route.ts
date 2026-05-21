import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  MenuRow,
  CreateMenuRequest,
  successResponse,
  errorResponse,
} from '@/lib/menus/schema'

// ========================================
// GET /api/menus - List menus for current user's salon
// ========================================

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 })
    }

    // 2. Resolve salon_id from user's salon
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (salonError || !salon) {
      return NextResponse.json(errorResponse('Forbidden'), { status: 403 })
    }

    // 3. Fetch menus for the salon
    const { data: menus, error: menuError } = await supabase
      .from('salon_menus')
      .select('id, salon_id, name, price, duration, category, sort_order, created_at')
      .eq('salon_id', salon.id)
      .order('sort_order', { ascending: true })

    if (menuError) {
      console.error('salon_menus query error:', menuError)
      return NextResponse.json(
        errorResponse('Internal Server Error'),
        { status: 500 }
      )
    }

    return NextResponse.json(successResponse(menus), { status: 200 })
  } catch (error) {
    console.error('GET /api/menus error:', error)
    return NextResponse.json(
      errorResponse('Internal Server Error'),
      { status: 500 }
    )
  }
}

// ========================================
// POST /api/menus - Create a new menu
// ========================================

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 })
    }

    // 2. Resolve salon_id from user's salon
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (salonError || !salon) {
      return NextResponse.json(errorResponse('Forbidden'), { status: 403 })
    }

    // 3. Parse request body
    const body = await req.json()
    const validatedRequest = CreateMenuRequest.safeParse(body)

    if (!validatedRequest.success) {
      return NextResponse.json(
        errorResponse(`Validation failed: ${validatedRequest.error.message}`),
        { status: 400 }
      )
    }

    // 4. Calculate next sort_order (max + 1)
    const { data: maxSortMenu, error: maxError } = await supabase
      .from('salon_menus')
      .select('sort_order')
      .eq('salon_id', salon.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    if (maxError && maxError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected for first menu)
      console.error('sort_order calculation error:', maxError)
      return NextResponse.json(
        errorResponse('Internal Server Error'),
        { status: 500 }
      )
    }

    const nextSortOrder = (maxSortMenu?.sort_order ?? -1) + 1

    // 5. Insert new menu
    const { data: newMenu, error: insertError } = await supabase
      .from('salon_menus')
      .insert({
        salon_id: salon.id,
        name: validatedRequest.data.name,
        price: validatedRequest.data.price,
        duration: validatedRequest.data.duration,
        category: validatedRequest.data.category || null,
        sort_order: nextSortOrder,
      })
      .select()
      .single()

    if (insertError) {
      console.error('insert error:', insertError)
      return NextResponse.json(
        errorResponse('Internal Server Error'),
        { status: 500 }
      )
    }

    return NextResponse.json(successResponse(newMenu), { status: 201 })
  } catch (error) {
    console.error('POST /api/menus error:', error, error instanceof Error ? error.stack : '')
    return NextResponse.json(
      errorResponse('Internal Server Error'),
      { status: 500 }
    )
  }
}
