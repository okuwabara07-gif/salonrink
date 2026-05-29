/**
 * POST /api/miniapp/me
 *
 * IDトークンを検証し、line_user_id に紐づく customer 情報を返す。
 * 連携状態の確認(起動直後)に使う。GETではなくPOST(IDトークンをbodyで送るため)。
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
    const { data: customer, error } = await admin
      .from('customers')
      .select('id, name, kana, last_visit, visit_count')
      .eq('salon_id', salonId)
      .eq('line_user_id', verified.lineUserId)
      .maybeSingle()

    if (error) {
      console.error('[miniapp/me] lookup error:', error)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    if (!customer) {
      return NextResponse.json({ linked: false })
    }

    return NextResponse.json({ linked: true, customer })
  } catch (e) {
    console.error('[miniapp/me] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
