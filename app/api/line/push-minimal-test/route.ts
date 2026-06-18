/**
 * GET /api/line/push-minimal-test
 * 最小 bubble を owner に push（デバッグ用）
 *
 * 目的: push 宛先・トークンが正常か確認
 * 期待: "test" メッセージが owner の LINE に届く
 *
 * 認証: Supabase セッション必須
 */

import { NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(): Promise<NextResponse> {
  try {
    // Step 1: 認証チェック
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: owner_line_links から line_user_id を取得（朝サマリーと同じ）
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()

    const { data: ownerLink, error: fetchError } = await admin
      .from('owner_line_links')
      .select('line_user_id')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (fetchError || !ownerLink) {
      console.error('[push-minimal-test] Fetch error:', fetchError?.message)
      return errorResponse('No active owner_line_links found', 404)
    }

    const ownerLineUserId = ownerLink.line_user_id

    // Step 3: 最小 bubble を push
    const { pushMinimalBubbleToOwner } = await import('@/lib/line/owner-push')
    await pushMinimalBubbleToOwner(ownerLineUserId)

    console.log(`[push-minimal-test] Success: pushed to ${ownerLineUserId}`)

    return successResponse({
      success: true,
      message: `Minimal bubble sent to owner (${ownerLineUserId})`,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[push-minimal-test] ERROR:', errMsg)
    return errorResponse(`Test failed: ${errMsg}`, 500)
  }
}
