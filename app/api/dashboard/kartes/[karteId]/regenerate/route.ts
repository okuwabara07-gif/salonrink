/**
 * POST /api/dashboard/kartes/[karteId]/regenerate
 * 中継 API: クライアント → Internal API 経由で AI 再分析をトリガー
 *
 * 責務:
 * - Supabase auth で認証ユーザチェック
 * - owner_user_id で salon 取得
 * - kartes テーブルから該当カルテ取得
 * - ユーザの salon_id と karte の salon_id が一致するか確認（権限チェック）
 * - サーバーサイドから internal API を呼び出し（INTERNAL_API_SECRET を使用）
 * - レスポンスをクライアントに返す
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ karteId: string }> }
): Promise<NextResponse> {
  try {
    const { karteId } = await props.params

    if (!karteId) {
      return NextResponse.json({ error: 'Missing karteId' }, { status: 400 })
    }

    // Step 1: Supabase auth で認証ユーザチェック
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('regenerate: unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2: owner_user_id で salon 取得
    const { data: userSalon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError || !userSalon) {
      console.error('regenerate: salon not found for user:', user.id)
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Step 3: 該当カルテ取得（admin クライアント）
    const admin = createAdminClient()
    const { data: karte, error: karteError } = await admin
      .from('kartes')
      .select('id, salon_id')
      .eq('id', karteId)
      .maybeSingle()

    if (karteError || !karte) {
      console.error('regenerate: karte not found:', karteId)
      return NextResponse.json({ error: 'Karte not found' }, { status: 404 })
    }

    // Step 4: 権限チェック（salon_id が一致するか）
    if (karte.salon_id !== userSalon.id) {
      console.warn('regenerate: unauthorized salon access', {
        userId: user.id,
        userSalonId: userSalon.id,
        karteSalonId: karte.salon_id,
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Step 5: サーバーサイドから internal API を呼び出し
    const internalApiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/karte-regenerate/internal`
    const internalResponse = await fetch(internalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Auth': process.env.INTERNAL_API_SECRET || '',
      },
      body: JSON.stringify({ karte_id: karteId }),
    })

    if (!internalResponse.ok) {
      console.error('regenerate: internal API call failed:', internalResponse.status)
      return NextResponse.json(
        { error: 'Failed to regenerate analysis' },
        { status: 500 }
      )
    }

    const internalData = await internalResponse.json()

    // Phase2: AI枠超過時は internal が quota_exceeded を返す。そのまま UI へ透過
    if (internalData?.status === 'quota_exceeded') {
      return NextResponse.json(
        {
          status: 'quota_exceeded',
          karte_id: karteId,
          plan: internalData.plan,
          used: internalData.used,
          limit: internalData.limit,
        },
        { status: 200 }
      )
    }

    // Step 6: レスポンス返却
    return NextResponse.json(
      {
        status: 'success',
        karte_id: karteId,
        regenerated_at: internalData.regenerated_at,
        ai_analysis: internalData.ai_analysis,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('regenerate: unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
