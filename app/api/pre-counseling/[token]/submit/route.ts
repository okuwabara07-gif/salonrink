/**
 * POST /api/pre-counseling/[token]/submit
 * 事前カウンセリング回答受信エンドポイント
 *
 * 責務:
 * - token 検証（validatePreCounselingToken）
 * - answers/photos バリデーション
 * - DB UPDATE（answers, photos, submitted_at, status）
 * - SubmitPreCounselingResponse 返却
 *
 * AI 解析は別 commit で実装予定（/api/pre-counseling/[id]/analyze）
 */

import { NextRequest, NextResponse } from 'next/server'
import { validatePreCounselingToken } from '@/lib/security/token'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  SubmitPreCounselingRequest,
  SubmitPreCounselingResponse,
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
// POST ハンドラー
// ========================================

export async function POST(
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

    // Step 4: リクエスト body をパース
    let body: SubmitPreCounselingRequest
    try {
      body = await request.json()
    } catch {
      return errorResponse('INVALID_INPUT', 400)
    }

    // Step 5: answers バリデーション
    if (!body.answers || typeof body.answers !== 'object') {
      return errorResponse('INVALID_INPUT', 400)
    }

    // Step 5b: photos バリデーション（オプション）
    if (body.photos) {
      if (!Array.isArray(body.photos)) {
        return errorResponse('INVALID_INPUT', 400)
      }

      if (body.photos.length > 10) {
        return errorResponse('INVALID_INPUT', 400)
      }

      if (!body.photos.every((p) => typeof p === 'string')) {
        return errorResponse('INVALID_INPUT', 400)
      }
    }

    // Step 6: Admin クライアント初期化（RLS バイパス）
    const admin = createAdminClient()

    // Step 7: DB UPDATE（answers, photos, submitted_at, status）
    const now = new Date().toISOString()
    const { error: updateError } = await admin
      .from('pre_counselings')
      .update({
        answers: body.answers,
        photos: body.photos || [],
        submitted_at: now,
        status: 'submitted',
      })
      .eq('id', preCounseling.id)
      .is('submitted_at', null)

    if (updateError) {
      console.error('Database update error:', updateError)
      return errorResponse('INTERNAL_ERROR', 500)
    }

    // Step 8: レスポンス返却
    const response: SubmitPreCounselingResponse = {
      status: 'submitted',
      submitted_at: now,
      ai_analysis_scheduled: false, // 現在は実装なし（将来 true）
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('POST /api/pre-counseling/[token]/submit unexpected error:', error)
    return errorResponse('INTERNAL_ERROR', 500)
  }
}
