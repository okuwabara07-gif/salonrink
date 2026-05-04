/**
 * POST /api/pre-counseling/[token]/submit
 * 事前カウンセリング回答受信エンドポイント
 *
 * 責務:
 * - token 検証（validatePreCounselingToken）
 * - answers/photos バリデーション
 * - DB UPDATE（answers, photos, submitted_at, status）
 * - Claude Haiku による AI 解析（使用量チェック後）
 * - AI 解析結果を DB に保存
 * - SubmitPreCounselingResponse 返却
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
import type { PreCounseling } from '@/types/pre-counseling'
import {
  analyzePreCounseling,
  validateAIResponse,
  getFallbackResponse,
} from '@/lib/ai/prompts/pre-counseling'
import { callClaude, ClaudeResponse } from '@/lib/ai/claude-client'
import { checkAIUsageLimit, recordAIUsage } from '@/lib/ai/usage-tracker'

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

    // Step 8: AI 解析（使用量チェック後に実行）
    const salon_id = preCounseling.salon_id
    const usageStatus = await checkAIUsageLimit(salon_id)

    if (usageStatus.allowed) {
      // Step 9: customer 情報取得
      const { data: customer } = await admin
        .from('customers')
        .select('id, name, visit_count, last_visit')
        .eq('id', preCounseling.customer_id)
        .maybeSingle()

      if (customer) {
        // Step 10: 最近のカルテ取得（直近3件）
        const { data: recentKartes } = await admin
          .from('kartes')
          .select('id, visit_date')
          .eq('salon_id', salon_id)
          .eq('customer_id', preCounseling.customer_id)
          .order('visit_date', { ascending: false })
          .limit(3)

        const recentKarteSummaries = (recentKartes || []).map(
          (k: { id: string; visit_date: string }) => ({
            date: k.visit_date,
            menu_name: '',
            hair_condition: undefined,
          })
        )

        // Step 11: プロンプト生成 + Claude Haiku 呼び出し
        let analysisResult
        let claudeResponse: ClaudeResponse | undefined
        let usedFallback = false

        try {
          const prompt = analyzePreCounseling({
            preCounseling: preCounseling as PreCounseling,
            customer: {
              id: customer.id,
              name: customer.name,
              visit_count: customer.visit_count,
              last_visit: customer.last_visit,
            },
            recentKartes: recentKarteSummaries,
          })

          claudeResponse = await callClaude(prompt)
          const validation = validateAIResponse(claudeResponse.content)

          if (validation.valid && validation.cleaned) {
            analysisResult = validation.cleaned
          } else {
            analysisResult = getFallbackResponse()
            usedFallback = true
          }
        } catch {
          analysisResult = getFallbackResponse()
          usedFallback = true
        }

        // Step 12: AI 解析結果を DB に保存
        await admin
          .from('pre_counselings')
          .update({
            ai_analysis: analysisResult,
            ai_analyzed_at: new Date().toISOString(),
            status: 'analyzed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', preCounseling.id)

        // Step 13: 使用量記録（AI 成功時のみ）
        if (!usedFallback && claudeResponse?.usage) {
          await recordAIUsage(
            salon_id,
            'pre_counseling_analysis',
            claudeResponse.usage.input_tokens,
            claudeResponse.usage.output_tokens
          ).catch(() => {})
        }
      }
    }
    // 使用量制限超過時 or customer 取得失敗時: status='submitted' のまま継続

    // Step 14: レスポンス返却
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
