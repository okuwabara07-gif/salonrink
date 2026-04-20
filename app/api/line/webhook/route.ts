import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import https from 'https'

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || ''
const LINE_CHANNEL_TOKEN = process.env.LINE_CHANNEL_TOKEN || ''

// LINE signature verification
function verifyLineSignature(body: string, signature: string): boolean {
  const hash = crypto.createHmac('sha256', LINE_CHANNEL_SECRET).update(body).digest('base64')
  return hash === signature
}

// LINE メッセージ送信
async function replyMessage(replyToken: string, messages: any[]) {
  const payload = JSON.stringify({ replyToken, messages })
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.line.biz',
      path: '/v2/bot/message/reply',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${LINE_CHANNEL_TOKEN}`
      }
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

export async function GET(request: Request) {
  return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
}

export async function POST(request: Request) {
  try {
    // Signature verification
    const signature = request.headers.get('x-line-signature') || ''
    const body = await request.text()

    if (!verifyLineSignature(body, signature)) {
      console.error('Invalid LINE signature')
      return new Response('Invalid signature', { status: 403 })
    }

    const events = JSON.parse(body).events || []

    for (const event of events) {
      await handleEvent(event)
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
  } catch (error) {
    console.error('LINE webhook error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

async function handleEvent(event: any) {
  if (event.type === 'follow') {
    await handleFollow(event)
  } else if (event.type === 'message' && event.message.type === 'text') {
    await handleMessage(event)
  } else if (event.type === 'postback') {
    await handlePostback(event)
  }
}

async function handleFollow(event: any) {
  const userId = event.source.userId
  const replyToken = event.replyToken

  const supabase = createAdminClient()

  // LINE ユーザー ID で顧客を検索
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('line_user_id', userId)
    .single()

  if (existingCustomer) {
    console.log(`既存顧客フォロー: ${userId}`)
    return
  }

  // LINE ユーザー ID のみで顧客を登録（salon_id は手動で設定待ち）
  const { error } = await supabase.from('customers').insert({
    line_user_id: userId,
    status: 'pending_registration'
  })

  if (error) {
    console.error('顧客登録エラー:', error)
  }

  await replyMessage(replyToken, [{
    type: 'text',
    text: 'SalonRink へようこそ！\n\n予約管理とリマインド通知をお送りします。\n\nご不明な点は「ヘルプ」と送ってください。'
  }])

  console.log(`新規顧客登録: ${userId}`)
}

async function handleMessage(event: any) {
  const userId = event.source.userId
  const text = event.message.text
  const replyToken = event.replyToken
  const timestamp = new Date(event.timestamp)

  const supabase = createAdminClient()

  if (text.includes('予約') || text.includes('よやく')) {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('line_user_id', userId)
      .single()

    if (!customer) {
      await replyMessage(replyToken, [{
        type: 'text',
        text: '申し訳ございません。\n顧客情報が見つかりませんでした。\n\nスタッフまでお問い合わせください。'
      }])
      return
    }

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        salon_id: customer.salon_id,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        line_user_id: userId,
        requested_datetime: timestamp.toISOString(),
        status: 'pending',
        source: 'line',
        line_message_id: event.message.id,
      })
      .select('id')
      .single()

    if (error) {
      console.error('予約作成エラー:', error)
      await replyMessage(replyToken, [{
        type: 'text',
        text: '予約作成に失敗しました。\nもう一度お試しください。'
      }])
      return
    }

    await replyMessage(replyToken, [{
      type: 'text',
      text: `予約リクエストを受け付けました。\n\nお客様: ${customer.name}\n\nスタッフが確認後、ご連絡いたします。`
    }])

    console.log(`予約リクエスト受信: ${customer.name} (${userId})`)
  } else if (text.includes('キャンセル') || text.includes('cancel')) {
    const { data: reservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('line_user_id', userId)
      .eq('status', 'confirmed')
      .order('requested_datetime', { ascending: false })
      .limit(1)
      .single()

    if (!reservation) {
      await replyMessage(replyToken, [{
        type: 'text',
        text: 'キャンセル対象の予約が見つかりません。'
      }])
      return
    }

    await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservation.id)

    await replyMessage(replyToken, [{
      type: 'text',
      text: '予約をキャンセルしました。\n\nご利用ありがとうございました。'
    }])

    console.log(`予約キャンセル: ${reservation.customer_name}`)
  }
}

async function handlePostback(event: any) {
  const userId = event.source.userId
  const replyToken = event.replyToken
  const data = event.postback.data

  const supabase = createAdminClient()

  const params = new URLSearchParams(data)
  const action = params.get('action')

  if (action === 'confirm_reservation') {
    const reservationId = params.get('reservation_id')

    if (reservationId) {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', reservationId)
        .select('*')
        .single()

      if (!error && reservation) {
        await replyMessage(replyToken, [{
          type: 'text',
          text: `ご予約を確認いたしました。\n\nお客様: ${reservation.customer_name}\n日時: ${new Date(reservation.requested_datetime).toLocaleString('ja-JP')}\n\nご来店をお待ちしております。`
        }])
        console.log(`予約確認: ${reservationId}`)
      }
    }
  } else if (action === 'cancel_reservation') {
    const reservationId = params.get('reservation_id')

    if (reservationId) {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId)
        .select('*')
        .single()

      if (!error && reservation) {
        await replyMessage(replyToken, [{
          type: 'text',
          text: `予約をキャンセルしました。\n\nお客様: ${reservation.customer_name}\n\nご利用ありがとうございました。`
        }])
        console.log(`予約キャンセル: ${reservationId}`)
      }
    }
  }
}
