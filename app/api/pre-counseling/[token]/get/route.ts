/**
 * GET /api/pre-counseling/[token]
 * 事前カウンセリング情報取得エンドポイント
 *
 * 責務:
 * - token 検証（validatePreCounselingToken）
 * - salon/customer 情報取得（Service Role）
 * - 顧客名マスキング（A2 ルール）
 * - opened_at 更新（初回のみ、race condition 対策）
 * - GetPreCounselingResponse 返却
 */

import { NextRequest, NextResponse } from 'next/server'
import { validatePreCounselingToken } from '@/lib/security/token'
import { maskCustomerName } from '@/lib/security/privacy'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  GetPreCounselingResponse,
  PreCounselingError,
  PRE_COUNSELING_ERROR_MESSAGES,
} from '@/types/pre-counseling'

// ========================================
// エラーレスポンスヘルパー
// ========================================

function errorResponse(
  error: PreCounselingError,
  statusCode: number
): NextResponse {
  return NextResponse.json(
    { error, message: PRE_COUNSELING_ERROR_MESSAGES[error] },
    { status: statusCode }
  )
}

// ========================================
// ステータスコードマッピング
// ========================================

const statusCodeMap: Record<PreCounselingError, number> = {
  INVALID_TOKEN: 400,
  EXPIRED_TOKEN: 410,
  NOT_FOUND: 404,
  ALREADY_SUBMITTED: 409,
  INVALID_INPUT: 400,
  UNAUTHORIZED: 401,
  INTERNAL_ERROR: 500,
}

// ========================================
// GET ハンドラー
// ========================================

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    // Step 1: token を動的パラメータから取得
    const { token } = await props.params

    // Step 2: token 検証（形式、DB存在確認、有効期限、ステータス）
    const validation = await validatePreCounselingToken(token)

    // Step 3: 検証失敗 → エラーレスポンス
    if (!validation.valid || !validation.preCounseling) {
      const errorCode = validation.error || 'INTERNAL_ERROR'
      return errorResponse(errorCode, statusCodeMap[errorCode])
    }

    const preCounseling = validation.preCounseling

    // Step 4: Admin クライアント初期化（RLS バイパス）
    const admin = createAdminClient()

    // Step 5: salon 情報取得（名前）
    const { data: salon, error: salonError } = await admin
      .from('salons')
      .select('id, name')
      .eq('id', preCounseling.salon_id)
      .maybeSingle()

    if (salonError || !salon) {
      console.error('Salon lookup error:', salonError)
      return errorResponse('INTERNAL_ERROR', 500)
    }

    // Step 6: customer 情報取得（名前） + マスキング
    const { data: customer, error: customerError } = await admin
      .from('customers')
      .select('id, name')
      .eq('id', preCounseling.customer_id)
      .maybeSingle()

    if (customerError || !customer) {
      console.error('Customer lookup error:', customerError)
      return errorResponse('INTERNAL_ERROR', 500)
    }

    const maskedCustomerName = maskCustomerName(customer.name)

    // Step 7: opened_at 更新（初回のみ、race condition 対策）
    let currentStatus = preCounseling.status

    if (!preCounseling.opened_at) {
      const { error: updateError } = await admin
        .from('pre_counselings')
        .update({
          opened_at: new Date().toISOString(),
          status: 'opened',
        })
        .eq('id', preCounseling.id)
        .is('opened_at', null)

      if (updateError) {
        // 更新失敗してもレスポンスは返す（致命的でない）
        console.error('opened_at update error:', updateError)
      } else {
        currentStatus = 'opened'
      }
    }

    // Step 8: レスポンス返却
    const response: GetPreCounselingResponse = {
      pre_counseling_id: preCounseling.id,
      customer_name: maskedCustomerName,
      salon_name: salon.name,
      visit_date: null, // Phase 1.5: reservations テーブル未連携、将来対応
      status: currentStatus,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('GET /api/pre-counseling/[token] unexpected error:', error)
    return errorResponse('INTERNAL_ERROR', 500)
  }
}
