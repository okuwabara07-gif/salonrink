import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  MenuRow,
  UpdateMenuRequest,
  successResponse,
  errorResponse,
} from '@/lib/menus/schema'

// ========================================
// PATCH /api/menus/[id] - Update a menu
// ========================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // 3. Verify menu ownership (first defense)
    const { data: existingMenu, error: fetchError } = await supabase
      .from('salon_menus')
      .select('id')
      .eq('id', id)
      .eq('salon_id', salon.id)
      .single()

    if (fetchError || !existingMenu) {
      return NextResponse.json(errorResponse('Not Found'), { status: 404 })
    }

    // 4. Parse and validate request body
    const body = await req.json()
    const validatedRequest = UpdateMenuRequest.safeParse(body)

    if (!validatedRequest.success) {
      return NextResponse.json(
        errorResponse(`Validation failed: ${validatedRequest.error.message}`),
        { status: 400 }
      )
    }

    // 5. Build update payload (only include provided fields)
    const updatePayload: Record<string, unknown> = {}

    if (validatedRequest.data.name !== undefined) {
      updatePayload.name = validatedRequest.data.name
    }
    if (validatedRequest.data.price !== undefined) {
      updatePayload.price = validatedRequest.data.price
    }
    if (validatedRequest.data.duration !== undefined) {
      updatePayload.duration = validatedRequest.data.duration
    }
    if (validatedRequest.data.category !== undefined) {
      updatePayload.category = validatedRequest.data.category
    }

    // If no fields provided, return current menu without updating
    if (Object.keys(updatePayload).length === 0) {
      const { data: menu } = await supabase
        .from('salon_menus')
        .select()
        .eq('id', id)
        .eq('salon_id', salon.id)
        .single()

      if (!menu) {
        return NextResponse.json(errorResponse('Not Found'), { status: 404 })
      }

      return NextResponse.json(successResponse(menu), { status: 200 })
    }

    // 6. Update menu (double defense: id + salon_id)
    const { data: updatedMenu, error: updateError } = await supabase
      .from('salon_menus')
      .update(updatePayload)
      .eq('id', id)
      .eq('salon_id', salon.id)
      .select()
      .single()

    if (updateError) {
      console.error('update error:', updateError)
      return NextResponse.json(
        errorResponse('Internal Server Error'),
        { status: 500 }
      )
    }

    return NextResponse.json(successResponse(updatedMenu), { status: 200 })
  } catch (error) {
    console.error('PATCH /api/menus/[id] error:', error, error instanceof Error ? error.stack : '')
    return NextResponse.json(
      errorResponse('Internal Server Error'),
      { status: 500 }
    )
  }
}

// ========================================
// DELETE /api/menus/[id] - Delete a menu
// ========================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // 3. Delete menu (double defense: id + salon_id)
    const { error: deleteError } = await supabase
      .from('salon_menus')
      .delete()
      .eq('id', id)
      .eq('salon_id', salon.id)

    if (deleteError) {
      console.error('delete error:', deleteError)
      return NextResponse.json(
        errorResponse('Internal Server Error'),
        { status: 500 }
      )
    }

    // 4. Return success response
    return NextResponse.json(
      successResponse({ deleted: true }),
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/menus/[id] error:', error, error instanceof Error ? error.stack : '')
    return NextResponse.json(
      errorResponse('Internal Server Error'),
      { status: 500 }
    )
  }
}
