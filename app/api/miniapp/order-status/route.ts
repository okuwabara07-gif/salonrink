/**
 * GET /api/miniapp/order-status?session_id=cs_xxx
 * 注文完了ページ用。Stripe の session_id から注文の概要を返す(個人情報は返さない)。
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id') || ''
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    }
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('orders')
      .select('items, subtotal, shipping_fee, total, payment_status, fulfillment_status, created_at')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()
    if (error) {
      console.error('[miniapp/order-status] query error:', error)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return NextResponse.json({ order: data })
  } catch (e) {
    console.error('[miniapp/order-status] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
