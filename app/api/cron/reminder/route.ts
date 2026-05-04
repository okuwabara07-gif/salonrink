import { createAdminClient } from '@/lib/supabase/admin'
import { generateSecureToken } from '@/lib/security/token'
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
      return new Response(
        JSON.stringify({ sent: 0, pre_counseling_sent_count: 0, pre_counseling_skipped_count: 0, errors: [] }),
        { status: 200 }
      )
    }

    // ========================================
    // Step A: 既存リマインド送信
    // ========================================
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

    // ========================================
    // Step B: 事前カウンセリング LIFF URL 送信
    // ========================================
    const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID_PRE_COUNSELING

    let preCounselingSent = 0
    let preCounselingSkipped = 0
    const preCounselingErrors: string[] = []

    if (LIFF_ID) {
      for (const reservation of reservations) {
        if (!reservation.customers?.line_user_id) {
          preCounselingSkipped++
          continue
        }

        const customerId = reservation.customers?.id || reservation.customer_id
        const salonId = reservation.salon_id

        if (!customerId || !salonId) {
          preCounselingSkipped++
          continue
        }

        // B1: 重複チェック（reservation_id 単位）
        const { data: existing } = await supabase
          .from('pre_counselings')
          .select('id')
          .eq('reservation_id', reservation.id)
          .maybeSingle()

        if (existing) {
          preCounselingSkipped++
          continue
        }

        // B2: トークン生成 + INSERT（status='sent', sent_at 同時セット）
        const token = generateSecureToken()
        const { error: insertError } = await supabase
          .from('pre_counselings')
          .insert({
            salon_id: salonId,
            customer_id: customerId,
            reservation_id: reservation.id,
            token,
            status: 'sent',
            sent_at: new Date().toISOString(),
          })

        if (insertError) {
          preCounselingErrors.push(`reservation ${reservation.id}: ${insertError.message}`)
          continue
        }

        // B3: LINE push 送信（失敗時はロールバック削除）
        try {
          const liffUrl = `https://liff.line.me/${LIFF_ID}?token=${token}`
          await pushMessage(reservation.customers.line_user_id, [{
            type: 'text',
            text: `【ご来店前のご確認】\n\n${reservation.customer_name}様\n\n明日のご来店ありがとうございます。\nご来店前に以下のアンケートにご回答いただくと、より丁寧なご対応ができます。\n\n${liffUrl}\n\n※ご回答は任意です`,
          }])
          preCounselingSent++
        } catch (err) {
          await supabase.from('pre_counselings').delete().eq('token', token)
          preCounselingErrors.push(`reservation ${reservation.id}: push failed, rolled back`)
        }
      }
    }

    console.log(`事前カウンセリング送信: ${preCounselingSent}件 / スキップ: ${preCounselingSkipped}件`)
    return new Response(
      JSON.stringify({
        sent,
        pre_counseling_sent_count: preCounselingSent,
        pre_counseling_skipped_count: preCounselingSkipped,
        errors: preCounselingErrors,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('リマインド送信エラー:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
