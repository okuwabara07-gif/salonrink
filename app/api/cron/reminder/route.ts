import { createAdminClient } from '@/lib/supabase/admin'
import { generateSecureToken } from '@/lib/security/token'
import { pushMessage } from '@/lib/line'

async function findOrCreateCustomerId(
  supabase: ReturnType<typeof createAdminClient>,
  reservation: any
): Promise<string | null> {
  if (!reservation.line_user_id) return null

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('line_user_id', reservation.line_user_id)
    .eq('salon_id', reservation.salon_id)
    .maybeSingle()

  if (customer) return customer.id

  const { data: newCustomer, error } = await supabase
    .from('customers')
    .insert({
      salon_id: reservation.salon_id,
      name: reservation.customer_name || 'LINE 顧客',
      line_user_id: reservation.line_user_id,
    })
    .select('id')
    .single()

  if (error) {
    console.error(`Customer auto-create failed for reservation: ${reservation.id}`)
    return null
  }

  return newCustomer?.id || null
}

export async function GET(_request: Request) {
  try {
    const supabase = createAdminClient()

    // 明日の予約を取得（前日リマインド）
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const start = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString()
    const end = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString()

    const { data: reservations } = await supabase
      .from('reservations')
      .select('*')
      .gte('datetime', start)
      .lte('datetime', end)
      .eq('status', 'confirmed')
      .eq('source', 'line')

    if (!reservations || reservations.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, pre_counseling_sent_count: 0, pre_counseling_skipped_count: 0, errors: [] }),
        { status: 200 }
      )
    }

    // ========================================
    // Step A: 既存リマインド送信（salonごとのトークン使用）
    // ========================================
    let sent = 0
    const reminderErrors: string[] = []

    for (const reservation of reservations) {
      if (!reservation.line_user_id || !reservation.salon_id) continue

      try {
        const dt = new Date(reservation.datetime)
        const timeStr = `${dt.getMonth() + 1}月${dt.getDate()}日 ${dt.getHours()}:${String(dt.getMinutes()).padStart(2, '0')}`

        const result = await pushMessage(supabase, reservation.salon_id, reservation.line_user_id, [
          {
            type: 'text',
            text: `【予約リマインド】\n\n${reservation.customer_name}様\n\n明日のご予約です。\n\n日時: ${timeStr}\n\nご来店をお待ちしております。`,
          },
        ])

        if (result.success) {
          await supabase.from('reservations').update({ reminder_sent: true }).eq('id', reservation.id)
          sent++
        } else {
          reminderErrors.push(`reservation ${reservation.id}: ${result.error}`)
        }
      } catch (err) {
        console.error(`Reminder send failed for reservation: ${reservation.id}`, err)
        reminderErrors.push(`reservation ${reservation.id}: exception`)
      }
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
        if (!reservation.line_user_id) {
          preCounselingSkipped++
          continue
        }

        const salonId = reservation.salon_id
        if (!salonId) {
          preCounselingErrors.push(`reservation ${reservation.id}: missing salon_id`)
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

        // B2: customer 取得 or 自動作成（pre_counselings.customer_id は NOT NULL）
        const customerId = await findOrCreateCustomerId(supabase, reservation)
        if (!customerId) {
          preCounselingErrors.push(`reservation ${reservation.id}: customer not found/created`)
          preCounselingSkipped++
          continue
        }

        // B3: トークン生成 + INSERT（status='sent', sent_at 同時セット）
        const token = generateSecureToken()
        const { error: insertError } = await supabase.from('pre_counselings').insert({
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

        // B4: LINE push 送信（失敗時はロールバック削除）
        const liffUrl = `https://liff.line.me/${LIFF_ID}?token=${token}`
        const result = await pushMessage(supabase, salonId, reservation.line_user_id, [
          {
            type: 'text',
            text: `【ご来店前のご確認】\n\n${reservation.customer_name}様\n\n明日のご来店ありがとうございます。\nご来店前に以下のアンケートにご回答いただくと、より丁寧なご対応ができます。\n\n${liffUrl}\n\n※ご回答は任意です`,
          },
        ])

        if (result.success) {
          preCounselingSent++
        } else {
          await supabase.from('pre_counselings').delete().eq('token', token)
          preCounselingErrors.push(`reservation ${reservation.id}: push failed (${result.error}), rolled back`)
        }
      }
    }

    console.log(`事前カウンセリング送信: ${preCounselingSent}件 / スキップ: ${preCounselingSkipped}件`)

    return new Response(
      JSON.stringify({
        sent,
        reminder_errors: reminderErrors,
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
