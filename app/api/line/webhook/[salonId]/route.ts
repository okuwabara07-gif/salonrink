import { createAdminClient } from '@/lib/supabase/admin'
import { getLineCredentials } from '@/lib/salon-line-credentials'
import crypto from 'crypto'
import https from 'https'

// LINE signature verification (per-salon secret)
function verifyLineSignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64')
  return hash === signature
}

// LINE メッセージ送信 (per-salon token)
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  const { salonId } = await params
  return new Response(JSON.stringify({ status: 'ok', salonId }), { status: 200 })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const { salonId } = await params

    // salonごとの資格情報を取得
    const creds = await getLineCredentials(salonId)
    if (!creds) {
      console.error(`LINE credentials not configured for salon: ${salonId}`)
      return new Response('LINE not configured', { status: 404 })
    }

    // Signature verification
    const signature = request.headers.get('x-line-signature') || ''
    const body = await request.text()

    if (!verifyLineSignature(body, signature, creds.channelSecret)) {
      console.error(`Invalid LINE signature for salon: ${salonId}`)
      return new Response('Invalid signature', { status: 403 })
    }

    const events = JSON.parse(body).events || []

    for (const event of events) {
      await handleEvent(event, salonId, creds.channelToken)
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
  } catch (error) {
    console.error('LINE webhook error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

async function handleEvent(event: any, salonId: string, channelToken: string) {
  if (event.type === 'follow') {
    await handleFollow(event, salonId, channelToken)
  } else if (event.type === 'message' && event.message.type === 'text') {
    await handleMessage(event, salonId, channelToken)
  } else if (event.type === 'postback') {
    await handlePostback(event, salonId, channelToken)
  }
}

async function handleFollow(event: any, salonId: string, channelToken: string) {
  const userId = event.source.userId
  const replyToken = event.replyToken

  const supabase = createAdminClient()

  // 既存顧客チェック (同一salon内)
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('line_user_id', userId)
    .eq('salon_id', salonId)
    .maybeSingle()

  if (existingCustomer) {
    console.log(`既存顧客フォロー: salon=${salonId} user=${userId}`)
    return
  }

  // salon_id を含めて顧客登録
  const { error } = await supabase.from('customers').insert({
    salon_id: salonId,
    line_user_id: userId,
    status: 'pending_registration',
  })

  if (error) {
    console.error('顧客登録エラー:', error)
  }

  await replyMessage(
    replyToken,
    [{
      type: 'text',
      text: 'SalonRink へようこそ！\n\n予約管理とリマインド通知をお送りします。\n\nご不明な点は「ヘルプ」と送ってください。',
    }],
    channelToken
  )

  console.log(`新規顧客登録: salon=${salonId} user=${userId}`)
}

async function handleMessage(event: any, salonId: string, channelToken: string) {
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
      .eq('salon_id', salonId)
      .maybeSingle()

    if (!customer) {
      await replyMessage(
        replyToken,
        [{ type: 'text', text: '申し訳ございません。\n顧客情報が見つかりませんでした。\n\nスタッフまでお問い合わせください。' }],
        channelToken
      )
      return
    }

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        salon_id: salonId,
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
      await replyMessage(
        replyToken,
        [{ type: 'text', text: '予約作成に失敗しました。\nもう一度お試しください。' }],
        channelToken
      )
      return
    }

    await replyMessage(
      replyToken,
      [{ type: 'text', text: `予約リクエストを受け付けました。\n\nお客様: ${customer.name}\n\nスタッフが確認後、ご連絡いたします。` }],
      channelToken
    )

    console.log(`予約リクエスト受信: salon=${salonId} customer=${customer.name}`)
  } else if (text.includes('キャンセル') || text.includes('cancel')) {
    const { data: reservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('line_user_id', userId)
      .eq('salon_id', salonId)
      .eq('status', 'confirmed')
      .order('requested_datetime', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!reservation) {
      await replyMessage(
        replyToken,
        [{ type: 'text', text: 'キャンセル対象の予約が見つかりません。' }],
        channelToken
      )
      return
    }

    await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', reservation.id)

    await replyMessage(
      replyToken,
      [{ type: 'text', text: '予約をキャンセルしました。\n\nご利用ありがとうございました。' }],
      channelToken
    )

    console.log(`予約キャンセル: salon=${salonId} customer=${reservation.customer_name}`)
  }
}

async function handlePostback(event: any, salonId: string, channelToken: string) {
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
        .eq('salon_id', salonId)
        .select('*')
        .single()

      if (!error && reservation) {
        await replyMessage(
          replyToken,
          [{ type: 'text', text: `ご予約を確認いたしました。\n\nお客様: ${reservation.customer_name}\n日時: ${new Date(reservation.requested_datetime).toLocaleString('ja-JP')}\n\nご来店をお待ちしております。` }],
          channelToken
        )
        console.log(`予約確認: salon=${salonId} reservation=${reservationId}`)
      }
    }
  } else if (action === 'cancel_reservation') {
    const reservationId = params.get('reservation_id')
    if (reservationId) {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId)
        .eq('salon_id', salonId)
        .select('*')
        .single()

      if (!error && reservation) {
        await replyMessage(
          replyToken,
          [{ type: 'text', text: `予約をキャンセルしました。\n\nお客様: ${reservation.customer_name}\n\nご利用ありがとうございました。` }],
          channelToken
        )
        console.log(`予約キャンセル: salon=${salonId} reservation=${reservationId}`)
      }
    }
  }
}
