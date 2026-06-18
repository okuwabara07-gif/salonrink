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

    // Step 2: 朝cronの正解パターンで宛先を取得
    const { getActiveOwnerLineUserId } = await import('@/lib/line/owner-push')
    const ownerLineUserId = await getActiveOwnerLineUserId()

    if (!ownerLineUserId) {
      console.error('[owner-text-test] No active owner found')
      return errorResponse('No active owner_line_links found', 404)
    }

    // デバッグ: トークン・宛先の確認
    const token = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN
    const tokenExists = token && token.length > 0
    const toExists = ownerLineUserId && ownerLineUserId.length > 0
    console.log('[owner-text-test] Debug:', { tokenExists, toExists })

    // Step 3: シンプルテキストメッセージを push
    const { pushOwnerTextTest } = await import('@/lib/line/owner-push')
    try {
      await pushOwnerTextTest(ownerLineUserId)
    } catch (pushErr) {
      const errMsg = pushErr instanceof Error ? pushErr.message : String(pushErr)
      console.error('[owner-text-test] pushOwnerTextTest error:', errMsg)
      return errorResponse(`Push failed: ${errMsg} (tokenExists=${tokenExists}, toExists=${toExists})`, 500)
    }

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
