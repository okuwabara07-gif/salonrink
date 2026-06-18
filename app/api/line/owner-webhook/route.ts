import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import https from 'https'

// LINE signature verification (owner OA global secret)
function verifyOwnerLineSignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64')
  return hash === signature
}

// LINE Reply Message (owner OA token)
async function replyMessage(replyToken: string, messages: Record<string, unknown>[], channelToken: string) {
  const payload = JSON.stringify({ replyToken, messages })
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.line.biz',
      path: '/v2/bot/message/reply',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${channelToken}`,
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve({ status: res.statusCode, data }))
    })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
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
      await handleOwnerEvent(event, channelToken)
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

async function handleOwnerEvent(event: LineEvent, channelToken: string) {
  if (event.type === 'follow') {
    await handleOwnerFollow(event, channelToken)
  } else if (event.type === 'unfollow') {
    await handleOwnerUnfollow(event)
  } else if (event.type === 'message' && event.message?.type === 'text') {
    await handleOwnerMessage(event as LineEvent & { message: { type: 'text'; text: string } }, channelToken)
  } else if (event.type === 'postback') {
    await handleOwnerPostback(event as LineEvent & { postback: { data: string } })
  }
}

async function handleOwnerFollow(event: LineEvent, channelToken: string) {
  const userId = event.source.userId
  const replyToken = event.replyToken

  console.log(`[Owner OA] New follow: userId=${userId}`)

  // 挨拶メッセージ送信
  try {
    await replyMessage(
      replyToken,
      [{
        type: 'text',
        text: 'SalonRink Concierge へようこそ！\n\nこのアカウントは、サロンオーナー向けの朝7時・夜21時の営業サマリーをお届けしています。\n\nご不明な点は「ヘルプ」とお送りください。',
      }],
      channelToken
    )
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

async function handleOwnerMessage(event: LineEvent & { message: { type: 'text'; text: string } }, channelToken: string) {
  const userId = event.source.userId
  const text = event.message.text
  const replyToken = event.replyToken

  console.log(`[Owner OA] Message from userId=${userId}: "${text}"`)

  // whoami: 本人確認用（本user IDを出す）
  if (text === 'whoami') {
    try {
      await replyMessage(
        replyToken,
        [{
          type: 'text',
          text: `your userId: ${userId}`,
        }],
        channelToken
      )
    } catch (err) {
      console.error('[Owner OA] Failed to send whoami:', err)
    }
  } else if (text.includes('ヘルプ') || text.toLowerCase().includes('help') || text.includes('使い方')) {
    try {
      await replyMessage(
        replyToken,
        [{
          type: 'text',
          text: '【SalonRink Concierge サポート】\n\n朝7時: 本日の予約サマリーをお送りします。\n夜21時: 本日のカルテ自動生成サマリーをお送りします。\n\n配信を一時停止したい場合は、ダッシュボードの設定からお変更ください。',
        }],
        channelToken
      )
    } catch (err) {
      console.error('[Owner OA] Failed to send help:', err)
    }
  } else {
    // その他のメッセージはログのみ
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

  // 認証: 送信者の userId が OWNER_OA_LINE_USER_ID と一致するか
  const ownerUserId = process.env.OWNER_OA_LINE_USER_ID
  if (!ownerUserId) {
    console.error('[Owner OA Approval] OWNER_OA_LINE_USER_ID not configured')
    try {
      await replyMessage(
        replyToken,
        [{ type: 'text', text: '⚠️ システム設定エラー: オーナーIDが未設定です' }],
        event.source.channelToken || process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN || ''
      )
    } catch (err) {
      console.error('[Owner OA] Failed to send error reply:', err)
    }
    return
  }

  if (userId !== ownerUserId) {
    console.warn(`[Owner OA Approval] Unauthorized user ${userId} attempted approval`)
    try {
      await replyMessage(
        replyToken,
        [{ type: 'text', text: '❌ 権限がありません。このアカウントでは承認操作ができません。' }],
        process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN || ''
      )
    } catch (err) {
      console.error('[Owner OA] Failed to send unauthorized reply:', err)
    }
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
        await replyMessage(
          replyToken,
          [{ type: 'text', text: `⚠️ ${decision === 'approved' ? '承認' : '却下'}に失敗しました: ${result.error}` }],
          process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN || ''
        )
      } catch (err) {
        console.error('[Owner OA] Failed to send failure reply:', err)
      }
      return
    }

    const kindLabel = result.kind || 'unknown'
    const actionLabel = decision === 'approved' ? '✅ 承認しました' : '❌ 却下しました'
    const executedLabel = result.executedCount > 0 ? `(実行: ${kindLabel})` : ''

    console.log(`[Owner OA Approval] Success: ${decision} ${approvalId}, executed=${result.executedCount}`)

    try {
      await replyMessage(
        replyToken,
        [{ type: 'text', text: `${actionLabel} ${executedLabel}` }],
        process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN || ''
      )
    } catch (err) {
      console.error('[Owner OA] Failed to send success reply:', err)
    }
  } catch (error) {
    console.error('[Owner OA Approval] Unexpected error:', error)
    try {
      await replyMessage(
        replyToken,
        [{ type: 'text', text: '⚠️ エラーが発生しました。サポートに連絡してください。' }],
        process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN || ''
      )
    } catch (err) {
      console.error('[Owner OA] Failed to send error reply:', err)
    }
  }
}
