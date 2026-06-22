import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import { pushFlexToOwner } from '@/lib/line/owner-push'
import type { FlexMessage } from '@/lib/line-messages/owner-morning-flex'

// LINE signature verification (owner OA global secret)
function verifyOwnerLineSignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64')
  return hash === signature
}

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok', service: 'owner-webhook' }), { status: 200 })
}

export async function POST(request: Request) {
  try {
    const channelSecret = process.env.LINE_OWNER_CHANNEL_SECRET
    const channelToken = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN

    if (!channelSecret || !channelToken) {
      console.error('LINE owner credentials not configured')
      return new Response(JSON.stringify({ error: 'LINE owner credentials missing' }), { status: 404 })
    }

    // Signature verification
    const signature = request.headers.get('x-line-signature') || ''
    const body = await request.text()

    const signatureValid = verifyOwnerLineSignature(body, signature, channelSecret)

    if (!signatureValid) {
      console.error('[Owner OA] Signature verification failed', {
        signature,
        bodyLength: body.length,
        channelSecretLength: channelSecret.length,
      })
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 403 })
    }

    // Signature verification passed - process events even if empty
    const events = body ? (JSON.parse(body).events || []) : []

    for (const event of events) {
      await handleOwnerEvent(event)
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
  } catch (error) {
    console.error('LINE owner webhook error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

interface LineEvent {
  type: string
  source: { userId: string; channelToken?: string }
  replyToken: string
  message?: { type: string; text?: string }
  postback?: { data: string }
}

async function handleOwnerEvent(event: LineEvent) {

  if (event.type === 'follow') {
    await handleOwnerFollow(event)
  } else if (event.type === 'unfollow') {
    await handleOwnerUnfollow(event)
  } else if (event.type === 'message' && event.message?.type === 'text') {
    await handleOwnerMessage(event as LineEvent & { message: { type: 'text'; text: string } })
  } else if (event.type === 'postback') {
    await handleOwnerPostback(event as LineEvent & { postback: { data: string } })
  }
}

async function handleOwnerFollow(event: LineEvent) {
  const userId = event.source.userId

  console.log(`[Owner OA] New follow: userId=${userId}`)

  // 挨拶メッセージを push で送信（reply 廃止）
  try {
    const flex: FlexMessage = {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'SalonRink Concierge へようこそ！',
            weight: 'bold',
            size: 'lg',
          },
          {
            type: 'text',
            text: 'このアカウントは、サロンオーナー向けの朝7時・夜21時の営業サマリーをお届けしています。',
            size: 'sm',
            color: '#999999',
            margin: 'md',
            wrap: true,
          },
          {
            type: 'text',
            text: 'ご不明な点は「ヘルプ」とお送りください。',
            size: 'sm',
            color: '#999999',
            margin: 'md',
            wrap: true,
          },
        ],
      },
    }
    await pushFlexToOwner(userId, 'ようこそ', flex)
  } catch (err) {
    console.error('[Owner OA] Failed to send greeting:', err)
  }
}

async function handleOwnerUnfollow(event: LineEvent) {
  const userId = event.source.userId
  const supabase = createAdminClient()

  console.log(`[Owner OA] Unfollow: userId=${userId}`)

  // owner_line_links の status を 'unlinked' に更新
  const { error } = await supabase
    .from('owner_line_links')
    .update({ status: 'unlinked' })
    .eq('line_user_id', userId)

  if (error) {
    console.error('[Owner OA] Failed to update unfollow status:', error)
  }
}

async function handleOwnerMessage(event: LineEvent & { message: { type: 'text'; text: string } }) {
  const userId = event.source.userId
  const text = event.message.text

  // Step 1: userId を owner_line_links に保存（@901bsvrb 名前空間で統一）
  try {
    const supabase = createAdminClient()
    const { error: updateError } = await supabase
      .from('owner_line_links')
      .update({ line_user_id: userId })
      .eq('status', 'active')
      .limit(1)

    if (updateError) {
      console.warn('[Owner OA] Failed to update owner_line_links:', updateError.message)
    }
  } catch (err) {
    console.warn('[Owner OA] Error updating owner_line_links:', err)
  }

  if (text.includes('ヘルプ') || text.toLowerCase().includes('help') || text.includes('使い方')) {
    try {
      const flex: FlexMessage = {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'SalonRink Concierge サポート',
              weight: 'bold',
              size: 'lg',
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '朝7時: 本日の予約サマリーをお送りします。',
                  size: 'sm',
                  wrap: true,
                },
                {
                  type: 'text',
                  text: '夜21時: 本日のカルテ自動生成サマリーをお送りします。',
                  size: 'sm',
                  wrap: true,
                },
              ],
            },
            {
              type: 'text',
              text: '配信を一時停止したい場合は、ダッシュボードの設定からお変更ください。',
              size: 'xs',
              color: '#999999',
              margin: 'md',
              wrap: true,
            },
          ],
        },
      }
      await pushFlexToOwner(userId, 'ヘルプ', flex)
    } catch (err) {
      console.error('[Owner OA] Failed to send help:', err)
    }
  }
}

