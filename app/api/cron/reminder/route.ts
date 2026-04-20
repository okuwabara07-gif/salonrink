import { createAdminClient } from '@/lib/supabase/admin'
import https from 'https'

const LINE_CHANNEL_TOKEN = process.env.LINE_CHANNEL_TOKEN || ''

// LINE push メッセージ送信
async function pushMessage(userId: string, messages: any[]) {
  const payload = JSON.stringify({ to: userId, messages })
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.line.biz',
      path: '/v2/bot/message/push',
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
  try {
    const supabase = createAdminClient()

    // 明日の予約を取得（前日リマインド）
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const start = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString()
    const end = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString()

    const { data: reservations } = await supabase
      .from('reservations')
      .select('*, customers(*)')
      .gte('requested_datetime', start)
      .lte('requested_datetime', end)
      .eq('status', 'confirmed')
      .eq('source', 'line')

    if (!reservations || reservations.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    let sent = 0
    for (const reservation of reservations) {
      if (!reservation.customers?.line_user_id) continue

      const dt = new Date(reservation.requested_datetime)
      const timeStr = `${dt.getMonth() + 1}月${dt.getDate()}日 ${dt.getHours()}:${String(dt.getMinutes()).padStart(2, '0')}`

      await pushMessage(reservation.customers.line_user_id, [{
        type: 'text',
        text: `【予約リマインド】\n\n${reservation.customer_name}様\n\n明日のご予約です。\n\n日時: ${timeStr}\n\nご来店をお待ちしております。`
      }])

      await supabase
        .from('reservations')
        .update({ reminder_sent: true })
        .eq('id', reservation.id)

      sent++
    }

    console.log(`リマインド送信: ${sent}件`)
    return new Response(JSON.stringify({ sent }), { status: 200 })
  } catch (error) {
    console.error('リマインド送信エラー:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
