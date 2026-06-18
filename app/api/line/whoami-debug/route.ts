/**
 * GET /api/line/whoami-debug
 * Owner webhook が最後に受け取った source.userId を返す（デバッグ用）
 *
 * 用途:
 * 1. whoami を @901bsvrb に送信
 * 2. ブラウザで GET /api/line/whoami-debug
 * 3. レスポンス: { source_user_id: "U...", event_type: "...", received_at: "..." }
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
      console.error('[GET /api/line/whoami-debug] Auth error:', authError?.message)
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: 最新の owner_webhook_debug レコードを取得
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()

    const { data: latest, error: fetchError } = await admin
      .from('owner_webhook_debug')
      .select('source_user_id, event_type, received_at')
      .order('received_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      console.error('[GET /api/line/whoami-debug] Fetch error:', fetchError.message)
      return errorResponse('Failed to fetch debug data', 500)
    }

    if (!latest) {
      return errorResponse('No webhook received yet', 404)
    }

    return successResponse(latest)
  } catch (error) {
    console.error(
      '[GET /api/line/whoami-debug] Unexpected error:',
      error instanceof Error ? error.stack : error
    )
    return errorResponse('Internal server error', 500)
  }
}
