const DAY_MS = 86400000

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** '2026-07-02' -> '7/2' */
export function shortDate(value: string | null | undefined): string {
  const d = toDate(value)
  if (!d) return ''
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** '2026-07-02T10:00' -> '7月2日(木) 10:00' */
export function longDateTime(value: string | null | undefined): string {
  const d = toDate(value)
  if (!d) return ''
  const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getMonth() + 1}月${d.getDate()}日(${w}) ${hh}:${mm}`
}

/** '2026-07-02T14:00' -> '14:00' */
export function clockTime(value: string | null | undefined): string {
  const d = toDate(value)
  if (!d) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function isToday(value: string | null | undefined): boolean {
  const d = toDate(value)
  if (!d) return false
  const n = new Date()
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  )
}

/** 2つの日付の差（日数）。どちらか欠けていれば null */
export function daysBetween(
  a: string | null | undefined,
  b: string | null | undefined,
): number | null {
  const da = toDate(a)
  const db = toDate(b)
  if (!da || !db) return null
  return Math.round(Math.abs(da.getTime() - db.getTime()) / DAY_MS)
}

/** expires_at から 'あと7日'。期限なし・期限切れは null */
export function expiryLabel(expiresAt: string | null | undefined): string | null {
  const d = toDate(expiresAt)
  if (!d) return null
  const left = Math.ceil((d.getTime() - Date.now()) / DAY_MS)
  if (left <= 0) return null
  return `あと${left}日`
}

/** karte_records.kind をカルーセル／グリッドのラベルに変換 */
export function recordKindLabel(kind: string | null | undefined): string {
  switch (kind) {
    case 'visit':
      return '来店'
    case 'product':
      return '製品'
    case 'karte':
      return 'カルテ'
    case 'inspiration':
      return 'なりたい'
    default:
      return '記録'
  }
}

/** mycarte_photos.kind をラベルに変換 */
export function photoKindLabel(kind: string | null | undefined): string {
  switch (kind) {
    case 'before':
      return 'ビフォー'
    case 'after':
      return 'アフター'
    case 'inspiration':
      return 'なりたい'
    default:
      return '記録'
  }
}

/** 記録の代表日。observed_on を優先し、無ければ created_at */
export function recordDate(r: {
  observed_on?: string | null
  created_at?: string | null
}): string | null {
  return r.observed_on ?? r.created_at ?? null
}
