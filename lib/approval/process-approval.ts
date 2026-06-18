/**
 * processApproval
 * 承認キュー処理の核となる関数
 *
 * Flow:
 * 1. approval_queue から該当行を取得
 * 2. status を decision に更新 + decision_by, decision_at をセット
 * 3. decision='approved' 時のみ kind 別実行関数呼び出し
 * 4. funnel_lead_events にイベント記録
 *
 * 戻り値: {ok: boolean, status?: string, executedCount: number, error?: string}
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { ApprovalQueue } from '@/lib/types/approval'

export interface ProcessApprovalResult {
  ok: boolean
  status?: string
  executedCount: number
  error?: string
  kind?: string
}

export async function processApproval(
  approvalId: string,
  decision: 'approved' | 'rejected',
  decidedBy: string | null
): Promise<ProcessApprovalResult> {
  const admin = createAdminClient()

  try {
    // Step 1: approval_queue から該当行を取得
    const { data: approvalRow, error: fetchError } = await admin
      .from('approval_queue')
      .select('*')
      .eq('id', approvalId)
      .maybeSingle() as { data: ApprovalQueue | null; error: Record<string, unknown> | null }

    if (fetchError) {
      console.error('[processApproval] Fetch error:', fetchError.message)
      return { ok: false, executedCount: 0, error: 'Failed to fetch approval queue' }
    }

    if (!approvalRow) {
      return { ok: false, executedCount: 0, error: 'Approval queue not found' }
    }

    const now = new Date().toISOString()

    // Step 2: approval_queue を更新
    const { data: updated, error: updateError } = await admin
      .from('approval_queue')
      .update({
        status: decision,
        decision_by: decidedBy,
        decision_at: now,
      })
      .eq('id', approvalId)
      .select('*')
      .maybeSingle() as { data: ApprovalQueue | null; error: Record<string, unknown> | null }

    if (updateError) {
      console.error('[processApproval] Update error:', updateError.message)
      return { ok: false, executedCount: 0, error: 'Failed to update approval queue' }
    }

    if (!updated) {
      return { ok: false, executedCount: 0, error: 'Failed to update approval queue' }
    }

    // Step 3: decision='approved' の場合のみ実行関数呼び出し
    let executedCount = 0

    if (decision === 'approved') {
      try {
        // Lazy import: 関数内で遅延生成
        const { executeSns } = await import('@/lib/approval/execute-sns')
        const { executeNurture } = await import('@/lib/approval/execute-nurture')
        const { executeOutbound } = await import('@/lib/approval/execute-outbound')

        switch (approvalRow.kind) {
          case 'sns_post':
            await executeSns(approvalId, approvalRow)
            executedCount = 1
            break
          case 'nurture_msg':
            if (approvalRow.lead_id) {
              await executeNurture(approvalId, approvalRow)
              executedCount = 1
            }
            break
          case 'outbound':
            await executeOutbound(approvalId, approvalRow)
            executedCount = 1
            break
          case 'product_push':
            await executeOutbound(approvalId, approvalRow)
            executedCount = 1
            break
          default:
            console.warn(`[processApproval] Unknown kind: ${approvalRow.kind}`)
        }
      } catch (execErr) {
        console.error('[processApproval] Execution error:', execErr)
        // 実行関数失敗でも approval_queue は updated 状態を保つ
      }
    }

    // Step 4: funnel_lead_events にイベント記録（lead_id がある場合のみ）
    if (approvalRow.lead_id) {
      const { error: eventError } = await admin
        .from('funnel_lead_events')
        .insert({
          lead_id: approvalRow.lead_id,
          event_type: `approval_${decision}`,
          metadata: {
            approval_queue_id: approvalId,
            kind: approvalRow.kind,
            executed_count: executedCount,
          },
        })

      if (eventError) {
        console.warn('[processApproval] Event insert error:', eventError.message)
      }
    }

    return {
      ok: true,
      status: decision,
      executedCount,
      kind: approvalRow.kind,
    }
  } catch (error) {
    console.error('[processApproval] Unexpected error:', error)
    return {
      ok: false,
      executedCount: 0,
      error: error instanceof Error ? error.message : 'Internal server error',
    }
  }
}
