// pass-liff のレスポンス契約。docs/pass/pass-liff-api.md と 1:1 で対応させること。
import { SR_FUNCTIONS_BASE } from './mycarteTypes'

export const PASS_SALON_CODE = 'kirei-tsurumi'
// pass-liff は店名を返さないため、salon_code を固定している間はここで持つ
export const PASS_SALON_NAME = 'キレイ鶴見店'

export type PassReward = { name: string; points_required: number }

export type PassHistoryReason =
  | 'purchase'
  | 'next_booking_bonus'
  | 'redeem'
  | 'migration'
  | 'adjust'
  | 'expire'

export type PassHistoryRow = {
  at: string
  reason: PassHistoryReason
  delta: number
  amount_yen: number | null
  note: string | null
}

export type PassUnlinked = { ok: true; salon_code: string; linked: false }

export type PassLinked = {
  ok: true
  salon_code: string
  linked: true
  customer_id: string
  balance: number
  expires_on: string | null
  has_pending_bonus: boolean
  next_reservation_at: string | null
  next_reward: (PassReward & { remaining: number }) | null
  redeemable: PassReward[]
  rewards: PassReward[]
  last_visit: { date: string; menu: string | null; color_label: string | null } | null
  history: PassHistoryRow[]
  rules: {
    yen_per_point: number
    next_booking_bonus: number
    expiry_months: number
    include_retail: boolean
  }
}

export type PassGet = PassUnlinked | PassLinked

export type PassLinkResult =
  | { ok: true; linked: true; method: 'token' | 'manual' | 'existing'; customer_id: string; balance: number }
  | { ok: true; linked: false; reason: 'token_invalid' | 'not_found' | 'ambiguous' | 'missing_params' }

export type PassMemoChoice = 'same' | 'brighter' | 'gray_concern' | 'photo'

export type PassMemoResult = {
  ok: true
  memo: { id: string; created_at: string }
  reservation_id: string | null
}

async function callPass<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SR_FUNCTIONS_BASE}/pass-liff`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ salon_code: PASS_SALON_CODE, ...body }),
  })
  const data: unknown = await res.json().catch(() => null)
  if (!res.ok || !data || typeof data !== 'object' || !('ok' in data)) {
    const e = data as { error?: string } | null
    throw new Error(e?.error ?? `pass-liff ${res.status}`)
  }
  return data as T
}

export function fetchPass(lineUserId: string): Promise<PassGet> {
  return callPass<PassGet>({ action: 'get', line_user_id: lineUserId })
}

export function linkPass(
  lineUserId: string,
  params: { token: string } | { kana: string; phone4: string },
): Promise<PassLinkResult> {
  return callPass<PassLinkResult>({ action: 'link', line_user_id: lineUserId, ...params })
}

export function sendPassMemo(
  lineUserId: string,
  params: { choice: PassMemoChoice; memo_text?: string; concerns?: string[] },
): Promise<PassMemoResult> {
  return callPass<PassMemoResult>({ action: 'memo', line_user_id: lineUserId, ...params })
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

/** "2026-09-01" や ISO 日時を JST の「9/1（月）」にする */
export function passDateLabel(value: string): string {
  const d = new Date(value.length === 10 ? `${value}T00:00:00+09:00` : value)
  const jst = new Date(d.getTime() + 9 * 3600 * 1000)
  return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}（${WEEKDAYS[jst.getUTCDay()]}）`
}

/** 有効期限が今日から30日以内か */
export function isExpiringSoon(expiresOn: string | null, now = new Date()): boolean {
  if (!expiresOn) return false
  const end = new Date(`${expiresOn}T23:59:59+09:00`).getTime()
  const diff = end - now.getTime()
  return diff >= 0 && diff <= 30 * 24 * 3600 * 1000
}

/** "2026-10-29" → "2026/10/29まで（あと30日）" */
export function expiryLabel(expiresOn: string, now = new Date()): string {
  const end = new Date(`${expiresOn}T00:00:00+09:00`).getTime()
  const todayJst = new Date(now.getTime() + 9 * 3600 * 1000)
  const today = Date.UTC(todayJst.getUTCFullYear(), todayJst.getUTCMonth(), todayJst.getUTCDate()) - 9 * 3600 * 1000
  const days = Math.max(0, Math.round((end - today) / (24 * 3600 * 1000)))
  return `${expiresOn.replace(/-/g, '/')}まで（あと${days}日）`
}

/** 特典名の短縮表記（進捗バー下のラベル用） */
export function shortRewardName(name: string): string {
  return name.replace(/トリートメント$/, '')
}
