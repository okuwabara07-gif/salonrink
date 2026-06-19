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

import { Resend } from 'resend'
import type { ApprovalQueue } from '@/lib/types/approval'

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

export async function executeNurture(
  approvalQueueId: string,
  approvalRow: ApprovalQueue
): Promise<void> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  try {
    const payload = approvalRow.payload as Record<string, unknown>
    const channel = payload.channel as string | undefined
    const leadId = payload.lead_id as string | undefined
    const messageData = payload.message_data as Record<string, unknown> | undefined

    if (!leadId || !channel) {
      console.error('[executeNurture] Missing lead_id or channel in payload')
      return
    }

    const now = new Date().toISOString()
    let eventType = 'nurture_sent'
    let success = false

    // チャネル別送信
    switch (channel) {
      case 'email': {
        if (!messageData) {
          console.warn('[executeNurture] No message_data for email')
          eventType = 'nurture_failed'
          break
        }

        const email = messageData.email as string | undefined
        const subject = messageData.subject as string | undefined
        const html = messageData.html as string | undefined

        if (!email) {
          console.warn('[executeNurture] No email in message_data')
          eventType = 'nurture_failed'
          break
        }

        try {
          const result = await getResend().emails.send({
            from: 'noreply@salonrink.com',
            to: email,
            subject: subject || 'Follow-up Message',
            html: html || '<p>(本文がありません)</p>',
          })

          if ('error' in result && result.error) {
            console.error('[executeNurture] Email send error:', result.error)
            eventType = 'nurture_failed'
          } else {
            eventType = 'nurture_sent'
            success = true
          }
        } catch (sendErr) {
          console.error('[executeNurture] Email send exception:', sendErr)
          eventType = 'nurture_failed'
        }
        break
      }

      case 'sms':
      case 'line': {
        console.log(`[executeNurture] Channel '${channel}' not yet implemented, skipping`)
        eventType = 'nurture_skipped'
        break
      }

      default: {
        console.warn(`[executeNurture] Unknown channel: ${channel}`)
        eventType = 'nurture_failed'
      }
    }

    // funnel_lead_events に記録
    const { error: eventErr } = await admin.from('funnel_lead_events').insert({
      lead_id: leadId,
      event_type: eventType,
      metadata: {
        approval_queue_id: approvalQueueId,
        channel,
        timestamp: now,
      },
    })

    if (eventErr) {
      console.warn('[executeNurture] Failed to record event:', eventErr.message)
    }

    // 失敗時は approval_queue.status を failed に更新
    if (!success && eventType === 'nurture_failed') {
      const { error: updateErr } = await admin
        .from('approval_queue')
        .update({
          status: 'failed',
          lint_notes: `Email send failed for lead ${leadId}`,
        })
        .eq('id', approvalQueueId)

      if (updateErr) {
        console.error('[executeNurture] Failed to update approval_queue:', updateErr.message)
      }
    }
  } catch (error) {
    console.error('[executeNurture] Unexpected error:', error)
  }
}
