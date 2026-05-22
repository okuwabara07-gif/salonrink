/**
 * lib/kpi.ts
 *
 * LIFF ダッシュボード用 KPI 集計ロジック
 * - getMonthlyRevenue(salonId, year, month)
 * - getNewBookingsCount(salonId, year, month)
 * - getRepeatRate(salonId)
 *
 * すべて Supabase client 経由（RLS 有効）
 * 戻り値は { current, previousMonth, trend }
 */

import { createClient } from '@/lib/supabase/server'

export interface KpiTrend {
  current: number
  previousMonth: number
  trend: 'up' | 'down' | 'flat'
}

type HpbMenuRow = {
  menu_name: string | null
}

type HpbCustomerNameRow = {
  customer_name: string | null
}

type HpbCountRow = {
  id: string
}

type SalonMenuRow = {
  name: string
  price: number
}

/**
 * 月間売上を計算
 * hpb_reservations.menu_name → salon_menus.price でLOOKUP
 * 前月との比較も返す
 */
export async function getMonthlyRevenue(
  salonId: string,
  year: number,
  month: number
): Promise<KpiTrend> {
  const supabase = await createClient()

  // 当月: 1日 00:00:00 〜 翌月1日 00:00:00（JST 基準）
  const monthStart = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00+09:00`)
  const monthEndYear = month === 12 ? year + 1 : year
  const monthEndMonth = month === 12 ? 1 : month + 1
  const monthEnd = new Date(`${monthEndYear}-${String(monthEndMonth).padStart(2, '0')}-01T00:00:00+09:00`)

  // 前月: 1日 00:00:00 〜 当月1日 00:00:00（JST 基準）
  const prevMonthYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  const prevMonthStart = new Date(`${prevMonthYear}-${String(prevMonth).padStart(2, '0')}-01T00:00:00+09:00`)
  const prevMonthEnd = monthStart

  // メニュー価格マップ作成
  const { data: menus, error: menuError } = await supabase
    .from('salon_menus')
    .select('name, price')
    .eq('salon_id', salonId)

  if (menuError) {
    console.error('[getMonthlyRevenue] menu lookup error:', menuError)
  }

  const priceMap = new Map((menus || []).map((m: SalonMenuRow) => [m.name, m.price]))

  // 当月売上
  const { data: currentData, error: currentError } = await supabase
    .from('hpb_reservations')
    .select('menu_name')
    .eq('salon_id', salonId)
    .eq('status', 'confirmed')
    .gte('start_time', monthStart.toISOString())
    .lt('start_time', monthEnd.toISOString())

  if (currentError) {
    console.error('[getMonthlyRevenue] currentMonth error:', currentError)
  }

  const currentRevenue = (currentData || []).reduce((sum: number, r: HpbMenuRow) => {
    return sum + (priceMap.get(r.menu_name ?? '') ?? 0)
  }, 0)

  // 前月売上
  const { data: prevData, error: prevError } = await supabase
    .from('hpb_reservations')
    .select('menu_name')
    .eq('salon_id', salonId)
    .eq('status', 'confirmed')
    .gte('start_time', prevMonthStart.toISOString())
    .lt('start_time', prevMonthEnd.toISOString())

  if (prevError) {
    console.error('[getMonthlyRevenue] prevMonth error:', prevError)
  }

  const prevRevenue = (prevData || []).reduce((sum: number, r: HpbMenuRow) => {
    return sum + (priceMap.get(r.menu_name ?? '') ?? 0)
  }, 0)

  const trend: 'up' | 'down' | 'flat' =
    currentRevenue > prevRevenue
      ? 'up'
      : currentRevenue < prevRevenue
        ? 'down'
        : 'flat'

  return {
    current: currentRevenue,
    previousMonth: prevRevenue,
    trend,
  }
}

/**
 * 月間新規予約数を計算
 * hpb_reservations.count (status = confirmed)
 * 前月との比較も返す
 */
export async function getNewBookingsCount(
  salonId: string,
  year: number,
  month: number
): Promise<KpiTrend> {
  const supabase = await createClient()

  // 当月: 1日 00:00:00 〜 翌月1日 00:00:00（JST 基準）
  const monthStart = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00+09:00`)
  const monthEndYear = month === 12 ? year + 1 : year
  const monthEndMonth = month === 12 ? 1 : month + 1
  const monthEnd = new Date(`${monthEndYear}-${String(monthEndMonth).padStart(2, '0')}-01T00:00:00+09:00`)

  // 前月: 1日 00:00:00 〜 当月1日 00:00:00（JST 基準）
  const prevMonthYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  const prevMonthStart = new Date(`${prevMonthYear}-${String(prevMonth).padStart(2, '0')}-01T00:00:00+09:00`)
  const prevMonthEnd = monthStart

  // 当月件数
  const { data: currentData, error: currentError } = await supabase
    .from('hpb_reservations')
    .select('id')
    .eq('salon_id', salonId)
    .eq('status', 'confirmed')
    .gte('start_time', monthStart.toISOString())
    .lt('start_time', monthEnd.toISOString())

  if (currentError) {
    console.error('[getNewBookingsCount] currentMonth error:', currentError)
  }

  const currentCount = (currentData || []).length

  // 前月件数
  const { data: prevData, error: prevError } = await supabase
    .from('hpb_reservations')
    .select('id')
    .eq('salon_id', salonId)
    .eq('status', 'confirmed')
    .gte('start_time', prevMonthStart.toISOString())
    .lt('start_time', prevMonthEnd.toISOString())

  if (prevError) {
    console.error('[getNewBookingsCount] prevMonth error:', prevError)
  }

  const prevCount = (prevData || []).length

  const trend: 'up' | 'down' | 'flat' =
    currentCount > prevCount ? 'up' : currentCount < prevCount ? 'down' : 'flat'

  return {
    current: currentCount,
    previousMonth: prevCount,
    trend,
  }
}

