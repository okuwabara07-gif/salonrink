// get-mycarte v39 のレスポンス契約。Edge Function の実装と 1:1 で対応させること。
// 追加キーを増やすときは必ず Edge Function 側を先に確認する。

export const SR_FUNCTIONS_BASE = 'https://fmpmgilgvvfezursmyic.supabase.co/functions/v1'

export type MycartePhoto = {
  id: string
  storage_path: string
  kind: string | null
  diagnosis_id: string | null
  created_at: string
  expires_at: string | null
  signed_url: string | null
}

export type MycarteRecord = {
  id: string
  kind: string | null
  body: string | null
  tags: string[] | null
  photo_path: string | null
  observed_on: string | null
  stylist_comment: string | null
  stylist_name: string | null
  commented_at: string | null
  created_at: string
  signed_url: string | null
}

export type MycarteShelfItem = {
  id: string
  name: string | null
  brand: string | null
  category: string | null
  remaining: string | null
  photo_path: string | null
  product_id: string | null
  purchased_on: string | null
  created_at: string
  signed_url: string | null
}

export type MycarteReservation = {
  id: string
  datetime: string
  menu: string | null
  status: string | null
  salon_id?: string | null
}

export type MycarteTimelineRow = {
  id: string
  observed_at: string
  lightness_level: number | null
  gray_ratio_min: number | null
  gray_ratio_max: number | null
  residual_tone: string | null
  damage_root: string | null
  damage_mid: string | null
  damage_end: string | null
  note: string | null
}

export type MycarteScorePoint = { score: number; at: string }

export type MycartePlan = {
  plan: string
  premium_until: string | null
  advice_credits: number | null
  photo_quota_extra?: number | null
  is_premium: boolean
  diag_limit: number
  photo_limit: number
}

export type MycarteStorage = {
  used: number
  limit: number
  extra: number
  retention_unlimited: boolean
  unlimited: boolean
  retention_days: number | null
  next_expiry_at: string | null
  next_expiry_in_days: number | null
}

export type MycarteCounts = {
  records: number
  visits: number
  products: number
  inspirations: number
}

export type MycarteFollowupPending = {
  id: string
  visited_on: string | null
  asked_at: string | null
}

export type MycarteFollowupLast = {
  visited_on: string | null
  answer: string | null
  answer_label: string | null
  answered_at: string | null
}

export type MycarteDiagnosis = {
  id: string
  diagnosis_type: string | null
  result: Record<string, unknown> | null
  created_at: string
  saved_at: string | null
}

export type MycarteMemo = {
  id: string
  concerns: string | null
  memo_text: string | null
  created_at: string
}

export type Mycarte = {
  ok: true
  diagnoses: MycarteDiagnosis[]
  plan: MycartePlan
  month_count: number
  photos: MycartePhoto[]
  memos: MycarteMemo[]
  records: MycarteRecord[]
  shelf: MycarteShelfItem[]
  inspirations: MycartePhoto[]
  next_reservation: MycarteReservation | null
  last_visit: MycarteReservation | null
  timeline: MycarteTimelineRow[]
  score_series: Record<string, MycarteScorePoint[]>
  counts: MycarteCounts
  storage: MycarteStorage
  followup_pending: MycarteFollowupPending | null
  followup_last: MycarteFollowupLast | null
}

export type MycarteError = { ok?: false; error: string; message?: string }

export async function fetchMycarte(lineUserId: string): Promise<Mycarte> {
  const res = await fetch(`${SR_FUNCTIONS_BASE}/get-mycarte`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ line_user_id: lineUserId }),
  })
  const data: unknown = await res.json().catch(() => null)
  if (!res.ok || !data || typeof data !== 'object' || !('ok' in data)) {
    const e = data as MycarteError | null
    throw new Error(e?.error ?? `get-mycarte ${res.status}`)
  }
  return data as Mycarte
}
