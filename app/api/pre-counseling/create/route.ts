/**
 * POST /api/pre-counseling/create
 * 事前カウンセリング作成エンドポイント
 *
 * 責務:
 * - 認証確認（beauty salon owner）
 * - salon と customer の所有権確認
 * - セキュアなトークン生成
 * - pre_counselings レコード作成
 * - LIFF URL 生成（LINE 内完結のため）
 * - CreatePreCounselingResponse を返す
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSecureToken } from '@/lib/security/token'
import {
  CreatePreCounselingRequest,
  CreatePreCounselingResponse,
  PreCounselingError,
  PRE_COUNSELING_ERROR_MESSAGES,
} from '@/types/pre-counseling'

// ========================================
// エラーレスポンスヘルパー
// ========================================

function errorResponse(
  error: PreCounselingError,
  statusCode: number = 400
): NextResponse {
  return NextResponse.json(
    { error, message: PRE_COUNSELING_ERROR_MESSAGES[error] },
    { status: statusCode }
  )
}

// ========================================
// POST ハンドラー
// ========================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: リクエスト body をパース
    let body: CreatePreCounselingRequest
    try {
      body = await request.json()
    } catch {
      return errorResponse('INVALID_INPUT', 400)
    }

    const { customer_id, salon_id, reservation_id } = body
    // scheduled_send_at は将来の cron スケジュール機能用、現在は LINE 送信時に sent_at 更新

    // Step 2: 必須フィールドチェック
    if (!customer_id || !salon_id) {
      return errorResponse('INVALID_INPUT', 400)
    }

    // Step 3: 認証確認
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 401)
    }

    // Step 4: salon の所有権確認
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id, owner_user_id')
      .eq('id', salon_id)
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError) {
      console.error('Salon lookup error:', salonError)
      return errorResponse('INTERNAL_ERROR', 500)
    }

    if (!salon) {
      return errorResponse('UNAUTHORIZED', 403)
    }

    // Step 5: customer の所有権確認（同じサロン配下か）
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, salon_id')
      .eq('id', customer_id)
      .eq('salon_id', salon.id)
      .maybeSingle()

    if (customerError) {
      console.error('Customer lookup error:', customerError)
      return errorResponse('INTERNAL_ERROR', 500)
    }

    if (!customer) {
      return errorResponse('UNAUTHORIZED', 403)
    }

    // Step 6: セキュアなトークン生成
    const token = generateSecureToken()

    // Step 7: pre_counselings レコード作成
    const { data: preCounseling, error: insertError } = await supabase
      .from('pre_counselings')
      .insert({
        customer_id,
        salon_id,
        reservation_id: reservation_id || null,
        token,
        status: 'pending',
      })
      .select('id, status')
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return errorResponse('INTERNAL_ERROR', 500)
    }

    if (!preCounseling) {
      return errorResponse('INTERNAL_ERROR', 500)
    }

    // Step 8: LIFF URL 生成（LINE 内完結）
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID_PRE_COUNSELING || 'PLACEHOLDER'
    const liffUrl = `https://liff.line.me/${liffId}?token=${token}`

    // Step 9: レスポンス返却
    const response: CreatePreCounselingResponse = {
      pre_counseling_id: preCounseling.id,
      token,
      liff_url: liffUrl,
      status: preCounseling.status,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return errorResponse('INTERNAL_ERROR', 500)
  }
}
