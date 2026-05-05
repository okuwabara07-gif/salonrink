/**
 * AIカルテAPI動作確認スクリプト
 * 使い方: npx tsx scripts/test-ai-karte.ts <pre_counseling_id>
 */

import { createClient } from '@supabase/supabase-js'
import { callClaude } from '../lib/ai/claude-client'
import { analyzePreCounseling, validateAIResponse, getFallbackResponse } from '../lib/ai/prompts/pre-counseling'

const MODEL_NAME = 'claude-haiku-4-5-20251001'

async function main() {
  const preCounselingId = process.argv[2]
  if (!preCounselingId) {
    console.error('Usage: npx tsx scripts/test-ai-karte.ts <pre_counseling_id>')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  console.log(`\n🔍 Testing pre_counseling_id: ${preCounselingId}\n`)

  // 1. pre_counseling 取得
  const { data: preCounseling, error: pcError } = await supabase
    .from('pre_counselings')
    .select('id, salon_id, customer_id, reservation_id, answers, photos, status')
    .eq('id', preCounselingId)
    .single()

  if (pcError || !preCounseling) {
    console.error('❌ pre_counseling not found:', pcError)
    process.exit(1)
  }
  console.log('✅ pre_counseling loaded:', { status: preCounseling.status })

  // 2. 顧客取得
  const { data: customer, error: custError } = await supabase
    .from('customers')
    .select('id, name, visit_count, last_visit')
    .eq('id', preCounseling.customer_id)
    .single()

  if (custError || !customer) {
    console.error('❌ customer not found:', custError)
    process.exit(1)
  }
  console.log('✅ customer loaded:', { name: customer.name, visit_count: customer.visit_count })

  // 3. 直近カルテ
  const { data: recentKartes } = await supabase
    .from('kartes')
    .select('date, menu_name, hair_condition')
    .eq('customer_id', preCounseling.customer_id)
    .order('date', { ascending: false })
    .limit(3)

  console.log(`✅ recent kartes: ${recentKartes?.length || 0} 件`)

  // 4. プロンプト生成
  const prompt = analyzePreCounseling({
    preCounseling: preCounseling as any,
    customer: {
      id: customer.id,
      name: customer.name || 'お客様',
      visit_count: customer.visit_count || 1,
      last_visit: customer.last_visit,
    },
    recentKartes: recentKartes || [],
  })

  console.log('\n📝 Generated Prompt (first 500 chars):')
  console.log(prompt.slice(0, 500) + '...\n')

  // 5. Claude Haiku 呼び出し
  console.log('🤖 Calling Claude Haiku...')
  const startTime = Date.now()

  let aiResult
  let fallbackUsed = false
  let usage = { input_tokens: 0, output_tokens: 0 }

  try {
    const claudeResponse = await callClaude(prompt)
    const validation = validateAIResponse(claudeResponse.content)

    if (validation.valid && validation.cleaned) {
      aiResult = validation.cleaned
      usage = claudeResponse.usage
      console.log(`✅ Claude response validated (${Date.now() - startTime}ms)`)
    } else {
      console.error('⚠️ Validation failed, using fallback:', validation.errors)
      aiResult = getFallbackResponse()
      fallbackUsed = true
    }
  } catch (err) {
    console.error('❌ Claude API failed:', err)
    aiResult = getFallbackResponse()
    fallbackUsed = true
  }

  // 6. 結果表示
  console.log('\n📊 AI Analysis Result:')
  console.log(JSON.stringify(aiResult, null, 2))

  console.log('\n💰 Usage:')
  console.log(`  input_tokens: ${usage.input_tokens}`)
  console.log(`  output_tokens: ${usage.output_tokens}`)
  const estimatedCost = (usage.input_tokens * 1 + usage.output_tokens * 5) / 1_000_000
  console.log(`  estimated_cost: $${estimatedCost.toFixed(6)}`)
  console.log(`  fallback_used: ${fallbackUsed}`)

  // 7. DB保存
  const analysisPayload = {
    ...aiResult,
    generated_at: new Date().toISOString(),
    model: MODEL_NAME,
    fallback_used: fallbackUsed,
    usage,
  }

  const { error: updateError } = await supabase
    .from('pre_counselings')
    .update({
      ai_analysis: analysisPayload,
      ai_analyzed_at: new Date().toISOString(),
      status: 'analyzed',
    })
    .eq('id', preCounselingId)

  if (updateError) {
    console.error('\n❌ DB update failed:', updateError)
    process.exit(1)
  }

  console.log('\n✅ Saved to pre_counselings.ai_analysis')
  console.log('\n🎉 All steps completed successfully!\n')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