/**
 * 90日リピート率を計算
 *
 * 過去90日の訪問ユニーク顧客のうち、
 * 90日より前にも来店した顧客の割合(%)
 */
export async function getRepeatRate(salonId: string): Promise<number> {
  const supabase = await createClient()

  // 90日前の日時
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  // Step 1: 過去90日の訪問ユニーク顧客
  const { data: visitors90d, error: err1 } = await supabase
    .from('hpb_reservations')
    .select('customer_name')
    .eq('salon_id', salonId)
    .eq('status', 'confirmed')
    .gte('start_time', ninetyDaysAgo.toISOString())
    .order('customer_name')

  if (err1) {
    console.error('[getRepeatRate] visitors_90d error:', err1)
    return 0
  }

  const visitors90dSet = new Set<string>()
  ;(visitors90d || []).forEach((r: HpbCustomerNameRow) => {
    if (r.customer_name) {
      visitors90dSet.add(r.customer_name)
    }
  })

  if (visitors90dSet.size === 0) {
    return 0
  }

  // Step 2: 過去90日より前に来店した顧客
  const { data: beforeVisitors, error: err2 } = await supabase
    .from('hpb_reservations')
    .select('customer_name')
    .eq('salon_id', salonId)
    .eq('status', 'confirmed')
    .lt('start_time', ninetyDaysAgo.toISOString())
    .order('customer_name')

  if (err2) {
    console.error('[getRepeatRate] beforeVisitors error:', err2)
    return 0
  }

  const beforeVisitorsSet = new Set<string>()
  ;(beforeVisitors || []).forEach((r: HpbCustomerNameRow) => {
    if (r.customer_name) {
      beforeVisitorsSet.add(r.customer_name)
    }
  })

  // Step 3: リピーター = 過去90日に来店した顧客のうち、90日より前にも来店した顧客
  const repeaters = new Set<string>()
  visitors90dSet.forEach((customerName) => {
    if (beforeVisitorsSet.has(customerName)) {
      repeaters.add(customerName)
    }
  })

  const repeatRate = (repeaters.size * 100.0) / visitors90dSet.size
  return Math.round(repeatRate * 10) / 10
}
