/**
 * POST /api/pre-counseling/[token]/submit
 * 事前カウンセリング回答受信エンドポイント
 *
 * 責務:
 * - token 検証
 * - answers/photos バリデーション
 * - DB UPDATE（answers, photos, submitted_at, status='submitted'）
 * - AI 解析を after() で非同期実行（レスポンス返却後にVercelが保証実行）
 * - 顧客には即座にレスポンス返却
 */

import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { validatePreCounselingToken } from '@/lib/security/token'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  SubmitPreCounselingRequest,
  SubmitPreCounselingResponse,
  PreCounselingError,
  PRE_COUNSELING_ERROR_MESSAGES,
} from '@/types/pre-counseling'

function errorResponse(
  error: PreCounselingError,
  statusCode: number
): NextResponse {
  return NextResponse.json(
    { error, message: PRE_COUNSELING_ERROR_MESSAGES[error] },
    { status: statusCode }
  )
}

const statusCodeMap: Record<PreCounselingError, number> = {
  INVALID_TOKEN: 400,
  EXPIRED_TOKEN: 410,
  NOT_FOUND: 404,
  ALREADY_SUBMITTED: 409,
  INVALID_INPUT: 400,
  UNAUTHORIZED: 401,
  INTERNAL_ERROR: 500,
}

/**
 * AI解析を非同期トリガー
 * after() で囲まれた関数はレスポンス返却後にVercelが実行を保証
 */
async function triggerAIAnalysis(preCounselingId: string, baseUrl: string): Promise<void> {
  const secret = process.env.INTERNAL_API_SECRET
  if (!secret) {
    console.warn('[submit/after] INTERNAL_API_SECRET not set; AI trigger skipped')
    return
  }

  console.log(`[submit/after] Triggering AI analysis for ${preCounselingId}`)

  try {
    const res = await fetch(`${baseUrl}/api/ai/pre-counseling-analysis/internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Auth': secret,
      },
      body: JSON.stringify({ pre_counseling_id: preCounselingId }),
    })
    console.log(`[submit/after] Internal API responded with ${res.status}`)
  } catch (err) {
    console.error('[submit/after] AI analysis trigger failed:', err)
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const { token } = await props.params

    // Step 1: token 検証
    const validation = await validatePreCounselingToken(token)
    if (!validation.valid || !validation.preCounseling) {
      const errorCode = validation.error || 'INTERNAL_ERROR'
      return errorResponse(errorCode, statusCodeMap[errorCode])
    }

    const preCounseling = validation.preCounseling

    // Step 2: body パース
    let body: SubmitPreCounselingRequest
    try {
      body = await request.json()
    } catch {
      return errorResponse('INVALID_INPUT', 400)
    }

    // Step 3: answers バリデーション
    if (!body.answers || typeof body.answers !== 'object') {
      return errorResponse('INVALID_INPUT', 400)
    }

    // Step 4: photos バリデーション（最大10枚）
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

    // Step 5: DB UPDATE
    const admin = createAdminClient()
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

    // Step 6: AI 解析を after() で非同期トリガー
    // after() はレスポンス返却後にVercelが実行を保証する
    after(async () => {
      await triggerAIAnalysis(preCounseling.id, request.nextUrl.origin)
    })

    // Step 7: 即座にレスポンス返却
    const response: SubmitPreCounselingResponse = {
      status: 'submitted',
      submitted_at: now,
      ai_analysis_scheduled: true,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('POST /api/pre-counseling/[token]/submit unexpected error:', error)
    return errorResponse('INTERNAL_ERROR', 500)
  }
}
