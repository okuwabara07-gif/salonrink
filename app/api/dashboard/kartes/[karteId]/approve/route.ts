/**
 * PATCH /api/dashboard/kartes/[karteId]/approve
 *
 * 個別カルテを承認
 * - 認証チェック
 * - salon 特定
 * - 該当カルテを status='pending' から status='approved' に更新
 * - approved_at に現在時刻をセット
 * - 他サロンのカルテ操作を防ぐ
 * - 既承認カルテの二重承認を防ぐ
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'

interface ApprovedKarte {
  id: string
  status: string
  approved_at: string
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ karteId: string }> }
): Promise<NextResponse> {
  try {
    const { karteId } = await props.params

    if (!karteId) {
      return errorResponse('Missing karteId', 400)
    }

    // Step 1: 認証チェック
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[PATCH /api/dashboard/kartes/[karteId]/approve] Auth error:', authError?.message)
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: salon 特定
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError) {
      console.error('[PATCH /api/dashboard/kartes/[karteId]/approve] Salon lookup error:', salonError.message)
      return errorResponse('Salon lookup failed', 500)
    }

    if (!salon) {
      return errorResponse('Salon not found', 403)
    }

    const salonId = salon.id as string
    const now = new Date().toISOString()

    // Step 3: カルテを承認に更新（権限チェック + 二重承認防止）
    const { data: approved, error: updateError } = await supabase
      .from('kartes')
      .update({ status: 'approved', approved_at: now })
      .eq('id', karteId)
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .select('id, status, approved_at')
      .maybeSingle() as { data: ApprovedKarte | null; error: any }

    if (updateError) {
      console.error('[PATCH /api/dashboard/kartes/[karteId]/approve] Update error:', updateError.message)
      return errorResponse('Failed to approve karte', 500)
    }

    if (!approved) {
      return errorResponse('Karte not found or already approved', 404)
    }

    // Step 4: レスポンス返却
    return successResponse({ data: approved })
  } catch (error) {
    console.error(
      '[PATCH /api/dashboard/kartes/[karteId]/approve] Unexpected error:',
      error instanceof Error ? error.stack : error
    )
    return errorResponse('Internal server error', 500)
  }
}
