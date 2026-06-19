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

    console.log('[Owner OA] Webhook received', {
      signature: signature ? 'present' : 'missing',
      bodyLength: body.length,
      bodyPreview: body.substring(0, 100),
    })

    console.log('[Owner OA] secret length:', (channelSecret || '').length, 'sigHeader present:', !!signature)

    const signatureValid = verifyOwnerLineSignature(body, signature, channelSecret)
    console.log('[Owner OA] Signature verification result:', { valid: signatureValid })

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

    console.log('[Owner OA] Events received:', events.length)

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
  console.log(`[Owner OA] Event type: ${event.type}, source.userId: ${event.source.userId}`)

  // デバッグ用: 最新の userId を保存
  try {
    const supabase = createAdminClient()
    await supabase.from('owner_webhook_debug').insert({
      source_user_id: event.source.userId,
      event_type: event.type,
    })
  } catch (err) {
    console.warn('[Owner OA] Failed to save debug userId:', err)
  }

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

  console.log(`[Owner OA] userId: ${userId}`)
  console.log(`[Owner OA] Message from userId=${userId}: "${text}"`)

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
    } else {
      console.log(`[Owner OA] Updated owner_line_links with userId=${userId}`)
    }
  } catch (err) {
    console.warn('[Owner OA] Error updating owner_line_links:', err)
  }

  // whoami: 本人確認用（本user IDを出す）
  if (text.toLowerCase() === 'whoami') {
    try {
      const flex: FlexMessage = {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'Your LINE User ID',
              weight: 'bold',
              size: 'lg',
            },
            {
              type: 'text',
              text: userId,
              size: 'sm',
              color: '#0084ff',
              margin: 'md',
              wrap: true,
            },
          ],
        },
      }
      await pushFlexToOwner(userId, `userId: ${userId}`, flex)
      console.log(`[Owner OA] Whoami sent successfully for ${userId}`)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error('[Owner OA] Failed to send whoami:', errMsg)
    }
  } else if (text.includes('ヘルプ') || text.toLowerCase().includes('help') || text.includes('使い方')) {
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
  } else {
    console.log(`[Owner OA] No action taken for message: "${text}"`)
  }
}

async function handleOwnerPostback(event: LineEvent & { postback: { data: string } }) {
  const userId = event.source.userId
  const data = event.postback.data
  const replyToken = event.replyToken

  console.log(`[Owner OA] Postback from userId=${userId}: data="${data}"`)

  // 承認フロー: postback data = "action=approve&id=<uuid>" または "action=reject&id=<uuid>"
  const match = data.match(/action=(approve|reject)&id=([a-f0-9-]+)/)
  if (!match) {
    console.log('[Owner OA] Postback does not match approval pattern')
    return
  }

  const action = match[1] // 'approve' or 'reject'
  const approvalId = match[2]

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
