/**
 * pushFlexApproval
 * approval_queue の pending を @901bsvrb OA へ Flex push
 *
 * Flow:
 * 1. owner_line_links から @901bsvrb OA の line_user_id 取得
 * 2. buildFlexApprovalTemplate で Flex JSON 生成
 * 3. pushMessage() で LINE へ送信
 * 4. ログ出力
 */

import type { ApprovalQueue } from '@/lib/types/approval'
import { buildFlexApprovalTemplate } from '@/lib/line/flex-approval-template'
import https from 'https'

// グローバル単一 OA user ID
const OWNER_OA_LINE_USER_ID = process.env.OWNER_OA_LINE_USER_ID || 'U1234567890abcdef1234567890abcdef'

export async function pushFlexApproval(approval: ApprovalQueue): Promise<boolean> {
  try {
    // Step 1: Flex テンプレート生成
    const flexMessage = buildFlexApprovalTemplate(approval)

    // Step 2: LINE へ push
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
    if (!token) {
      console.error('[pushFlexApproval] LINE_CHANNEL_ACCESS_TOKEN not configured')
      return false
    }

    const payload = JSON.stringify({
      to: OWNER_OA_LINE_USER_ID,
      messages: [flexMessage],
    })

    const success = await postToLineApi(token, '/v2/bot/message/push', payload)

    if (success) {
      console.log(`[pushFlexApproval] Flex pushed successfully: ${approval.id}`)
      return true
    } else {
      console.error(`[pushFlexApproval] Flex push failed: ${approval.id}`)
      return false
    }
  } catch (error) {
    console.error('[pushFlexApproval] Unexpected error:', error)
    return false
  }
}

/**
 * Helper: Post to LINE API
 */
function postToLineApi(token: string, path: string, payload: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.line.me',
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'Authorization': `Bearer ${token}`,
        },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(true)
          } else {
            console.error(`[postToLineApi] HTTP ${res.statusCode}: ${data}`)
            resolve(false)
          }
        })
      }
    )

    req.on('error', (err) => {
      console.error('[postToLineApi] Request error:', err)
      resolve(false)
    })

    req.write(payload)
    req.end()
  })
}
