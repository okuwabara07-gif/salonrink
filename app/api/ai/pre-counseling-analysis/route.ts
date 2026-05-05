/**
 * POST /api/ai/pre-counseling-analysis
 * 事前カウンセリング AI 解析エンドポイント
 *
 * 責務:
 * - 認証 + 認可確認（salon owner）
 * - pre_counseling 取得
 * - AI 使用量チェック
 * - Claude Haiku で AI 解析実行
 * - 結果を DB に保存
 * - 使用量記録
 * - kartes への連携（reservation_id 経由でカルテに ai_summary / ai_communication_scripts 反映）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { callClaude } from '@/lib/ai/claude-client'
import {
  analyzePreCounseling,
  validateAIResponse,
  getFallbackResponse,
} from '@/lib/ai/prompts/pre-counseling'
import { checkAIUsageLimit, recordAIUsage } from '@/lib/ai/usage-tracker'
import type { PreCounseling } from '@/types/pre-counseling'

const MODEL_NAME = 'claude-haiku-4-5-20251001'

function errorResponse(error: string, statusCode: number): NextResponse {
  return NextResponse.json({ error }, { status: statusCode })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: リクエスト body をパース
    let body: { pre_counseling_id: string }
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid request body', 400)
    }

    const { pre_counseling_id } = body
    if (!pre_counseling_id) {
      return errorResponse('Missing required field: pre_counseling_id', 400)
    }

    // Step 2: 認証確認
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // Step 3: admin クライアント初期化（RLS バイパス）
    const admin = createAdminClient()

    // Step 4: pre_counseling 取得
    const { data: preCounseling, error: preCounselingError } = await admin
      .from('pre_counselings')
      .select('*')
      .eq('id', pre_counseling_id)
      .maybeSingle()

    if (preCounselingError || !preCounseling) {
      console.error('Pre-counseling lookup error:', preCounselingError)
      return errorResponse('Pre-counseling not found', 404)
    }

    const salon_id = (preCounseling as PreCounseling).salon_id

    // Step 5: salon 所有権確認（認可）
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id, owner_user_id')
      .eq('id', salon_id)
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError || !salon) {
      console.error('Salon lookup error:', salonError)
      return errorResponse('Unauthorized', 403)
    }

    // Step 6: ステータスチェック（'submitted' のみ）
    if ((preCounseling as PreCounseling).status !== 'submitted') {
      return errorResponse('Pre-counseling status must be submitted', 409)
    }

    // Step 7: AI 使用量チェック
    const usageStatus = await checkAIUsageLimit(salon_id)
    if (!usageStatus.allowed) {
      return NextResponse.json(
        {
          error: 'AI usage limit exceeded',
          used: usageStatus.used,
          limit: usageStatus.limit,
          plan: usageStatus.plan,
        },
        { status: 429 }
      )
    }

    // Step 8: customer 情報取得
    const { data: customer, error: customerError } = await admin
      .from('customers')
      .select('id, name, visit_count, last_visit')
      .eq('id', (preCounseling as PreCounseling).customer_id)
      .maybeSingle()

    if (customerError || !customer) {
      console.error('Customer lookup error:', customerError)
      return errorResponse('Customer not found', 404)
    }

    // Step 9: 最近のカルテ取得（visit_date のみ、最小限）
    const { data: recentKartes, error: kartesError } = await admin
      .from('kartes')
      .select('id, visit_date')
      .eq('salon_id', salon_id)
      .eq('customer_id', (preCounseling as PreCounseling).customer_id)
      .order('visit_date', { ascending: false })
      .limit(3)

    if (kartesError) {
      console.error('Kartes lookup error:', kartesError)
      // カルテ取得失敗は非致命的、続行
    }

    // Step 10: プロンプト生成
    const recentKarteSummaries = (recentKartes || []).map((k: any) => ({
      date: k.visit_date,
      menu_name: '',
      hair_condition: undefined,
    }))

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

    // Step 11: Claude Haiku 呼び出し
    let claudeResponse
    let analysisResult
    let usedFallback = false

    try {
      claudeResponse = await callClaude(prompt)
      const validation = validateAIResponse(claudeResponse.content)

      if (validation.valid && validation.cleaned) {
        analysisResult = validation.cleaned
      } else {
        console.warn('AI response validation failed:', validation.errors)
        analysisResult = getFallbackResponse()
        usedFallback = true
      }
    } catch (error) {
      console.error('Claude API error:', error)
      analysisResult = getFallbackResponse()
      usedFallback = true
      claudeResponse = {
        content: '',
        usage: { input_tokens: 0, output_tokens: 0 },
        model: MODEL_NAME,
      }
    }

    // Step 12: DB UPDATE（AI 成功/フォールバック時で条件分岐）
    let updateError
    if (!usedFallback) {
      const result = await admin
        .from('pre_counselings')
        .update({
          ai_analysis: analysisResult,
          ai_analyzed_at: new Date().toISOString(),
          status: 'analyzed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', pre_counseling_id)
      updateError = result.error
    } else {
      const result = await admin
        .from('pre_counselings')
        .update({
          ai_analysis: analysisResult,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pre_counseling_id)
      updateError = result.error
    }

    if (updateError) {
      console.error('Database update error:', updateError)
      return errorResponse('Failed to save analysis', 500)
    }

    // Step 13: kartes への連携（AI成功時のみ・対応するreservation_idのkartesがある場合）
    let karteUpdated = false
    if (!usedFallback && (preCounseling as any).reservation_id) {
      const { data: matchingKarte } = await admin
        .from('kartes')
        .select('id')
        .eq('reservation_id', (preCounseling as any).reservation_id)
        .maybeSingle()

      if (matchingKarte) {
        const { error: karteError } = await admin
          .from('kartes')
          .update({
            ai_summary: {
              summary: analysisResult.summary,
              generated_at: new Date().toISOString(),
              model: MODEL_NAME,
            },
            ai_communication_scripts: {
              pre_service: analysisResult.communication_tips,
              confirmation_checklist: analysisResult.preparation_notes,
              suggested_menu: analysisResult.suggested_menu,
              generated_at: new Date().toISOString(),
              model: MODEL_NAME,
            },
          })
          .eq('id', matchingKarte.id)

        if (karteError) {
          console.error('Karte update error (non-fatal):', karteError)
        } else {
          karteUpdated = true
        }
      }
    }

    // Step 14: 使用量記録（AI 成功時のみ）
    if (!usedFallback && claudeResponse) {
      await recordAIUsage(
        salon_id,
        'pre_counseling_analysis',
        claudeResponse.usage.input_tokens,
        claudeResponse.usage.output_tokens
      ).catch((err) => console.error('Usage record failed:', err))
    }

    // Step 15: レスポンス返却
    return NextResponse.json(
      {
        success: true,
        analysis: analysisResult,
        tokens: {
          input: claudeResponse?.usage.input_tokens || 0,
          output: claudeResponse?.usage.output_tokens || 0,
        },
        usedFallback,
        karteUpdated,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/ai/pre-counseling-analysis unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
