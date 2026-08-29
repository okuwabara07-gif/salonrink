/**
 * POST /api/miniapp/reservations/[id]
 *
 * 予約の変更・キャンセル。本人所有(customer_id一致)の予約のみ操作可。
 * body.op: 'update'(datetime/menu) | 'cancel'(status=cancelled)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCustomerIdToken, getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
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

    const { data: customer } = await admin
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('line_user_id', verified.lineUserId)
      .maybeSingle()
    if (!customer) {
      return NextResponse.json({ linked: false }, { status: 200 })
    }

    // 本人所有の予約か確認
    const { data: existing, error: exErr } = await admin
      .from('reservations')
      .select('id, customer_id, datetime')
      .eq('id', id)
      .eq('salon_id', salonId)
      .eq('customer_id', customer.id)
      .maybeSingle()
    if (exErr) {
      console.error('[miniapp/reservations/[id]] lookup error:', exErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const op = body.op || 'update'

    if (op === 'cancel') {
      const { error } = await admin
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('customer_id', customer.id)
      if (error) {
        console.error('[miniapp/reservations/[id]] cancel error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    if (op === 'update') {
      const patch: Record<string, any> = {}
      if (body.datetime) {
        const when = new Date(body.datetime)
        if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
          return NextResponse.json({ error: '正しい未来の日時を指定してください' }, { status: 400 })
        }
        patch.datetime = when.toISOString()
      }
      if (typeof body.menu === 'string') patch.menu = body.menu
      if (Object.keys(patch).length === 0) {
        return NextResponse.json({ error: '変更内容がありません' }, { status: 400 })
      }

      const { data: updated, error } = await admin
        .from('reservations')
        .update(patch)
        .eq('id', id)
        .eq('customer_id', customer.id)
        .select('id, datetime, menu, status')
        .single()
      if (error) {
        console.error('[miniapp/reservations/[id]] update error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
      return NextResponse.json({ ok: true, reservation: updated })
    }

    return NextResponse.json({ error: 'Unknown op' }, { status: 400 })
  } catch (e) {
    console.error('[miniapp/reservations/[id]] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
