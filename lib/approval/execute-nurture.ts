/**
 * executeNurture
 * 承認済みフォローシーケンスを実行（Email/SMS/LINE）
 *
 * Flow:
 * 1. approval_queue.payload から channel, message_template 抽出
 * 2. nurture_queue から該当レコードを取得
 * 3. チャネル別送信：
 *    - email: Resend
 *    - sms: Twilio
 *    - line: pushMessage()
 * 4. 送信成功 → nurture_queue.status='sent' + sent_at
 * 5. エラー → nurture_queue.status='failed'
 * 6. ログ出力
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import type { ApprovalQueue } from '@/lib/types/approval'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function executeNurture(
  approvalQueueId: string,
  approvalRow: ApprovalQueue
): Promise<void> {
  const admin = createAdminClient()

  try {
    const payload = approvalRow.payload as Record<string, unknown>
    const { channel, nurture_queue_id, lead_id, message_data } = payload

    if (!nurture_queue_id || !lead_id) {
      console.warn('[executeNurture] Missing nurture_queue_id or lead_id in payload')
      return
    }

    // nurture_queue レコード取得
    const { data: nurtureRow, error: fetchError } = await admin
      .from('nurture_queue')
      .select('*')
      .eq('id', nurture_queue_id)
      .maybeSingle()

    if (fetchError || !nurtureRow) {
      console.error('[executeNurture] Fetch nurture_queue error:', fetchError?.message)
      return
    }

    const now = new Date().toISOString()

    // チャネル別送信
    switch (channel) {
      case 'email': {
        const msgData = message_data as Record<string, unknown>
        const email = msgData.email as string | undefined
        if (!email) {
          console.warn('[executeNurture] No email in message_data')
          return
        }

        const result = await resend.emails.send({
          from: 'noreply@salonrink.com',
          to: email,
          subject: (msgData.subject as string) || 'Follow-up Message',
          html: (msgData.html as string) || '',
        })

        if ('error' in result && result.error) {
          console.error('[executeNurture] Email send failed:', result.error)
          // Update to failed
          await admin
            .from('nurture_queue')
            .update({ status: 'failed' })
            .eq('id', nurture_queue_id)
        } else {
          console.log('[executeNurture] Email sent successfully')
          // Update to sent
          await admin
            .from('nurture_queue')
            .update({ status: 'sent', sent_at: now })
            .eq('id', nurture_queue_id)
        }
        break
      }

      case 'sms': {
        // TODO: Twilio SMS integration
        console.log('[executeNurture] SMS sending not yet implemented')
        await admin
          .from('nurture_queue')
          .update({ status: 'pending' })
          .eq('id', nurture_queue_id)
        break
      }

      case 'line': {
        // TODO: LINE push via pushMessage()
        console.log('[executeNurture] LINE push not yet implemented')
        await admin
          .from('nurture_queue')
          .update({ status: 'pending' })
          .eq('id', nurture_queue_id)
        break
      }

      default:
        console.warn(`[executeNurture] Unknown channel: ${channel}`)
    }
  } catch (error) {
    console.error('[executeNurture] Unexpected error:', error)
  }
}
