/**
 * POST /api/ai/karte-regenerate/internal
 * 内部用 AI 再分析エンドポイント（Commit 48）
 *
 * 責務:
 * - INTERNAL_API_SECRET 検証
 * - karte_id から現カルテ取得
 * - 過去3件のカルテ取得（visit_date desc）
 * - 元の pre_counseling 情報取得（あれば）
 * - プロンプト構築（treatment_note 含む）
 * - Claude Haiku で AI 再分析実行
 * - 結果を kartes テーブル に上書き（ai_* カラム + ai_analyzed_at）
 * - 使用量記録（operation: 'karte_regenerate'）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { callClaude } from '@/lib/ai/claude-client'
import { recordAIUsage, checkAIUsageLimitAdmin } from '@/lib/ai/usage-tracker'

const MODEL_NAME = 'claude-haiku-4-5-20251001'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: INTERNAL_API_SECRET 検証
    const authHeader = request.headers.get('X-Internal-Auth')
    const secretKey = process.env.INTERNAL_API_SECRET

    if (!secretKey || authHeader !== secretKey) {
      console.warn('karte-regenerate: unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2: body パース
    let body: { karte_id: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { karte_id } = body
    if (!karte_id) {
      return NextResponse.json({ error: 'Missing karte_id' }, { status: 400 })
    }

    // Step 3: admin クライアント初期化
    const admin = createAdminClient()

    // Step 4: 現カルテ取得
    const { data: currentKarte, error: karteError } = await admin
      .from('kartes')
      .select('*')
      .eq('id', karte_id)
      .maybeSingle()

    if (karteError || !currentKarte) {
      console.error('karte-regenerate: karte not found:', karte_id)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const karte = currentKarte as any
    const customerId = karte.customer_id
    const salonId = karte.salon_id

    if (!customerId) {
      console.error('karte-regenerate: customer_id missing for karte:', karte_id)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 5: 過去3件のカルテ取得（自分自身除外）
    const { data: recentKartes } = await admin
      .from('kartes')
      .select('id, visit_date, menu_name, treatment_note, ai_summary')
      .eq('salon_id', salonId)
      .eq('customer_id', customerId)
      .neq('id', karte_id)
      .order('visit_date', { ascending: false })
      .limit(3)

    // Step 6: 元の pre_counseling 情報取得（あれば）
    const { data: preCounselings } = await admin
      .from('pre_counselings')
      .select('answers')
      .eq('customer_id', customerId)
      .eq('status', 'analyzed')
      .order('created_at', { ascending: false })
      .limit(1)

    const preCounseling = preCounselings?.[0]

    // Step 7: プロンプト構築
    const pastKarteSummaries = (recentKartes || [])
      .map((k: any) => {
        const summary = k.ai_summary?.summary || '情報なし'
        return `- ${k.visit_date}: ${k.menu_name || '施術名不明'}\n  メモ: ${k.treatment_note || 'なし'}\n  要約: ${summary}`
      })
      .join('\n')

    const prompt = buildPrompt({
      currentKarte: karte,
      pastKarteSummaries,
      preCounselingAnswers: preCounseling?.answers,
    })

    // Phase2: AI枠チェック (内部=admin文脈でRLSバイパス)。超過なら生成/上書き/記録を全てスキップ
    const usageStatus = await checkAIUsageLimitAdmin(salonId)
    if (!usageStatus.allowed) {
      console.warn('karte-regenerate: AI quota exceeded', {
        salonId,
        used: usageStatus.used,
        limit: usageStatus.limit,
        plan: usageStatus.plan,
      })
      return NextResponse.json(
        {
          status: 'quota_exceeded',
          plan: usageStatus.plan,
          used: usageStatus.used,
          limit: usageStatus.limit,
        },
        { status: 200 }
      )
    }

    // Step 8: Claude Haiku 呼び出し
    let analysisResult
    let claudeResponse

    try {
      claudeResponse = await callClaude(prompt)
      analysisResult = parseAIResponse(claudeResponse.content)
    } catch (err) {
      console.error('karte-regenerate: Claude API error:', err)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 9: DB UPDATE（ai_* カラム + ai_analyzed_at）
    const { error: updateError } = await admin
      .from('kartes')
      .update({
        ai_summary: analysisResult.ai_summary,
        ai_communication_scripts: analysisResult.ai_communication_scripts,
        ai_warnings: analysisResult.ai_warnings,
        ai_next_recommendation: analysisResult.ai_next_recommendation,
        ai_analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', karte_id)

    if (updateError) {
      console.error('karte-regenerate: DB update failed:', updateError)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 10: 使用量記録（operation: 'karte_regenerate'）
    if (claudeResponse?.usage) {
      await recordAIUsage(
        salonId,
        'karte_regenerate',
        claudeResponse.usage.input_tokens,
        claudeResponse.usage.output_tokens
      ).catch((err) => {
        console.error('karte-regenerate: usage recording failed:', err)
      })
    }

    // Step 11: レスポンス返却
    return NextResponse.json(
      {
        status: 'success',
        karte_id,
        regenerated_at: new Date().toISOString(),
        ai_analysis: analysisResult,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('karte-regenerate: unexpected error:', error)
    return NextResponse.json({ success: true }, { status: 200 })
  }
}

/* ─────────── Helpers ─────────── */

