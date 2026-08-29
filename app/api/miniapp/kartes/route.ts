/**
 * POST /api/miniapp/kartes
 *
 * 顧客向けカルテ一覧。IDトークン検証 → line_user_id から customer を解決 →
 * 自分の kartes のみを返す(visit_date 降順)。
 *
 * 重要(審査・プライバシー): 顧客に見せてよいフィールドのみ返す。
 * - 返す: visit_date / menu_name / staff_name / ai_summary / ai_next_recommendation / 写真
 * - 返さない: ai_warnings(アレルギー/ダメージ警告) / ai_communication_scripts(接客台本)
 *   これらはオーナー専用情報のためサーバ側で除外する。
 *
 * POST を使うのは IDトークンを body で安全に送るため。
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCustomerIdToken, getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

// 顧客に開示してよい ai_summary のキー
const SUMMARY_PUBLIC_KEYS = ['summary', 'hair_condition_analysis', 'recommended_care'] as const
// 顧客に開示してよい ai_next_recommendation のキー
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

    // line_user_id → customer_id
    const { data: customer, error: custErr } = await admin
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('line_user_id', verified.lineUserId)
      .maybeSingle()

    if (custErr) {
      console.error('[miniapp/kartes] customer lookup error:', custErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    if (!customer) {
      return NextResponse.json({ linked: false }, { status: 200 })
    }

    // 自分のカルテのみ(approved のみ顧客に見せる: 未承認カルテは下書き扱い)
    const { data: kartes, error: karteErr } = await admin
      .from('kartes')
      .select('id, visit_date, ai_summary, ai_next_recommendation, status, ai_analyzed_at')
      .eq('salon_id', salonId)
      .eq('customer_id', customer.id)
      .eq('status', 'approved')
      .order('visit_date', { ascending: false })

    if (karteErr) {
      console.error('[miniapp/kartes] kartes lookup error:', karteErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    // 各カルテの after 写真をまとめて取得(N+1回避)。サムネ用に1枚だけ使う
    const karteIds = (kartes || []).map((k) => k.id)
    const thumbByKarte: Record<string, string> = {}
    if (karteIds.length > 0) {
      const { data: photos } = await admin
        .from('karte_photos')
        .select('karte_id, photo_type, public_url')
        .in('karte_id', karteIds)
        .eq('salon_id', salonId)
        .eq('photo_type', 'after')
      for (const p of photos || []) {
        if (p.public_url && !thumbByKarte[p.karte_id]) {
          thumbByKarte[p.karte_id] = p.public_url
        }
      }
    }

    // オーナー専用フィールドを除外し、顧客向けに整形
    const sanitized = (kartes || []).map((k) => ({
      id: k.id,
      visit_date: k.visit_date,
      summary: pick(k.ai_summary as any, SUMMARY_PUBLIC_KEYS),
      next_recommendation: pick(k.ai_next_recommendation as any, RECO_PUBLIC_KEYS),
      thumbnail: thumbByKarte[k.id] || null,
    }))

    return NextResponse.json({ linked: true, kartes: sanitized })
  } catch (e) {
    console.error('[miniapp/kartes] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
