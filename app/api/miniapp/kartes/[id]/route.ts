/**
 * POST /api/miniapp/kartes/[id]
 *
 * カルテ詳細(写真込み)。本人所有のカルテのみ返す。
 * オーナー専用フィールド(ai_warnings / ai_communication_scripts)は返さない。
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCustomerIdToken, getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

const SUMMARY_PUBLIC_KEYS = ['summary', 'hair_condition_analysis', 'recommended_care'] as const
const RECO_PUBLIC_KEYS = [
  'next_visit_date',
  'recommended_menu',
  'reasoning',
  'homecare_duration',
  'additional_notes',
] as const

function pick(obj: Record<string, any> | null | undefined, keys: readonly string[]) {
  if (!obj || typeof obj !== 'object') return null
  const out: Record<string, any> = {}
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') out[k] = obj[k]
  }
  return Object.keys(out).length ? out : null
}

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

    // 本人所有 + approved のカルテのみ
    const { data: karte, error: karteErr } = await admin
      .from('kartes')
      .select('id, visit_date, ai_summary, ai_next_recommendation, status, customer_id')
      .eq('id', id)
      .eq('salon_id', salonId)
      .eq('customer_id', customer.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (karteErr) {
      console.error('[miniapp/kartes/[id]] lookup error:', karteErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    if (!karte) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // 写真(before/after)
    const { data: photos } = await admin
      .from('karte_photos')
      .select('photo_type, public_url')
      .eq('karte_id', karte.id)
      .eq('salon_id', salonId)

    return NextResponse.json({
      linked: true,
      karte: {
        id: karte.id,
        visit_date: karte.visit_date,
        summary: pick(karte.ai_summary as any, SUMMARY_PUBLIC_KEYS),
        next_recommendation: pick(karte.ai_next_recommendation as any, RECO_PUBLIC_KEYS),
        photos: (photos || [])
          .filter((p) => p.public_url)
          .map((p) => ({ type: p.photo_type, url: p.public_url })),
      },
    })
  } catch (e) {
    console.error('[miniapp/kartes/[id]] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