function buildPrompt({
  currentKarte,
  pastKarteSummaries,
  preCounselingAnswers,
}: {
  currentKarte: any
  pastKarteSummaries: string
  preCounselingAnswers?: any
}): string {
  return `あなたはプロの美容師向けAIカウンセリングシステムです。
顧客のカルテ情報から、施術前後のアドバイスや次回提案を生成します。

【元のカウンセリング情報】
${preCounselingAnswers ? JSON.stringify(preCounselingAnswers, null, 2) : 'なし'}

【過去3件のカルテ履歴】
${pastKarteSummaries || 'なし'}

【今回のカルテ】
- 施術日: ${currentKarte.visit_date}
- メニュー: ${currentKarte.menu_name || '不明'}
- 髪の状態: ${currentKarte.hair_condition || 'なし'}
- 頭皮の状態: ${currentKarte.scalp_condition || 'なし'}
- アレルギー: ${currentKarte.allergies || 'なし'}
- 施術後メモ: ${currentKarte.treatment_note || 'なし'}

以下の JSON フォーマットで応答してください:

\`\`\`json
{
  "ai_summary": {
    "summary": "顧客の現在の状態を1-2文で簡潔にまとめたもの",
    "generated_at": "${new Date().toISOString()}",
    "model": "${MODEL_NAME}"
  },
  "ai_communication_scripts": {
    "pre_service": "施術前に確認すべきポイント",
    "confirmation_checklist": ["チェック項目1", "チェック項目2"],
    "homecare_advice": "帰宅後のケアアドバイス",
    "generated_at": "${new Date().toISOString()}",
    "model": "${MODEL_NAME}"
  },
  "ai_warnings": {
    "allergy_warnings": ["アレルギー警告1"],
    "damage_alerts": ["ダメージアラート1"],
    "risk_level": "low|medium|high"
  },
  "ai_next_recommendation": {
    "next_visit_date": "推奨次回来店日（YYYY-MM-DD）",
    "recommended_menu": "推奨メニュー",
    "reasoning": "推奨理由"
  }
}
\`\`\``;
}

function parseAIResponse(content: string): {
  ai_summary: any
  ai_communication_scripts: any
  ai_warnings: any
  ai_next_recommendation: any
} {
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    const jsonStr = jsonMatch ? jsonMatch[1] : content
    const parsed = JSON.parse(jsonStr)

    return {
      ai_summary: parsed.ai_summary || {},
      ai_communication_scripts: parsed.ai_communication_scripts || {},
      ai_warnings: parsed.ai_warnings || {},
      ai_next_recommendation: parsed.ai_next_recommendation || {},
    }
  } catch (err) {
    console.error('karte-regenerate: JSON parse error:', err)
    return {
      ai_summary: {},
      ai_communication_scripts: {},
      ai_warnings: {},
      ai_next_recommendation: {},
    }
  }
}
