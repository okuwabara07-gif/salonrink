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
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { callClaude, parseJsonResponse } from '@/lib/ai/claude-client'
import {
  analyzePreCounseling,
  validateAIResponse,
  getFallbackResponse,
} from '@/lib/ai/prompts/pre-counseling'
import { checkAIUsageLimit, recordAIUsage } from '@/lib/ai/usage-tracker'
import type { PreCounseling } from '@/types/pre-counseling'

// ========================================
// エラーレスポンスヘルパー
// ========================================

function errorResponse(error: string, statusCode: number): NextResponse {
  return NextResponse.json({ error }, { status: statusCode })
}

// ========================================
// POST ハンドラー
// ========================================

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

    // Step 5: salon_id を pre_counseling から取得
    const salon_id = (preCounseling as PreCounseling).salon_id

    // Step 6: salon 所有権確認（認可）
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

    // Step 7: ステータスチェック（'submitted' のみ）
    if ((preCounseling as PreCounseling).status !== 'submitted') {
      return errorResponse('Pre-counseling status must be submitted', 409)
    }

    // Step 8: AI 使用量チェック
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

    // Step 9: customer 情報取得
    const { data: customer, error: customerError } = await admin
      .from('customers')
      .select('id, name, visit_count, last_visit')
      .eq('id', (preCounseling as PreCounseling).customer_id)
      .maybeSingle()

    if (customerError || !customer) {
      console.error('Customer lookup error:', customerError)
      return errorResponse('Customer not found', 404)
    }

    // Step 10: 最近のカルテ取得（visit_date のみ、最小限）
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

    // Step 11: プロンプト生成（maskCustomerName は analyzePreCounseling 内で適用）
    const recentKarteSummaries = (recentKartes || []).map((k: any) => ({
      date: k.visit_date,
      menu_name: '', // karte_recipes 連携で後日対応
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

    // Step 12: Claude Haiku 呼び出し
    let claudeResponse
    let analysisResult
    let usedFallback = false

    try {
      claudeResponse = await callClaude(prompt)
      const validation = validateAIResponse(claudeResponse.content)

      if (validation.valid && validation.cleaned) {
        analysisResult = validation.cleaned
      } else {
        // JSON パース失敗または検証失敗 → フォールバック
        console.warn('AI response validation failed:', validation.errors)
        analysisResult = getFallbackResponse()
        usedFallback = true
      }
    } catch (error) {
      // AI 呼び出し失敗 → フォールバック
      console.error('Claude API error:', error)
      analysisResult = getFallbackResponse()
      usedFallback = true
      claudeResponse = {
        content: '',
        usage: { input_tokens: 0, output_tokens: 0 },
        model: 'claude-haiku-4-5-20251001',
      }
    }

    // Step 13: validateAIResponse で検証済み

    // Step 14: DB UPDATE（AI 成功/フォールバック時で条件分岐）
    let updateError
    if (!usedFallback) {
      // AI 成功時: status='analyzed', ai_analyzed_at=now
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
      // AI 失敗時（フォールバック）: status='submitted'のまま、ai_analyzed_at=null
      const result = await admin
        .from('pre_counselings')
        .update({
          ai_analysis: analysisResult,
          // ai_analyzed_at は NULL のまま（再試行可能）
          // status は 'submitted' のまま（再試行可能）
          updated_at: new Date().toISOString(),
        })
        .eq('id', pre_counseling_id)
      updateError = result.error
    }

    if (updateError) {
      console.error('Database update error:', updateError)
      return errorResponse('Failed to save analysis', 500)
    }

    // Step 15: 使用量記録（AI 成功時のみ、フォールバック時は記録しない）
    if (!usedFallback && claudeResponse) {
      await recordAIUsage(
        salon_id,
        'pre_counseling_analysis',
        claudeResponse.usage.input_tokens,
        claudeResponse.usage.output_tokens
      ).catch((err) => console.error('Usage record failed:', err))
    }

    // Step 16: レスポンス返却
    return NextResponse.json(
      {
        success: true,
        analysis: analysisResult,
        tokens: {
          input: claudeResponse?.usage.input_tokens || 0,
          output: claudeResponse?.usage.output_tokens || 0,
        },
        usedFallback,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/ai/pre-counseling-analysis unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