async function handleOwnerPostback(event: LineEvent & { postback: { data: string } }) {
  const userId = event.source.userId
  const data = event.postback.data
  const replyToken = event.replyToken

  // 承認フロー1: postback data = "action=approve&id=<uuid>" または "action=reject&id=<uuid>"
  const legacyMatch = data.match(/action=(approve|reject)&id=([a-f0-9-]+)/)
  if (legacyMatch) {
    const action = legacyMatch[1] // 'approve' or 'reject'
    const approvalId = legacyMatch[2]
    await handleLegacyApproval(userId, action, approvalId)
    return
  }

  // 承認フロー2: postback data = "agentact:approve:<id>" または "agentact:reject:<id>"
  const agentMatch = data.match(/agentact:(approve|reject):([a-f0-9-]+)/)
  if (agentMatch) {
    const action = agentMatch[1] // 'approve' or 'reject'
    const agentActionId = agentMatch[2]
    await handleAgentActionApproval(userId, action, agentActionId)
    return
  }
}

/**
 * 従来の approval_queue 承認（funnel_leads 向け）
 */
async function handleLegacyApproval(userId: string, action: string, approvalId: string) {

  // 認証: 送信者の userId が owner_line_links の active 行と一致するか
  try {
    const supabase = createAdminClient()
    const { data: ownerLink, error: fetchError } = await supabase
      .from('owner_line_links')
      .select('line_user_id')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (fetchError || !ownerLink) {
      console.error('[Owner OA Approval] Failed to fetch owner_line_links:', fetchError?.message)
      return
    }

    const ownerUserId = ownerLink.line_user_id
    if (userId !== ownerUserId) {
      console.warn(`[Owner OA Approval] Unauthorized user ${userId} attempted approval (expected ${ownerUserId})`)
      return
    }
  } catch (err) {
    console.error('[Owner OA Approval] Error verifying userId:', err)
    return
  }

  // 承認処理実行
  try {
    const { processApproval } = await import('@/lib/approval/process-approval')
    const decision = action === 'approve' ? 'approved' : 'rejected'
    const result = await processApproval(approvalId, decision, null)

    if (!result.ok) {
      console.error('[Owner OA Approval] Processing failed:', result.error)
      try {
        const flex: FlexMessage = {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '⚠️ エラー',
                weight: 'bold',
                color: '#ff0000',
              },
              {
                type: 'text',
                text: `${decision === 'approved' ? '承認' : '却下'}に失敗しました: ${result.error}`,
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
            ],
          },
        }
        await pushFlexToOwner(userId, '承認失敗', flex)
      } catch (err) {
        console.error('[Owner OA] Failed to send failure notification:', err)
      }
      return
    }

    const kindLabel = result.kind || 'unknown'
    const actionLabel = decision === 'approved' ? '✅ 承認しました' : '❌ 却下しました'
    const executedLabel = result.executedCount > 0 ? `(実行: ${kindLabel})` : ''

    console.log(`[Owner OA Approval] Success: ${decision} ${approvalId}, executed=${result.executedCount}`)

    try {
      const flex: FlexMessage = {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: actionLabel,
              weight: 'bold',
              size: 'lg',
              color: decision === 'approved' ? '#17c950' : '#ff0000',
            },
            {
              type: 'text',
              text: executedLabel,
              size: 'sm',
              color: '#999999',
              margin: 'md',
            },
          ],
        },
      }
      await pushFlexToOwner(userId, actionLabel, flex)
    } catch (err) {
      console.error('[Owner OA] Failed to send success notification:', err)
    }
  } catch (error) {
    console.error('[Owner OA Approval] Unexpected error:', error)
    try {
      const flex: FlexMessage = {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '⚠️ エラー',
              weight: 'bold',
              color: '#ff0000',
            },
            {
              type: 'text',
              text: 'エラーが発生しました。サポートに連絡してください。',
              size: 'sm',
              wrap: true,
              margin: 'md',
            },
          ],
        },
      }
      await pushFlexToOwner(userId, 'エラー', flex)
    } catch (err) {
      console.error('[Owner OA] Failed to send error notification:', err)
    }
  }
}

