/**
 * POST /api/ai/pre-counseling-analysis/internal
 * 内部用 AI 解析エンドポイント（非認証・INTERNAL_API_SECRET検証）
 *
 * 責務:
 * - INTERNAL_API_SECRET 検証
 * - pre_counseling 取得（admin権限）
 * - AI 使用量チェック（内部呼び出しのため loose）
 * - Claude Haiku で AI 解析実行
 * - 結果を DB に保存 + kartes 連携
 * - 非同期トリガー用なので失敗は silent（ログのみ）
 */

import { NextRequest, NextResponse, after } from 'next/server'
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: INTERNAL_API_SECRET 検証
    const authHeader = request.headers.get('X-Internal-Auth')
    const secretKey = process.env.INTERNAL_API_SECRET

    if (!secretKey || authHeader !== secretKey) {
      console.warn('Internal API: unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2: body パース
    let body: { pre_counseling_id: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { pre_counseling_id } = body
    if (!pre_counseling_id) {
      return NextResponse.json({ error: 'Missing pre_counseling_id' }, { status: 400 })
    }

    // Step 3: admin クライアント初期化
    const admin = createAdminClient()

    // Step 4: pre_counseling 取得
    const { data: preCounseling, error: pcError } = await admin
      .from('pre_counselings')
      .select('*')
      .eq('id', pre_counseling_id)
      .maybeSingle()

    if (pcError || !preCounseling) {
      console.error('Internal API: pre_counseling not found:', pre_counseling_id)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 5: ステータス確認（submitted のみ処理）
    if ((preCounseling as PreCounseling).status !== 'submitted') {
      console.log('Internal API: pre_counseling not in submitted state:', pre_counseling_id)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 6: AI 使用量チェック（内部呼び出しのため厳密さは low）
    const salon_id = (preCounseling as PreCounseling).salon_id
    const usageStatus = await checkAIUsageLimit(salon_id).catch(() => ({
      allowed: true,
      used: 0,
      limit: 0,
      plan: 'unknown',
    }))

    if (!usageStatus.allowed) {
      console.warn(`Internal API: usage limit exceeded for salon ${salon_id}`)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 7: customer 情報取得
    const { data: customer } = await admin
      .from('customers')
      .select('id, name, visit_count, last_visit')
      .eq('id', (preCounseling as PreCounseling).customer_id)
      .maybeSingle()

    if (!customer) {
      console.error('Internal API: customer not found:', (preCounseling as PreCounseling).customer_id)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 8: 最近のカルテ取得
    const { data: recentKartes } = await admin
      .from('kartes')
      .select('id, visit_date')
      .eq('salon_id', salon_id)
      .eq('customer_id', (preCounseling as PreCounseling).customer_id)
      .order('visit_date', { ascending: false })
      .limit(3)

    // Step 9: プロンプト生成
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

    // Step 10: Claude Haiku 呼び出し
    let analysisResult
    let usedFallback = false
    let claudeResponse

    try {
      claudeResponse = await callClaude(prompt)
      const validation = validateAIResponse(claudeResponse.content)

      if (validation.valid && validation.cleaned) {
        analysisResult = validation.cleaned
      } else {
        console.warn('Internal API: AI validation failed:', validation.errors)
        analysisResult = getFallbackResponse()
        usedFallback = true
      }
    } catch (err) {
      console.error('Internal API: Claude API error:', err)
      analysisResult = getFallbackResponse()
      usedFallback = true
    }

    // Step 11: DB UPDATE
    const { error: updateError } = await admin
      .from('pre_counselings')
      .update({
        ai_analysis: analysisResult,
        ai_analyzed_at: new Date().toISOString(),
        status: 'analyzed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', pre_counseling_id)

    if (updateError) {
      console.error('Internal API: DB update failed:', updateError)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 12: kartes 連携
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
          console.warn('Internal API: karte update failed (non-fatal):', karteError)
        }
      }
    }

    // Step 13: 使用量記録（AI 成功時のみ）
    if (!usedFallback && claudeResponse?.usage) {
      await recordAIUsage(
        salon_id,
        'pre_counseling_analysis',
        claudeResponse.usage.input_tokens,
        claudeResponse.usage.output_tokens
      ).catch((err) => {
        console.error('Internal API: usage recording failed:', err)
      })
    }

    // Step 13.5: AI警告抽出を非同期トリガー
    const customerId = (preCounseling as PreCounseling).customer_id
    after(async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/ai/warnings/internal`
        await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_API_SECRET!,
          },
          body: JSON.stringify({ customer_id: customerId }),
        })
      } catch (e) {
        console.error('[ai-warnings chain] failed:', e)
      }
    })

    // Step 14: 常に 200 返却（非同期処理のため）
    return NextResponse.json(
      {
        success: true,
        pre_counseling_id,
        analyzed: !usedFallback,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Internal API: unexpected error:', error)
    // 非同期トリガーのため、エラーでも 200 返却
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
