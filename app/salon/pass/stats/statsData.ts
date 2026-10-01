import { createClient } from '@/lib/supabase/client'

const PAGE = 1000
const JST = 9 * 3600 * 1000
const DAY = 24 * 3600 * 1000

export type MonthStat = {
  key: string
  label: string
  regRate: number | null
  nextRate: number | null
  redeems: number
  phase: '導入前' | '導入' | ''
}

export type Stats = {
  regRate: number | null
  regDelta: number | null
  nextRate: number | null
  nextDelta: number | null
  redeemsThisMonth: number
  linkedTotal: number
  months: MonthStat[]
}

type Query<T> = (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>

async function fetchAll<T>(q: Query<T>): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await q(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    out.push(...(data ?? []))
    if (!data || data.length < PAGE) return out
  }
}

/** JST の月初（UTCミリ秒） */
function monthStart(y: number, m: number): number {
  return Date.UTC(y, m, 1) - JST
}

function pct(n: number, d: number): number | null {
  return d > 0 ? Math.round((n / d) * 100) : null
}

export async function loadStats(salonId: string, now = new Date()): Promise<Stats> {
  const supabase = createClient()
  const j = new Date(now.getTime() + JST)
  const months = Array.from({ length: 6 }, (_, i) => {
    const y = j.getUTCFullYear()
    const m = j.getUTCMonth() - 5 + i
    const start = monthStart(y, m)
    const end = monthStart(y, m + 1)
    const d = new Date(start + JST)
    return {
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
      label: `${d.getUTCMonth() + 1}月`,
      start,
      end,
    }
  })
  const since = new Date(months[0].start).toISOString()
  const active90 = new Date(now.getTime() + JST - 90 * DAY).toISOString().slice(0, 10)

  const [links, activeRes, visits, sources, redeems] = await Promise.all([
    fetchAll<{ customer_id: string; created_at: string | null }>((f, t) =>
      supabase.from('line_customer_links').select('customer_id, created_at').eq('salon_id', salonId).range(f, t),
    ),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('salon_id', salonId).gte('last_visit', active90),
    fetchAll<{ id: string; customer_id: string | null; checked_out_at: string }>((f, t) =>
      supabase
        .from('hpb_reservations')
        .select('id, customer_id, checked_out_at')
        .eq('salon_id', salonId)
        .eq('checkout_status', 'checked_out')
        .gte('checked_out_at', since)
        .range(f, t),
    ),
    fetchAll<{ bonus_source_id: string }>((f, t) =>
      supabase
        .from('hpb_reservations')
        .select('bonus_source_id')
        .eq('salon_id', salonId)
        .not('bonus_source_id', 'is', null)
        .neq('checkout_status', 'cancelled')
        .range(f, t),
    ),
    fetchAll<{ created_at: string }>((f, t) =>
      supabase
        .from('pass_point_events')
        .select('created_at')
        .eq('salon_id', salonId)
        .eq('reason', 'redeem')
        .gte('created_at', since)
        .range(f, t),
    ),
  ])
  if (activeRes.error) throw new Error(activeRes.error.message)

  const sourceSet = new Set(sources.map((s) => s.bonus_source_id))
  const linkAt = new Map<string, number>()
  for (const l of links) {
    const t = l.created_at ? Date.parse(l.created_at) : 0
    const prev = linkAt.get(l.customer_id)
    if (prev == null || t < prev) linkAt.set(l.customer_id, t)
  }
  const firstLink = links.length ? Math.min(...[...linkAt.values()]) : null

  const monthStats: MonthStat[] = months.map((m) => {
    const inMonth = visits.filter((v) => {
      const t = Date.parse(v.checked_out_at)
      return t >= m.start && t < m.end
    })
    const visitors = new Set(inMonth.map((v) => v.customer_id).filter((c): c is string => !!c))
    const linkedVisitors = [...visitors].filter((c) => {
      const t = linkAt.get(c)
      return t != null && t < m.end
    }).length
    const withNext = inMonth.filter((v) => sourceSet.has(v.id)).length
    const phase: MonthStat['phase'] =
      firstLink == null || firstLink >= m.end ? '導入前' : firstLink >= m.start ? '導入' : ''
    return {
      key: m.key,
      label: m.label,
      regRate: pct(linkedVisitors, visitors.size),
      nextRate: pct(withNext, inMonth.length),
      redeems: redeems.filter((r) => {
        const t = Date.parse(r.created_at)
        return t >= m.start && t < m.end
      }).length,
      phase,
    }
  })

  const last30 = now.getTime() - 30 * DAY
  const recent = visits.filter((v) => Date.parse(v.checked_out_at) >= last30)
  const cur = monthStats[5]
  const prev = monthStats[4]
  const diff = (a: number | null, b: number | null) => (a != null && b != null ? a - b : null)

  return {
    regRate: pct(links.length, activeRes.count ?? 0),
    regDelta: diff(cur.regRate, prev.regRate),
    nextRate: pct(recent.filter((v) => sourceSet.has(v.id)).length, recent.length),
    nextDelta: diff(cur.nextRate, prev.nextRate),
    redeemsThisMonth: cur.redeems,
    linkedTotal: links.length,
    months: monthStats,
  }
}
