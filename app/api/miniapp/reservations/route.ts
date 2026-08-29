/**
 * /api/miniapp/reservations
 *
 * GET相当(POST + action=list): 自分の予約一覧 + メニュー + 営業設定 を返す
 * POST(action=create): 予約を reservations に作成
 *
 * 予約枠調整(Phase 2):
 * - closed_weekdays(曜日定休) / closed_dates(個別休業日) に該当する日は予約不可
 * - daily_reservation_limit(1日の予約上限。0=無制限) を超える日は予約不可
 * - フロントだけでなくサーバー側でも必ず検証する(API直叩き対策)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCustomerIdToken, getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

function toJstDateParts(d: Date): { ymd: string; weekday: number } {
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  const ymd = jst.toISOString().slice(0, 10)
  const weekday = jst.getUTCDay()
  return { ymd, weekday }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))
    const verified = await verifyCustomerIdToken(body.idToken)
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status })
    }

    const salonId = getKireiTsurumiSalonId()
    if (!salonId) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const admin = createAdminClient()

    const { data: customer, error: custErr } = await admin
      .from('customers')
      .select('id, name')
      .eq('salon_id', salonId)
      .eq('line_user_id', verified.lineUserId)
      .maybeSingle()

    if (custErr) {
      console.error('[miniapp/reservations] customer lookup error:', custErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    if (!customer) {
      return NextResponse.json({ linked: false }, { status: 200 })
    }

    const action = body.action || 'list'

    if (action === 'list') {
      const [menusRes, settingsRes, reservationsRes, hpbRes] = await Promise.all([
        admin
          .from('salon_menus')
          .select('id, name, price, duration, category')
          .eq('salon_id', salonId)
          .order('sort_order', { ascending: true }),
        admin
          .from('salon_settings')
          .select('open_time, close_time, last_order_time, slot_minutes, closed_weekdays, closed_dates, daily_reservation_limit')
          .eq('salon_id', salonId)
          .maybeSingle(),
        admin
          .from('reservations')
          .select('id, datetime, menu, status')
          .eq('salon_id', salonId)
          .eq('customer_id', customer.id)
          .gte('datetime', new Date().toISOString())
          .order('datetime', { ascending: true }),
        admin
          .from('hpb_reservations')
          .select('start_time, end_time')
          .eq('salon_id', salonId)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true }),
      ])

      return NextResponse.json({
        linked: true,
        menus: menusRes.data || [],
        settings: settingsRes.data || null,
        reservations: reservationsRes.data || [],
        hpbReservations: hpbRes.data || [],
      })
    }

    if (action === 'create') {
      const { datetime, menu } = body
      if (!datetime || typeof datetime !== 'string') {
        return NextResponse.json({ error: '日時を指定してください' }, { status: 400 })
      }
      const when = new Date(datetime)
      if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
        return NextResponse.json({ error: '正しい未来の日時を指定してください' }, { status: 400 })
      }

      const { data: settings, error: setErr } = await admin
        .from('salon_settings')
        .select('closed_weekdays, closed_dates, daily_reservation_limit')
        .eq('salon_id', salonId)
        .maybeSingle()

      if (setErr) {
        console.error('[miniapp/reservations] settings lookup error:', setErr)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }

      const { ymd, weekday } = toJstDateParts(when)
      const closedWeekdays = Array.isArray(settings?.closed_weekdays) ? settings.closed_weekdays : []
      const closedDates = Array.isArray(settings?.closed_dates) ? settings.closed_dates : []
      const dailyLimit = typeof settings?.daily_reservation_limit === 'number' ? settings.daily_reservation_limit : 0

      if (closedWeekdays.includes(weekday)) {
        return NextResponse.json({ error: 'その日は定休日のため予約できません' }, { status: 409 })
      }
      if (closedDates.includes(ymd)) {
        return NextResponse.json({ error: 'その日は休業日のため予約できません' }, { status: 409 })
      }

      // HPB予約との重複チェック(その時間帯がHPBで埋まっていたら拒否)
      const { data: hpbList, error: hpbErr } = await admin
        .from('hpb_reservations')
        .select('start_time, end_time')
        .eq('salon_id', salonId)
      if (hpbErr) {
        console.error('[miniapp/reservations] hpb lookup error:', hpbErr)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
      const whenMs = when.getTime()
      const overlap = (hpbList || []).some((h) => {
        const st = new Date(h.start_time).getTime()
        const et = new Date(h.end_time).getTime()
        return whenMs >= st && whenMs < et
      })
      if (overlap) {
        return NextResponse.json({ error: 'その時間帯は予約が埋まっています' }, { status: 409 })
      }

      if (dailyLimit > 0) {
        const dayStart = new Date(ymd + 'T00:00:00+09:00')
        const dayEnd = new Date(ymd + 'T23:59:59+09:00')
        const { count, error: cntErr } = await admin
          .from('reservations')
          .select('id', { count: 'exact', head: true })
          .eq('salon_id', salonId)
          .gte('datetime', dayStart.toISOString())
          .lte('datetime', dayEnd.toISOString())
          .neq('status', 'cancelled')

        if (cntErr) {
          console.error('[miniapp/reservations] count error:', cntErr)
          return NextResponse.json({ error: 'Server error' }, { status: 500 })
        }
        if ((count || 0) >= dailyLimit) {
          return NextResponse.json({ error: 'その日は予約が満員のため受け付けできません' }, { status: 409 })
        }
      }

      const { data: created, error: insErr } = await admin
        .from('reservations')
        .insert({
          salon_id: salonId,
          customer_id: customer.id,
          customer_name: customer.name,
          line_user_id: verified.lineUserId,
          datetime: when.toISOString(),
          menu: typeof menu === 'string' ? menu : null,
          status: 'confirmed',
          source: 'line',
        })
        .select('id, datetime, menu, status')
        .single()

      if (insErr) {
        console.error('[miniapp/reservations] insert error:', insErr)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
      return NextResponse.json({ linked: true, reservation: created })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('[miniapp/reservations] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
