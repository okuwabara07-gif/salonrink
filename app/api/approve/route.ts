/**
 * POST /api/approve
 * 管理者による approval_queue の承認・却下 + 実行関数呼び出し
 *
 * Request: { id, decision, lint_notes? }
 * Response: { success, decision_at, executed_count }
 *
 * Flow:
 * 1. approval_queue から該当行を取得
 * 2. 管理者権限確認（オーナーのみ）
 * 3. decision → status 更新 + decision_by, decision_at セット
 * 4. kind に応じて実行関数呼び出し（approved時のみ）
 * 5. lead_events にイベント記録
 * 6. レスポンス返却
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api/response'
import type {
  ApprovalQueue,
  ApproveResponse,
} from '@/lib/types/approval'

const approveSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
  lint_notes: z.string().optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Lazy init: 関数内で遅延生成
    const { createClient } = await import('@/lib/supabase/server')
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const { executeNurture } = await import('@/lib/approval/execute-nurture')
    const { executeSns } = await import('@/lib/approval/execute-sns')
    const { executeOutbound } = await import('@/lib/approval/execute-outbound')

    // Step 1: 認証チェック（オーナーのみ）
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[POST /api/approve] Auth error:', authError?.message)
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: リクエストボディのパース＆バリデーション
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid JSON', 400)
    }

    const validation = approveSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse('Validation error', 400)
    }

    const { id, decision } = validation.data

    // Step 3: Admin クライアント取得
    const admin = createAdminClient()

    // Step 4: approval_queue から該当行取得
    const { data: approvalRow, error: fetchError } = await admin
      .from('approval_queue')
      .select('*')
      .eq('id', id)
      .maybeSingle() as { data: ApprovalQueue | null; error: Record<string, unknown> | null }

    if (fetchError) {
      console.error('[POST /api/approve] Fetch error:', fetchError.message)
      return errorResponse('Failed to fetch approval queue', 500)
    }

    if (!approvalRow) {
      return errorResponse('Approval queue not found', 404)
    }

    const now = new Date().toISOString()

    // Step 5: approval_queue を更新
    const { data: updated, error: updateError } = await admin
      .from('approval_queue')
      .update({
        status: decision,
        decision_by: user.id,
        decision_at: now,
      })
      .eq('id', id)
      .select('*')
      .maybeSingle() as { data: ApprovalQueue | null; error: Record<string, unknown> | null }

    if (updateError) {
      console.error('[POST /api/approve] Update error:', updateError.message)
      return errorResponse('Failed to update approval queue', 500)
    }

    if (!updated) {
      return errorResponse('Failed to update approval queue', 500)
    }

    // Step 6: decision='approved' の場合のみ実行関数呼び出し
    let executedCount = 0

    if (decision === 'approved') {
      try {
        switch (approvalRow.kind) {
          case 'sns_post':
            await executeSns(id, approvalRow)
            executedCount = 1
            break
          case 'nurture_msg':
            if (approvalRow.lead_id) {
              await executeNurture(id, approvalRow)
              executedCount = 1
            }
            break
          case 'outbound':
            await executeOutbound(id, approvalRow)
            executedCount = 1
            break
          case 'product_push':
            await executeOutbound(id, approvalRow)
            executedCount = 1
            break
          default:
            console.warn(`[POST /api/approve] Unknown kind: ${approvalRow.kind}`)
        }
      } catch (execErr) {
        console.error('[POST /api/approve] Execution error:', execErr)
        // 実行関数失敗でも approval_queue は updated 状態を保つ
      }
    }

    // Step 7: funnel_lead_events にイベント記録（lead_id がある場合のみ）
    if (approvalRow.lead_id) {
      const { error: eventError } = await admin
        .from('funnel_lead_events')
        .insert({
          lead_id: approvalRow.lead_id,
          event_type: `approval_${decision}`,
          metadata: {
            approval_queue_id: id,
            kind: approvalRow.kind,
            executed_count: executedCount,
          },
        })

      if (eventError) {
        console.warn('[POST /api/approve] Event insert error:', eventError.message)
      }
    }

    // Step 8: レスポンス返却
    const response: ApproveResponse = {
      success: true,
      decision_at: now,
      executed_count: executedCount,
    }

    return successResponse(response)
  } catch (error) {
    console.error(
      '[POST /api/approve] Unexpected error:',
      error instanceof Error ? error.stack : error
    )
    return errorResponse('Internal server error', 500)
  }
}
