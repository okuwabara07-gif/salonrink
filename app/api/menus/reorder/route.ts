/**
 * PATCH /api/menus/reorder
 *
 * 複数メニューの並べ替え(sort_order を一括更新)
 * - 認証チェック
 * - salon 特定
 * - 全メニューの所有確認(salon_id 一致)
 * - 並列更新
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { z } from 'zod'

const ReorderRequest = z.object({
  orders: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number().int(),
    })
  ),
})

type ReorderRequest = z.infer<typeof ReorderRequest>

interface ReorderResponse {
  updated_count: number
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Step 1: Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[PATCH /api/menus/reorder] Auth error:', authError?.message)
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 })
    }

    // Step 2: Resolve salon_id
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (salonError || !salon) {
      console.error('[PATCH /api/menus/reorder] Salon lookup error:', salonError?.message)
      return NextResponse.json(errorResponse('Forbidden'), { status: 403 })
    }

    const salonId = salon.id as string

    // Step 3: Parse and validate request body
    const body = await req.json()
    const validatedRequest = ReorderRequest.safeParse(body)

    if (!validatedRequest.success) {
      console.error('[PATCH /api/menus/reorder] Validation error:', validatedRequest.error.message)
      return NextResponse.json(
        errorResponse(`Validation failed: ${validatedRequest.error.message}`),
        { status: 400 }
      )
    }

    const orders = validatedRequest.data.orders
    if (orders.length === 0) {
      return successResponse<ReorderResponse>({ updated_count: 0 })
    }

    // Step 4: Verify all menus are owned by the user's salon
    const menuIds = orders.map((o) => o.id)
    const { data: existingMenus, error: fetchError } = await supabase
      .from('salon_menus')
      .select('id')
      .eq('salon_id', salonId)
      .in('id', menuIds)

    if (fetchError) {
      console.error('[PATCH /api/menus/reorder] Menu verification error:', fetchError.message)
      return NextResponse.json(errorResponse('Internal Server Error'), { status: 500 })
    }

    if ((existingMenus || []).length !== menuIds.length) {
      console.warn('[PATCH /api/menus/reorder] Some menus not found or not owned by salon')
      return NextResponse.json(
        errorResponse('Some menus not found or not owned'),
        { status: 403 }
      )
    }

    // Step 5: Parallel update
    const updates = await Promise.all(
      orders.map((order) =>
        supabase
          .from('salon_menus')
          .update({ sort_order: order.sort_order })
          .eq('id', order.id)
          .eq('salon_id', salonId)
      )
    )

    // Step 6: Check for failures
    const failed = updates.filter((u) => u.error)
    if (failed.length > 0) {
      console.error('[PATCH /api/menus/reorder] Failed updates:', failed.map((u) => u.error))
      return NextResponse.json(errorResponse('Some updates failed'), { status: 500 })
    }

    // Step 7: Return success
    return NextResponse.json(
      successResponse<ReorderResponse>({ updated_count: orders.length }),
      { status: 200 }
    )
  } catch (error) {
    console.error(
      '[PATCH /api/menus/reorder] Unexpected error:',
      error instanceof Error ? error.stack : error
    )
    return NextResponse.json(errorResponse('Internal Server Error'), { status: 500 })
  }
}
