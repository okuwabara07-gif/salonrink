import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import https from 'https'

// LINE signature verification (owner OA global secret)
function verifyOwnerLineSignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64')
  return hash === signature
}

// LINE Reply Message (owner OA token)
async function replyMessage(replyToken: string, messages: any[], channelToken: string) {
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

export async function GET(_request: Request) {
  return new Response(JSON.stringify({ status: 'ok', service: 'owner-webhook' }), { status: 200 })
}

export async function POST(request: Request) {
  try {
    const channelSecret = process.env.LINE_OWNER_CHANNEL_SECRET
    const channelToken = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN

    if (!channelSecret || !channelToken) {
      console.error('LINE owner credentials not configured')
      return new Response('LINE owner not configured', { status: 404 })
    }

    // Signature verification
    const signature = request.headers.get('x-line-signature') || ''
    const body = await request.text()

    // LINE Console の検証ボタンクリック時は body が空だが、署名は送られる
    // body が空の場合は検証リクエストとして 200 を返す
    if (body === '') {
      console.log('[Owner OA] Validation request received (empty body)')
      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
    }

    if (!verifyOwnerLineSignature(body, signature, channelSecret)) {
      console.error('Invalid LINE owner signature')
      return new Response('Invalid signature', { status: 403 })
    }

    const events = JSON.parse(body).events || []

    for (const event of events) {
      await handleOwnerEvent(event, channelToken)
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
  } catch (error) {
    console.error('LINE owner webhook error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

async function handleOwnerEvent(event: any, channelToken: string) {
  if (event.type === 'follow') {
    await handleOwnerFollow(event, channelToken)
  } else if (event.type === 'unfollow') {
    await handleOwnerUnfollow(event)
  } else if (event.type === 'message' && event.message.type === 'text') {
    await handleOwnerMessage(event, channelToken)
  } else if (event.type === 'postback') {
    await handleOwnerPostback(event)
  }
}

async function handleOwnerFollow(event: any, channelToken: string) {
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

async function handleOwnerUnfollow(event: any) {
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

async function handleOwnerMessage(event: any, channelToken: string) {
  const userId = event.source.userId
  const text = event.message.text
  const replyToken = event.replyToken

  console.log(`[Owner OA] Message from userId=${userId}: "${text}"`)

  // ヘルプメッセージ
  if (text.includes('ヘルプ') || text.toLowerCase().includes('help') || text.includes('使い方')) {
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

async function handleOwnerPostback(event: any) {
  const userId = event.source.userId
  const data = event.postback.data

  console.log(`[Owner OA] Postback from userId=${userId}: data="${data}"`)
  // Phase 5/6 で拡張予定
}
