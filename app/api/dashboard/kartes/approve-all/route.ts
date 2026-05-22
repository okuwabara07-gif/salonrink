/**
 * POST /api/dashboard/kartes/approve-all
 *
 * すべての承認待ちカルテを一括承認
 * - 認証チェック
 * - salon 特定
 * - status='pending' のカルテをすべて status='approved' に更新
 * - approved_at に現在時刻をセット
 * - 承認件数を返す
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'

interface ApprovedKarteId {
  id: string
}

interface ApproveAllResponse {
  approved_count: number
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: 認証チェック
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[POST /api/dashboard/kartes/approve-all] Auth error:', authError?.message)
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: salon 特定
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError) {
      console.error('[POST /api/dashboard/kartes/approve-all] Salon lookup error:', salonError.message)
      return errorResponse('Salon lookup failed', 500)
    }

    if (!salon) {
      return errorResponse('Salon not found', 403)
    }

    const salonId = salon.id as string
    const now = new Date().toISOString()

    // Step 3: 全 pending カルテを一括承認
    const { data: approved, error: updateError } = await supabase
      .from('kartes')
      .update({ status: 'approved', approved_at: now })
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .select('id') as { data: ApprovedKarteId[] | null; error: any }

    if (updateError) {
      console.error('[POST /api/dashboard/kartes/approve-all] Update error:', updateError.message)
      return errorResponse('Failed to approve kartes', 500)
    }

    // Step 4: レスポンス返却
    const approvedCount = (approved || []).length
    return successResponse<ApproveAllResponse>({ approved_count: approvedCount })
  } catch (error) {
    console.error(
      '[POST /api/dashboard/kartes/approve-all] Unexpected error:',
      error instanceof Error ? error.stack : error
    )
    return errorResponse('Internal server error', 500)
  }
}
