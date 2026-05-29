/**
 * POST /api/miniapp/orders
 * 自分(line_user_id)の注文一覧を返す。サロン発送品(inhouse)のみが対象。
 * body: { id_token: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCustomerIdToken, getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}))
    const verified = await verifyCustomerIdToken(body.id_token)
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status })
    }
    const admin = createAdminClient()
    const salonId = getKireiTsurumiSalonId()

    const { data, error } = await admin
      .from('orders')
      .select('id, items, subtotal, shipping_fee, total, payment_status, fulfillment_status, created_at')
      .eq('salon_id', salonId)
      .eq('line_user_id', verified.lineUserId)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[miniapp/orders] query error:', error)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    return NextResponse.json({ orders: data || [] })
  } catch (e) {
    console.error('[miniapp/orders] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