/**
 * SDR agent_actions 承認（営業アウトバウンド向け）
 */
async function handleAgentActionApproval(userId: string, action: string, agentActionId: string) {
  // 認証: 送信者の userId が owner_line_links の active 行と一致するか
  try {
    const supabase = createAdminClient()
    const { data: ownerLink, error: fetchError } = await supabase
      .from('owner_line_links')
      .select('line_user_id')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (fetchError || !ownerLink) {
      console.error('[Agent Action Approval] Failed to fetch owner_line_links:', fetchError?.message)
      return
    }

    const ownerUserId = ownerLink.line_user_id
    if (userId !== ownerUserId) {
      console.warn(`[Agent Action Approval] Unauthorized user ${userId} attempted approval (expected ${ownerUserId})`)
      return
    }
  } catch (err) {
    console.error('[Agent Action Approval] Error verifying userId:', err)
    return
  }

  // agent_actions から該当行を取得
  try {
    const supabase = createAdminClient()
    const { data: agentAction, error: fetchErr } = await supabase
      .from('agent_actions')
      .select('*')
      .eq('id', agentActionId)
      .maybeSingle()

    if (fetchErr || !agentAction) {
      console.error('[Agent Action Approval] Failed to fetch agent_action:', fetchErr?.message)
      try {
        const flex: FlexMessage = {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '⚠️ エラー',
                weight: 'bold',
                color: '#ff0000',
              },
              {
                type: 'text',
                text: 'エージェントアクションが見つかりません。',
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
            ],
          },
        }
        await pushFlexToOwner(userId, 'エラー', flex)
      } catch (err) {
        console.error('[Agent Action Approval] Failed to send error notification:', err)
      }
      return
    }

    const now = new Date().toISOString()
    const decision = action === 'approve' ? 'approved' : 'rejected'

    // agent_actions を更新（status, decided_at, result）
    const { error: updateErr } = await supabase
      .from('agent_actions')
      .update({
        status: decision,
        decided_at: now,
        result: {
          decided_by: userId,
          decided_at: now,
          decision_message: `${decision} by owner via LINE`,
        },
      })
      .eq('id', agentActionId)

    if (updateErr) {
      console.error('[Agent Action Approval] Update error:', updateErr)
      try {
        const flex: FlexMessage = {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '⚠️ エラー',
                weight: 'bold',
                color: '#ff0000',
              },
              {
                type: 'text',
                text: `${decision === 'approved' ? '承認' : '却下'}に失敗しました。`,
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
            ],
          },
        }
        await pushFlexToOwner(userId, '承認失敗', flex)
      } catch (err) {
        console.error('[Agent Action Approval] Failed to send failure notification:', err)
      }
      return
    }

    // decision='approved' の場合のみ実行関数呼び出し
    let executedCount = 0
    if (decision === 'approved') {
      try {
        const { executeAgentOutbound } = await import('@/lib/approval/execute-agent-outbound')
        await executeAgentOutbound(agentActionId, agentAction)
        executedCount = 1
        console.log(`[Agent Action Approval] Executed agent_action ${agentActionId}`)
      } catch (execErr) {
        console.error('[Agent Action Approval] Execution error:', execErr)
      }
    }

    const actionLabel = decision === 'approved' ? '✅ 承認しました' : '❌ 却下しました'

    console.log(`[Agent Action Approval] Success: ${decision} ${agentActionId}, executed=${executedCount}`)

    try {
      const flex: FlexMessage = {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: actionLabel,
              weight: 'bold',
              size: 'lg',
              color: decision === 'approved' ? '#06C755' : '#ff0000',
            },
            {
              type: 'text',
              text: executedCount > 0 ? '(メール送信済み)' : '',
              size: 'sm',
              color: '#999999',
              margin: 'md',
            },
          ],
        },
      }
      await pushFlexToOwner(userId, actionLabel, flex)
    } catch (err) {
      console.error('[Agent Action Approval] Failed to send success notification:', err)
    }
  } catch (error) {
    console.error('[Agent Action Approval] Unexpected error:', error)
    try {
      const flex: FlexMessage = {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '⚠️ エラー',
              weight: 'bold',
              color: '#ff0000',
            },
            {
              type: 'text',
              text: 'エラーが発生しました。サポートに連絡してください。',
              size: 'sm',
              wrap: true,
              margin: 'md',
            },
          ],
        },
      }
      await pushFlexToOwner(userId, 'エラー', flex)
    } catch (err) {
      console.error('[Agent Action Approval] Failed to send error notification:', err)
    }
  }
}
