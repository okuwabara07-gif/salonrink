/**
 * POST /api/cons/analyze
 * コンシェルジュ AI 経営分析エンドポイント
 *
 * 責務:
 * - 認証 + 認可確認(salon owner)
 * - 当日キャッシュ確認(cons_daily_analysis)→ あれば即返却(¥0・Claude呼出なし)
 * - AI 使用量チェック(既存 checkAIUsageLimit を流用 = 月次ハードキャップ)
 * - サーバー側で当月KPIを集計(reservations + hpb_reservations + customers)
 * - Claude Haiku で経営分析実行
 * - 結果を cons_daily_analysis に保存(当日キャッシュ)
 * - 使用量記録
 *
 * コスト制御:
 * - 日次キャッシュにより 1サロン1日あたり最大1回の Claude 呼出
 * - 月次キャップ(既存 PLAN_LIMITS: free10/core50/pro_with_ai150)で runaway 防止
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { callClaude } from '@/lib/ai/claude-client'
import {
  buildConsPrompt,
  validateConsResponse,
  getConsFallback,
  type ConsKpis,
} from '@/lib/ai/prompts/cons'
import {
  checkAIUsageLimit,
  recordAIUsage,
  type ApiType,
} from '@/lib/ai/usage-tracker'
import {
  resolveMenuPrice,
  toMenuMaster,
  type MenuMaster,
} from '@/lib/menuPricing'

const MODEL_NAME = 'claude-haiku-4-5-20251001'

// 価格は salon_menus マスタから解決(固定表は廃止)。
// マスタ未解決の予約は売上見込に加算しない(誤った推定額を出さない)。

function errorResponse(error: string, statusCode: number): NextResponse {
  return NextResponse.json({ error }, { status: statusCode })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: body パース(force: 当日キャッシュを無視して再生成するか)
    let body: { force?: boolean } = {}
    try {
      body = await request.json()
    } catch {
      // body 無しでも可
      body = {}
    }
    const force = body.force === true

    // Step 2: 認証確認
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // Step 3: salon 特定 + 所有権確認
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError || !salon) {
      console.error('Salon lookup error:', salonError)
      return errorResponse('Salon not found', 403)
    }
    const salon_id = salon.id as string

    // Step 4: admin クライアント(RLS バイパス・キャッシュ読み書き用)
    const admin = createAdminClient()

    // 当日(JSTローカル日付)
    const now = new Date()
    const analysisDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    // Step 5: 当日キャッシュ確認
    if (!force) {
      const { data: cached } = await admin
        .from('cons_daily_analysis')
        .select('narrative, suggestions, generated_at')
        .eq('salon_id', salon_id)
        .eq('analysis_date', analysisDate)
        .maybeSingle()

      if (cached) {
        return NextResponse.json(
          {
            success: true,
            cached: true,
            narrative: cached.narrative,
            suggestions: cached.suggestions,
            generated_at: cached.generated_at,
          },
          { status: 200 }
        )
      }
    }

    // Step 6: AI 使用量チェック(既存インフラ・月次キャップ)
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

    // Step 7: 当月KPIをサーバー側で集計
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [resRes, hpbRes, custRes, menuRes] = await Promise.all([
      admin
        .from('reservations')
        .select('datetime, menu, status')
        .eq('salon_id', salon_id)
        .gte('datetime', monthStart.toISOString())
        .lt('datetime', monthEnd.toISOString()),
      admin
        .from('hpb_reservations')
        .select('start_time, menu_name, status')
        .eq('salon_id', salon_id)
        .gte('start_time', monthStart.toISOString())
        .lt('start_time', monthEnd.toISOString()),
      admin
        .from('customers')
        .select('last_visit, visit_count, created_at')
        .eq('salon_id', salon_id),
      // admin は RLS バイパスのため salon_id 明示絞り必須
      admin
        .from('salon_menus')
        .select('name, price, duration')
        .eq('salon_id', salon_id)
        .order('sort_order', { ascending: true }),
    ])

    if (resRes.error) console.error('reservations:', resRes.error)
    if (hpbRes.error) console.error('hpb_reservations:', hpbRes.error)
    if (custRes.error) console.error('customers:', custRes.error)
    if (menuRes.error) console.error('salon_menus:', menuRes.error)

    const menus: MenuMaster[] = (
      (menuRes.data as Array<{
        name: string
        price: number
        duration: number | null
      }>) ?? []
    ).map(toMenuMaster)

    type ResvRow = { datetime: string; menu: string | null; status: string | null }
    const manual: ResvRow[] = ((resRes.data as ResvRow[]) ?? []).filter(
      (r) => r.status !== 'canceled'
    )
    const hpb: ResvRow[] = (
      (hpbRes.data as Array<{
        start_time: string | null
        menu_name: string | null
        status: string | null
      }>) ?? []
    )
      .filter((r) => r.start_time && r.status !== 'canceled')
      .map((r) => ({
        datetime: r.start_time as string,
        menu: r.menu_name ?? null,
        status: r.status ?? null,
      }))
    const allResv = [...manual, ...hpb]

    const monthCount = allResv.length
    // マスタ解決できた予約のみ売上見込に加算(未解決は除外=推定額を出さない)
    let resolvedCount = 0
    const monthRevenue = allResv.reduce((acc, r) => {
      const p = resolveMenuPrice(r.menu, menus)
      if (p == null) return acc
      resolvedCount += 1
      return acc + p
    }, 0)
    const avgSpend = resolvedCount > 0 ? monthRevenue / resolvedCount : 0

    type CustRow = {
      last_visit: string | null
      visit_count: number | null
      created_at: string | null
    }
    const customers = (custRes.data as CustRow[]) ?? []
    const totalCustomers = customers.length

    const newCustomers = customers.filter((c) => {
      if (!c.created_at) return false
      const d = new Date(c.created_at)
      return d >= monthStart && d < monthEnd
    }).length

    const dormantThreshold = new Date()
    dormantThreshold.setDate(dormantThreshold.getDate() - 60)
    const dormantCustomers = customers.filter((c) => {
      if (c.last_visit) return new Date(c.last_visit) < dormantThreshold
      if (c.created_at) return new Date(c.created_at) < dormantThreshold
      return false
    }).length

    const repeatCount = customers.filter(
      (c) => (c.visit_count ?? 0) >= 2
    ).length
    const repeatRate =
      totalCustomers > 0 ? (repeatCount / totalCustomers) * 100 : 0

    const kpis: ConsKpis = {
      monthCount,
      monthRevenue,
      avgSpend,
      newCustomers,
      repeatRate,
      dormantCustomers,
      totalCustomers,
    }

    // Step 8: プロンプト生成
    const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`
    const prompt = buildConsPrompt({ kpis, monthLabel })

    // Step 9: Claude Haiku 呼び出し
    let claudeResponse
    let analysisResult
    let usedFallback = false

    try {
      claudeResponse = await callClaude(prompt)
      const validation = validateConsResponse(claudeResponse.content)
      if (validation.valid && validation.cleaned) {
        analysisResult = validation.cleaned
      } else {
        console.warn('Cons AI validation failed:', validation.errors)
        analysisResult = getConsFallback(kpis)
        usedFallback = true
      }
    } catch (error) {
      console.error('Claude API error:', error)
      analysisResult = getConsFallback(kpis)
      usedFallback = true
      claudeResponse = {
        content: '',
        usage: { input_tokens: 0, output_tokens: 0 },
        model: MODEL_NAME,
      }
    }

    // Step 10: cons_daily_analysis に保存(当日キャッシュ・upsert)
    const { error: upsertError } = await admin
      .from('cons_daily_analysis')
      .upsert(
        {
          salon_id,
          analysis_date: analysisDate,
          narrative: analysisResult.narrative,
          suggestions: analysisResult.suggestions,
          kpi_snapshot: kpis,
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'salon_id,analysis_date' }
      )

    if (upsertError) {
      console.error('cons_daily_analysis upsert error:', upsertError)
      // 保存失敗でも結果は返す(キャッシュされないだけ・非致命的)
    }

    // Step 11: 使用量記録(AI 成功時のみ・既存インフラ)
    if (!usedFallback && claudeResponse) {
      await recordAIUsage(
        salon_id,
        'cons_analysis' as ApiType,
        claudeResponse.usage.input_tokens,
        claudeResponse.usage.output_tokens
      ).catch((err) => console.error('Usage record failed:', err))
    }

    // Step 12: レスポンス返却
    return NextResponse.json(
      {
        success: true,
        cached: false,
        narrative: analysisResult.narrative,
        suggestions: analysisResult.suggestions,
        usedFallback,
        generated_at: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/cons/analyze unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
