/**
 * POST /api/tools/hair-check/save
 *
 * 診断結果を「マイカルテに保存」する。LINE登録(連携)後に呼ばれる。
 * - IDトークン検証 → customer 解決(連携済み前提)
 * - 渡された診断結果を kartes に1件作成(visit_dateは当日・AIサマリ互換キーで保存)
 * - diagnosis_results があれば converted_to_karte を更新
 *
 * 診断結果は quiz/photo どちらも同じ result 構造(カルテ互換)で受け取る。
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

    const result = body.result
    if (!result || typeof result !== 'object') {
      return NextResponse.json({ error: '診断結果がありません' }, { status: 400 })
    }

    const salonId = getKireiTsurumiSalonId()
    if (!salonId) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const admin = createAdminClient()

    // 連携済み customer を解決
    const { data: customer } = await admin
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('line_user_id', verified.lineUserId)
      .maybeSingle()

    if (!customer) {
      // 未連携 → 連携が先
      return NextResponse.json({ linked: false }, { status: 200 })
    }

    // 診断結果を ai_summary 互換でカルテ化
    const aiSummary = {
      summary: result.level_name
        ? `髪質診断の結果：${result.level_name}`
        : '髪質診断の結果',
      hair_condition_analysis: result.hair_condition_analysis || '',
      recommended_care: result.recommended_care || '',
      source: 'hair-check',
      generated_at: new Date().toISOString(),
    }

    const today = new Date()
    const visitDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`

    const { data: karte, error: insErr } = await admin
      .from('kartes')
      .insert({
        salon_id: salonId,
        customer_id: customer.id,
        visit_date: visitDate,
        ai_summary: aiSummary,
        // 診断由来のカルテは顧客本人の自己診断記録。承認済み扱いで本人に表示可
        status: 'approved',
      })
      .select('id')
      .single()

    if (insErr) {
      console.error('[tools/hair-check/save] insert error:', insErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    // diagnosis_results の変換フラグ更新(session_id があれば)
    if (typeof body.session_id === 'string' && body.session_id) {
      try {
        await admin
          .from('diagnosis_results')
          .update({ converted_to_karte: true, line_user_id: verified.lineUserId })
          .eq('session_id', body.session_id)
      } catch (e) {
        console.warn('[tools/hair-check/save] flag update skipped:', e)
      }
    }

    return NextResponse.json({ linked: true, karte_id: karte.id })
  } catch (e) {
    console.error('[tools/hair-check/save] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
