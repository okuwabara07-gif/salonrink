/**
 * executeSns
 * 承認済みSNS投稿を予約/配信
 *
 * Flow:
 * 1. approval_queue.payload から sns_queue_id 抽出
 * 2. sns_queue レコードを取得
 * 3. プラットフォーム別実行：
 *    - ig: Instagram Graph API
 *    - x: X API v2
 *    - tiktok: TikTok Content Posting API
 *    - yt: YouTube Data API
 * 4. 成功 → sns_queue.status='scheduled' or 'published'
 * 5. エラー → sns_queue.status='failed'
 * 6. ログ出力
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { ApprovalQueue } from '@/lib/types/approval'

export async function executeSns(
  approvalQueueId: string,
  approvalRow: ApprovalQueue
): Promise<void> {
  const admin = createAdminClient()

  try {
    const payload = approvalRow.payload as Record<string, unknown>
    const sns_queue_id = payload.sns_queue_id as string | undefined

    if (!sns_queue_id) {
      console.warn('[executeSns] Missing sns_queue_id in payload')
      return
    }

    // sns_queue レコード取得
    const { data: snsRow, error: fetchError } = await admin
      .from('sns_queue')
      .select('*')
      .eq('id', sns_queue_id)
      .maybeSingle()

    if (fetchError || !snsRow) {
      console.error('[executeSns] Fetch sns_queue error:', fetchError?.message)
      return
    }

    const now = new Date().toISOString()
    const snsData = snsRow as Record<string, unknown>
    const site = snsData.site as string
    const platform = snsData.platform as string
    const caption = snsData.caption as string | undefined

    // プラットフォーム別実行
    switch (platform) {
      case 'ig': {
        // TODO: Instagram Graph API integration
        console.log(`[executeSns] Instagram posting to ${site}: "${caption}"`)
        // scheduled のままにする（手動スケジュール）
        break
      }

      case 'x': {
        // TODO: X API v2 integration
        console.log(`[executeSns] X posting to ${site}: "${caption}"`)
        break
      }

      case 'tiktok': {
        // TODO: TikTok Content Posting API integration
        console.log(`[executeSns] TikTok posting to ${site}: "${caption}"`)
        break
      }

      case 'yt': {
        // TODO: YouTube Data API integration
        console.log(`[executeSns] YouTube posting to ${site}: "${caption}"`)
        break
      }

      default:
        console.warn(`[executeSns] Unknown platform: ${platform}`)
        return
    }

    // Status を scheduled に更新
    const { error: updateError } = await admin
      .from('sns_queue')
      .update({
        status: 'scheduled',
        scheduled_at: now,
      })
      .eq('id', sns_queue_id)

    if (updateError) {
      console.error('[executeSns] Update error:', updateError.message)
    } else {
      console.log(`[executeSns] SNS queue scheduled: ${sns_queue_id}`)
    }
  } catch (error) {
    console.error('[executeSns] Unexpected error:', error)
  }
}
