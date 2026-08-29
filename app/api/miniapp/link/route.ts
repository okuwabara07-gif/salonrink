/**
 * POST /api/miniapp/link
 *
 * 顧客向けミニアプリの初回連携エンドポイント。
 *
 * フロー:
 * 1. LIFF IDトークンを検証し line_user_id を確定(自己申告を信用しない)
 * 2. 既に customers.line_user_id が紐付いていれば即成功
 * 3. 未連携なら、入力された電話番号で同一サロンの customers を照合
 * 4. 照合成功 → customers.line_user_id / line_display_name を更新
 *
 * 審査方針: 新規の会員登録フォームは作らない。来店時に登録済の電話番号での照合のみ。
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCustomerIdToken, getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

function normalizePhone(raw: string): string {
  // 数字以外を除去(ハイフン・空白・全角対策の最小版)
  return raw.replace(/[^0-9]/g, '')
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))
    const { idToken, phone, displayName } = body

    const verified = await verifyCustomerIdToken(idToken)
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: verified.status })
    }

    const salonId = getKireiTsurumiSalonId()
    if (!salonId) {
      console.error('[miniapp/link] MINIAPP_SALON_ID not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const admin = createAdminClient()

    // 1. 既存連携の確認(line_user_id で照合)
    const { data: existing, error: existErr } = await admin
      .from('customers')
      .select('id, name')
      .eq('salon_id', salonId)
      .eq('line_user_id', verified.lineUserId)
      .maybeSingle()

    if (existErr) {
      console.error('[miniapp/link] existing lookup error:', existErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ linked: true, customer_id: existing.id, name: existing.name })
    }

    // 2. 未連携 → 電話番号での照合が必要
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ linked: false, need_phone: true }, { status: 200 })
    }

    const normalized = normalizePhone(phone)
    if (normalized.length < 10) {
      return NextResponse.json({ error: '電話番号を正しく入力してください' }, { status: 400 })
    }

    // 同一サロンで電話番号一致かつ未連携の顧客を探す
    const { data: candidates, error: candErr } = await admin
      .from('customers')
      .select('id, name, phone, line_user_id')
      .eq('salon_id', salonId)

    if (candErr) {
      console.error('[miniapp/link] candidate lookup error:', candErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    const match = (candidates || []).find(
      (c) => c.phone && normalizePhone(c.phone) === normalized
    )

    if (!match) {
      return NextResponse.json(
        { linked: false, error: 'ご登録の電話番号が見つかりませんでした。店舗にご確認ください。' },
        { status: 404 }
      )
    }

    if (match.line_user_id && match.line_user_id !== verified.lineUserId) {
      // 既に別のLINEに紐付け済み(取り違え防止)
      return NextResponse.json(
        { linked: false, error: 'この電話番号は既に別のLINEと連携されています。店舗にご確認ください。' },
        { status: 409 }
      )
    }

    // 3. 紐付け更新
    const { error: updateErr } = await admin
      .from('customers')
      .update({
        line_user_id: verified.lineUserId,
        line_display_name:
          (typeof displayName === 'string' && displayName) || verified.name || null,
      })
      .eq('id', match.id)

    if (updateErr) {
      console.error('[miniapp/link] update error:', updateErr)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    return NextResponse.json({ linked: true, customer_id: match.id, name: match.name })
  } catch (e) {
    console.error('[miniapp/link] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
