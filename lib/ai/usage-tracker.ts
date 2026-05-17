import { createClient } from '@/lib/supabase/server'
import { getAIQuotaByDbValue } from '@/lib/plans'
import { createAdminClient } from '@/lib/supabase/admin'

// Phase2: 月次AI枠は lib/plans.ts (canonical) を単一ソースとして参照
// 旧 PLAN_LIMITS/DEFAULT_LIMIT は廃止 (getAIQuotaByDbValue に統合)

export type ApiType =
  | 'customer_summary'
  | 'communication_script'
  | 'allergy_warning'
  | 'next_recommendation'
  | 'pre_counseling_analysis'
  | 'karte_regenerate'

export async function checkAIUsageLimit(salonId: string): Promise<{
  allowed: boolean
  used: number
  limit: number
  plan: string
  unlimited: boolean
}> {
  const supabase = await createClient()

  // プラン取得
  const { data: salon } = await supabase
    .from('salons')
    .select('plan')
    .eq('id', salonId)
    .maybeSingle()

  const plan = salon?.plan || 'free'
  const limit = getAIQuotaByDbValue(plan)

  // Phase2: AI無制限アドオン (salon_addons.addon_key='ai_unlimited', enabled) は枠バイパス
  const { data: unlimitedAddon } = await supabase
    .from('salon_addons')
    .select('enabled')
    .eq('salon_id', salonId)
    .eq('addon_key', 'ai_unlimited')
    .eq('enabled', true)
    .maybeSingle()
  const unlimited = !!unlimitedAddon

  // 当月使用量(全 api_type 合計)
  const yearMonth = new Date().toISOString().slice(0, 7)

  const { data: usage } = await supabase
    .from('ai_usage')
    .select('call_count')
    .eq('salon_id', salonId)
    .eq('year_month', yearMonth)

  const used = usage?.reduce(
    (sum, row) => sum + (row.call_count || 0),
    0
  ) || 0

  return {
    allowed: unlimited || used < limit,
    used,
    limit,
    plan,
    unlimited,
  }
}

// Phase2: 内部/サーバ間呼び出し用 (ユーザセッション無し)。
// admin(service role) クライアントで RLS をバイパスし枠を正しく判定する。
export async function checkAIUsageLimitAdmin(salonId: string): Promise<{
  allowed: boolean
  used: number
  limit: number
  plan: string
  unlimited: boolean
}> {
  const supabase = createAdminClient()

  const { data: salon } = await supabase
    .from('salons')
    .select('plan')
    .eq('id', salonId)
    .maybeSingle()

  const plan = salon?.plan || 'free'
  const limit = getAIQuotaByDbValue(plan)

  const { data: unlimitedAddon } = await supabase
    .from('salon_addons')
    .select('enabled')
    .eq('salon_id', salonId)
    .eq('addon_key', 'ai_unlimited')
    .eq('enabled', true)
    .maybeSingle()
  const unlimited = !!unlimitedAddon

  const yearMonth = new Date().toISOString().slice(0, 7)

  const { data: usage } = await supabase
    .from('ai_usage')
    .select('call_count')
    .eq('salon_id', salonId)
    .eq('year_month', yearMonth)

  const used = usage?.reduce(
    (sum, row) => sum + (row.call_count || 0),
    0
  ) || 0

  return {
    allowed: unlimited || used < limit,
    used,
    limit,
    plan,
    unlimited,
  }
}

export async function recordAIUsage(
  salonId: string,
  apiType: ApiType,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const supabase = await createClient()
  const yearMonth = new Date().toISOString().slice(0, 7)
  const totalTokens = inputTokens + outputTokens

  // 既存レコード取得
  const { data: existing } = await supabase
    .from('ai_usage')
    .select('id, call_count, input_tokens, output_tokens, total_tokens')
    .eq('salon_id', salonId)
    .eq('year_month', yearMonth)
    .eq('api_type', apiType)
    .maybeSingle()

  if (existing) {
    // 既存をインクリメント
    const { error } = await supabase
      .from('ai_usage')
      .update({
        call_count: existing.call_count + 1,
        input_tokens: existing.input_tokens + inputTokens,
        output_tokens: existing.output_tokens + outputTokens,
        total_tokens: existing.total_tokens + totalTokens,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) {
      console.error('AI usage update error:', error)
    }
  } else {
    // 新規作成
    const { error } = await supabase
      .from('ai_usage')
      .insert({
        salon_id: salonId,
        year_month: yearMonth,
        api_type: apiType,
        call_count: 1,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
      })

    if (error) {
      console.error('AI usage insert error:', error)
    }
  }
}
