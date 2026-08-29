/**
 * POST /api/miniapp/reviews
 * 購入者限定の口コミ投稿。status=pending(承認待ち)で記録。
 * body: { id_token, product_id, order_id, rating(1-5), body }
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
    const productId = body.product_id
    const orderId = body.order_id
    const rating = Number(body.rating)
    const text = typeof body.body === 'string' ? body.body.trim() : ''

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '評価を選択してください' }, { status: 400 })
    }
    if (!text) {
      return NextResponse.json({ error: '口コミ本文を入力してください' }, { status: 400 })
    }

    const admin = createAdminClient()
    const salonId = getKireiTsurumiSalonId()

    // 購入者確認: その人が paid 注文でこの製品を買ったか
    const { data: orders } = await admin
      .from('orders')
      .select('id, items')
      .eq('salon_id', salonId)
      .eq('line_user_id', verified.lineUserId)
      .eq('payment_status', 'paid')
    const bought = (orders || []).some((o) =>
      Array.isArray(o.items) && o.items.some((it: { product_id?: string }) => it.product_id === productId)
    )
    if (!bought) {
      return NextResponse.json({ error: 'ご購入された方のみ投稿できます' }, { status: 403 })
    }

    const { error } = await admin.from('product_reviews').insert({
      product_id: productId,
      salon_id: salonId,
      line_user_id: verified.lineUserId,
      order_id: orderId || null,
      rating,
      body: text,
      status: 'pending',
    })
    if (error) {
      console.error('[miniapp/reviews] insert error:', error)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[miniapp/reviews] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
