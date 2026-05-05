import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/ai/claude-client'
import { analyzePreCounseling, validateAIResponse, getFallbackResponse } from '@/lib/ai/prompts/pre-counseling'

const MODEL_NAME = 'claude-haiku-4-5-20251001'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: preCounselingId } = await params

    // 1. 認証
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. 事前カウンセリング取得（RLSによりownerのみアクセス可）
    const { data: preCounseling, error: pcError } = await supabase
      .from('pre_counselings')
      .select('id, salon_id, customer_id, reservation_id, answers, photos, status, ai_analysis')
      .eq('id', preCounselingId)
      .single()

    if (pcError || !preCounseling) {
      return NextResponse.json({ error: 'Pre-counseling not found' }, { status: 404 })
    }

    // 3. 既に分析済みなら早期return
    if (preCounseling.ai_analysis && preCounseling.status === 'analyzed') {
      return NextResponse.json({
        success: true,
        cached: true,
        ai_analysis: preCounseling.ai_analysis,
      })
    }

    // 4. submitted状態以降のみ分析対象
    if (!preCounseling.answers || preCounseling.status === 'pending' || preCounseling.status === 'sent') {
      return NextResponse.json(
        { error: 'Pre-counseling not yet submitted by customer' },
        { status: 400 }
      )
    }

    // 5. 顧客情報取得
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('id, name, visit_count, last_visit')
      .eq('id', preCounseling.customer_id)
      .single()

    if (custError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // 6. 直近カルテ3件取得（リピート/離反顧客分析用）
    const { data: recentKartes } = await supabase
      .from('kartes')
      .select('date, menu_name, hair_condition')
      .eq('customer_id', preCounseling.customer_id)
      .order('date', { ascending: false })
      .limit(3)

    // 7. プロンプト生成
    const prompt = analyzePreCounseling({
      preCounseling: {
        id: preCounseling.id,
        salon_id: preCounseling.salon_id,
        customer_id: preCounseling.customer_id,
        answers: preCounseling.answers || {},
        photos: preCounseling.photos || [],
      } as any,
      customer: {
        id: customer.id,
        name: customer.name || 'お客様',
        visit_count: customer.visit_count || 1,
        last_visit: customer.last_visit,
      },
      recentKartes: recentKartes || [],
    })

    // 8. Claude Haiku 呼び出し（失敗時はフォールバック）
    let aiResult
    let usage = { input_tokens: 0, output_tokens: 0 }
    let fallbackUsed = false

    try {
      const claudeResponse = await callClaude(prompt)
      const validation = validateAIResponse(claudeResponse.content)

      if (validation.valid && validation.cleaned) {
        aiResult = validation.cleaned
        usage = claudeResponse.usage
      } else {
        console.error('AI validation failed:', validation.errors)
        aiResult = getFallbackResponse()
        fallbackUsed = true
      }
    } catch (err) {
      console.error('Claude API call failed:', err)
      aiResult = getFallbackResponse()
      fallbackUsed = true
    }

    // 9. ai_analysis に保存
    const analysisPayload = {
      ...aiResult,
      generated_at: new Date().toISOString(),
      model: MODEL_NAME,
      fallback_used: fallbackUsed,
      usage,
    }

    // adminクライアントで更新（RLSバイパス・確実な書き込み）
    const adminSupabase = createAdminClient()
    const { error: updateError } = await adminSupabase
      .from('pre_counselings')
      .update({
        ai_analysis: analysisPayload,
        ai_analyzed_at: new Date().toISOString(),
        status: 'analyzed',
      })
      .eq('id', preCounselingId)

    if (updateError) {
      console.error('Failed to save ai_analysis:', updateError)
      return NextResponse.json(
        { error: 'Failed to save analysis', details: updateError.message },
        { status: 500 }
      )
    }

    // 10. kartes に反映（reservation_id 経由で対応するカルテがあれば）
    if (preCounseling.reservation_id) {
      const { data: matchingKarte } = await adminSupabase
        .from('kartes')
        .select('id')
        .eq('reservation_id', preCounseling.reservation_id)
        .maybeSingle()

      if (matchingKarte) {
        await adminSupabase
          .from('kartes')
          .update({
            ai_summary: {
              summary: aiResult.summary,
              generated_at: new Date().toISOString(),
              model: MODEL_NAME,
            },
            ai_communication_scripts: {
              pre_service: aiResult.communication_tips,
              confirmation_checklist: aiResult.preparation_notes,
              suggested_menu: aiResult.suggested_menu,
              generated_at: new Date().toISOString(),
              model: MODEL_NAME,
            },
          })
          .eq('id', matchingKarte.id)
      }
    }

    return NextResponse.json({
      success: true,
      cached: false,
      fallback_used: fallbackUsed,
      ai_analysis: analysisPayload,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('AI karte analyze error:', errorMsg)
    return NextResponse.json(
      { error: 'Internal server error', details: errorMsg },
      { status: 500 }
    )
  }
}
