import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || ''

// LINE signature verification
function verifyLineSignature(body: string, signature: string): boolean {
  const hash = crypto.createHmac('sha256', LINE_CHANNEL_SECRET).update(body).digest('base64')
  return hash === signature
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
  if (event.type === 'message' && event.message.type === 'text') {
    await handleMessage(event)
  } else if (event.type === 'postback') {
    await handlePostback(event)
  }
}

async function handleMessage(event: any) {
  const userId = event.source.userId
  const text = event.message.text
  const timestamp = new Date(event.timestamp)

  const supabase = createAdminClient()

  // 予約関連キーワード
  if (text.includes('予約') || text.includes('よやく')) {
    // 顧客情報を取得または作成
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('line_user_id', userId)
      .single()

    if (!customer) {
      // 顧客が見つからない場合、作成待ち
      console.log(`新規顧客: ${userId}`)
      return
    }

    // 予約リクエストを作成
    const { error } = await supabase.from('reservations').insert({
      salon_id: customer.salon_id,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_email: customer.email,
      requested_datetime: timestamp.toISOString(),
      status: 'pending',
      source: 'line',
      line_message_id: event.message.id,
    })

    if (error) {
      console.error('予約作成エラー:', error)
      return
    }

    // LINE側に確認メッセージを返信（kirei-line-botが処理）
    console.log(`予約リクエスト受信: ${customer.name} (${userId})`)
  } else if (text.includes('キャンセル') || text.includes('cancel')) {
    // キャンセル処理
    const { data: reservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('line_user_id', userId)
      .eq('status', 'confirmed')
      .order('requested_datetime', { ascending: false })
      .limit(1)
      .single()

    if (reservation) {
      await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservation.id)

      console.log(`予約キャンセル: ${reservation.customer_name}`)
    }
  }
}

async function handlePostback(event: any) {
  const userId = event.source.userId
  const data = event.postback.data

  const supabase = createAdminClient()

  // ポストバックデータから予約情報を抽出
  const params = new URLSearchParams(data)
  const action = params.get('action')

  if (action === 'confirm_reservation') {
    const reservationId = params.get('reservation_id')

    if (reservationId) {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', reservationId)

      if (!error) {
        console.log(`予約確認: ${reservationId}`)
      }
    }
  } else if (action === 'cancel_reservation') {
    const reservationId = params.get('reservation_id')

    if (reservationId) {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId)

      if (!error) {
        console.log(`予約キャンセル: ${reservationId}`)
      }
    }
  }
}
