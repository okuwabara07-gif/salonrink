/**
 * executeOutbound
 * 承認済み外部連携：Stripe顧客同期 / Slack通知 / 外部Webhook送信
 *
 * Flow:
 * 1. approval_queue.payload から outbound_type, webhook_url 抽出
 * 2. タイプ別実行：
 *    - stripe_sync: Stripe顧客情報を同期
 *    - slack_notify: Slack へ通知送信
 *    - webhook: 外部Webhook へ POST
 * 3. 成功 → ログに記録
 * 4. エラー → ログに記録（通知失敗は non-critical）
 */

import type { ApprovalQueue } from '@/lib/types/approval'
import https from 'https'
import http from 'http'

export async function executeOutbound(
  approvalQueueId: string,
  approvalRow: ApprovalQueue
): Promise<void> {
  try {
    const payload = approvalRow.payload as Record<string, unknown>
    const outbound_type = payload.outbound_type as string | undefined
    const webhook_url = payload.webhook_url as string | undefined
    const payload_data = payload.payload_data as Record<string, unknown> | undefined

    switch (outbound_type) {
      case 'stripe_sync': {
        // TODO: Stripe customer sync
        console.log('[executeOutbound] Stripe sync not yet implemented')
        break
      }

      case 'slack_notify': {
        // TODO: Slack webhook
        const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
        if (!slackWebhookUrl) {
          console.warn('[executeOutbound] SLACK_WEBHOOK_URL not configured')
          break
        }

        const slackMessage = {
          text: (payload_data?.message as string) || '承認完了',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✅ *Approval Executed*\nID: ${approvalQueueId}\nKind: ${approvalRow.kind}`,
              },
            },
          ],
        }

        try {
          await postToWebhook(slackWebhookUrl, slackMessage)
          console.log('[executeOutbound] Slack notification sent')
        } catch (slackErr) {
          console.error('[executeOutbound] Slack notification failed:', slackErr)
        }
        break
      }

      case 'webhook': {
        if (!webhook_url) {
          console.warn('[executeOutbound] webhook_url not provided')
          break
        }

        try {
          await postToWebhook(webhook_url, payload_data || {})
          console.log(`[executeOutbound] Webhook posted to ${webhook_url}`)
        } catch (webhookErr) {
          console.error('[executeOutbound] Webhook post failed:', webhookErr)
        }
        break
      }

      default:
        console.warn(`[executeOutbound] Unknown outbound_type: ${outbound_type}`)
    }
  } catch (error) {
    console.error('[executeOutbound] Unexpected error:', error)
  }
}

/**
 * Helper: Post to webhook
 */
function postToWebhook(url: string, payload: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url)
      const isHttps = parsedUrl.protocol === 'https:'
      const httpModule = isHttps ? https : http

      const data = JSON.stringify(payload)

      const req = httpModule.request(
        {
          hostname: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
        },
        (res: unknown) => {
          const response = res as { statusCode?: number; on: (event: string, handler: (chunk: unknown) => void) => void }
          let body = ''
          response.on('data', (chunk: unknown) => {
            body += chunk
          })
          response.on('end', () => {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
              resolve()
            } else {
              reject(new Error(`HTTP ${response.statusCode}: ${body}`))
            }
          })
        }
      )

      req.on('error', reject)
      req.write(data)
      req.end()
    } catch (err) {
      reject(err)
    }
  })
}
