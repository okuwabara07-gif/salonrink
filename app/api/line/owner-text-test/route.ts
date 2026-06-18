/**
 * GET /api/line/owner-text-test
 * owner_line_links.line_user_id へシンプルテキストメッセージを送信（デバッグ用）
 *
 * 目的: 宛先・トークンが正常か切り分け
 * 期待: LINE に「最小テスト」テキストが届く
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
      console.error('[owner-text-test] Fetch error:', fetchError?.message)
      return errorResponse('No active owner_line_links found', 404)
    }

    const ownerLineUserId = ownerLink.line_user_id

    // Step 3: シンプルテキストメッセージを push
    const { pushOwnerTextTest } = await import('@/lib/line/owner-push')
    await pushOwnerTextTest(ownerLineUserId)

    console.log(`[owner-text-test] Success: sent to ${ownerLineUserId}`)

    return successResponse({
      success: true,
      message: `Text message sent to owner (${ownerLineUserId})`,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[owner-text-test] ERROR:', errMsg)
    return errorResponse(`Test failed: ${errMsg}`, 500)
  }
}
