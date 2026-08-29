/**
 * POST /api/miniapp/checkout
 * 物販の都度決済(Stripe Checkout mode=payment)を開始する。
 * body: { id_token: string, items: [{ product_id, qty }], salon?: string }
 * - 製品/価格/在庫はサーバー側で再取得して検証(クライアント金額は信用しない)
 * - 送料: 小計5000円以上で無料、未満は一律700円
 * - orders に payment_status=pending で記録し、Stripe session を返す
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { verifyCustomerIdToken, getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

const FREE_SHIPPING_THRESHOLD = 5000
const FLAT_SHIPPING = 700

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}))
    const idToken: string = body.id_token || ''
    const rawItems: Array<{ product_id: string; qty: number }> = Array.isArray(body.items) ? body.items : []

    const verified = await verifyCustomerIdToken(idToken)
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status })
    }
    const lineUserId = verified.lineUserId
    if (rawItems.length === 0) {
      return NextResponse.json({ error: '商品が選択されていません' }, { status: 400 })
    }

    const admin = createAdminClient()
    const salonId = getKireiTsurumiSalonId()

    // 顧客特定(連携済みのみ購入可)
    const { data: customer } = await admin
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('line_user_id', lineUserId)
      .maybeSingle()

    // 製品をサーバー側で再取得・検証
    const ids = rawItems.map((i) => i.product_id)
    const { data: products, error: pErr } = await admin
      .from('products')
      .select('id, name, price, stock, fulfillment_type, is_active, agency_locked')
      .in('id', ids)
      .eq('salon_id', salonId)
    if (pErr) {
      console.error('[miniapp/checkout] product fetch error:', pErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    const lineItems: Array<{ price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }> = []
    const orderItems: Array<{ product_id: string; name: string; price: number; qty: number }> = []
    let subtotal = 0

    for (const ri of rawItems) {
      const p = (products || []).find((x) => x.id === ri.product_id)
      const qty = Math.max(1, Math.min(99, Number(ri.qty) || 1))
      if (!p || !p.is_active || p.agency_locked) {
        return NextResponse.json({ error: '販売できない商品が含まれています' }, { status: 400 })
      }
      if (p.fulfillment_type !== 'inhouse') {
        return NextResponse.json({ error: 'この商品は外部サイトでの購入となります' }, { status: 400 })
      }
      if (p.stock < qty) {
        return NextResponse.json({ error: `在庫が不足しています: ${p.name}` }, { status: 409 })
      }
      subtotal += p.price * qty
      orderItems.push({ product_id: p.id, name: p.name, price: p.price, qty })
      lineItems.push({
        price_data: { currency: 'jpy', product_data: { name: p.name }, unit_amount: p.price },
        quantity: qty,
      })
    }

    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
    if (shippingFee > 0) {
      lineItems.push({
        price_data: { currency: 'jpy', product_data: { name: '送料' }, unit_amount: shippingFee },
        quantity: 1,
      })
    }
    const total = subtotal + shippingFee

    // 注文を pending で先に記録
    const { data: order, error: oErr } = await admin
      .from('orders')
      .insert({
        salon_id: salonId,
        customer_id: customer?.id ?? null,
        line_user_id: lineUserId,
        items: orderItems,
        subtotal,
        shipping_fee: shippingFee,
        total,
        payment_status: 'pending',
        fulfillment_status: 'unshipped',
      })
      .select('id')
      .single()
    if (oErr || !order) {
      console.error('[miniapp/checkout] order insert error:', oErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'https://salonrink.com'
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['JP'] },
      phone_number_collection: { enabled: true },
      client_reference_id: order.id,
      metadata: { order_id: order.id, salon_id: salonId, line_user_id: lineUserId },
      success_url: `${origin}/neo/thanks.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/neo/ec.html?canceled=1`,
    })

    // session id を注文に紐付け
    await admin.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('[miniapp/checkout] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
