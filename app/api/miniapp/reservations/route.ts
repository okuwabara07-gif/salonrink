/**
 * /api/miniapp/reservations
 *
 * GET相当(POST + action=list): 自分の予約一覧 + メニュー + 営業設定 を返す
 * POST(action=create): 予約を reservations に作成
 *
 * reservations 列: salon_id / customer_id / customer_name / line_user_id /
 *                   datetime / menu / status / source
 *
 * IDトークン検証 → customer 解決 を必須にする(本人以外の予約を作らせない)。
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCustomerIdToken, getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

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

    // ---- 一覧 + メニュー + 設定 ----
    if (action === 'list') {
      const [menusRes, settingsRes, reservationsRes] = await Promise.all([
        admin
          .from('salon_menus')
          .select('id, name, price, duration, category')
          .eq('salon_id', salonId)
          .order('sort_order', { ascending: true }),
        admin
          .from('salon_settings')
          .select('open_time, close_time, last_order_time, slot_minutes, closed_weekdays')
          .eq('salon_id', salonId)
          .maybeSingle(),
        admin
          .from('reservations')
          .select('id, datetime, menu, status')
          .eq('salon_id', salonId)
          .eq('customer_id', customer.id)
          .gte('datetime', new Date().toISOString())
          .order('datetime', { ascending: true }),
      ])

      return NextResponse.json({
        linked: true,
        menus: menusRes.data || [],
        settings: settingsRes.data || null,
        reservations: reservationsRes.data || [],
      })
    }

    // ---- 予約作成 ----
    if (action === 'create') {
      const { datetime, menu } = body
      if (!datetime || typeof datetime !== 'string') {
        return NextResponse.json({ error: '日時を指定してください' }, { status: 400 })
      }
      const when = new Date(datetime)
      if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
        return NextResponse.json({ error: '正しい未来の日時を指定してください' }, { status: 400 })
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
