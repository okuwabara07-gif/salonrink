// rpc pass_today(p_salon_id, p_date) の rows[] をそのまま受ける
export type PassTodayRow = {
  reservation_id: string
  start_time: string | null
  customer_name: string | null
  menu_name: string | null
  visit_count: number | null
  is_new: boolean | null
  line_linked: boolean | null
  last_visit_date: string | null
  weeks_since_last: number | null
  last_chemical: unknown
  consult_memo: unknown
  balance: number | null
  pending_bonus: boolean | null
  checkout_status: string | null
  points_awarded: number | null
}

export type PassTodayResult = { rows: PassTodayRow[]; syncedAt: string | null }

export function normalizeTodayResult(data: unknown): PassTodayResult {
  if (Array.isArray(data)) return { rows: data as PassTodayRow[], syncedAt: null }
  const obj = (data ?? {}) as { rows?: unknown; synced_at?: unknown }
  return {
    rows: Array.isArray(obj.rows) ? (obj.rows as PassTodayRow[]) : [],
    syncedAt: typeof obj.synced_at === 'string' ? obj.synced_at : null,
  }
}

// TODO(design): 交換ラインは pass_rewards の値を使うべきだが、pass_today が返さないため当面固定
export const REWARD_POINTS = [50, 25]
export const OVERDUE_WEEKS = 8

export type Chip = { t: string; bg: string; fg: string }
export type RowView = {
  id: string
  time: string
  status: 'done' | 'res' | 'over' | 'cancel'
  name: string
  initial: string
  visits: string
  line: boolean
  tags: Chip[]
  menu: string
  menuGray: boolean
  prev: string
  weeks: string
  weeksOver: boolean
  chem: string[]
  chemEmpty: boolean
  wish: string
  wishSub: string
  pts: string
  ptsTone: 'point' | 'muted' | 'plain'
  given: boolean
  ptags: Chip[]
  gift: boolean
  chip: Chip | null
  qr: boolean
  tone: 'normal' | 'over' | 'sync' | 'done'
  isUnlinked: boolean
  isRedeemable: boolean
  isOver: boolean
  isDone: boolean
}

const NEW_TAG: Chip = { t: '新規', bg: '#F06A6A', fg: '#fff' }
const UNLINKED_TAG: Chip = { t: '未連携', bg: '#EDF1F6', fg: '#3B4656' }

const MEMO_LABEL: Record<string, string> = {
  same: '前回と同じ',
  brighter: '少し明るくしたい',
  gray_concern: '白髪が気になる',
  photo: '写真で伝えたい',
}

export function formatTime(v: string | null): string {
  if (!v) return '—'
  const m = /^(\d{1,2}):(\d{2})/.exec(v)
  if (m) return `${Number(m[1])}:${m[2]}`
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  const jst = new Date(d.getTime() + 9 * 3600 * 1000)
  return `${jst.getUTCHours()}:${String(jst.getUTCMinutes()).padStart(2, '0')}`
}

function formatMonthDay(v: string | null): string {
  if (!v) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v)
  if (m) return `${Number(m[2])}/${Number(m[3])}`
  return v
}

/** last_chemical は文字列・文字列配列・pass_chemical_notes 相当のオブジェクトのいずれでも受ける */
export function chemicalLines(v: unknown): string[] {
  if (v == null || v === '') return []
  if (typeof v === 'string') return v.split(/\n/).map((s) => s.trim()).filter(Boolean)
  if (Array.isArray(v)) return v.flatMap((x) => chemicalLines(x))
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    const lines: string[] = []
    const formula = Array.isArray(o.formula) ? (o.formula as Record<string, unknown>[]) : []
    const shades = formula.map((f) => String(f.shade ?? f.product ?? '')).filter(Boolean)
    const ratios = formula.map((f) => f.ratio).filter((r) => r != null && r !== '')
    if (shades.length === 1) lines.push(`${shades[0]} 単品`)
    else if (shades.length > 1) lines.push(shades.join('+'))
    const second: string[] = []
    if (ratios.length > 1) second.push(ratios.join(':'))
    if (o.oxidant_pct != null) second.push(`OX${o.oxidant_pct}%`)
    if (second.length) lines.push(second.join(' / '))
    if (o.process_min != null) lines.push(`${o.process_min}分`)
    return lines
  }
  return [String(v)]
}

function memoView(v: unknown): { wish: string; sub: string } {
  if (v == null || v === '') return { wish: '—', sub: '' }
  if (typeof v === 'string') return { wish: MEMO_LABEL[v] ?? v, sub: '' }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    const choice = typeof o.choice === 'string' ? o.choice : ''
    const text = typeof o.memo_text === 'string' ? o.memo_text.trim() : ''
    return { wish: MEMO_LABEL[choice] ?? (choice || '—'), sub: text ? `「${text}」` : '' }
  }
  return { wish: '—', sub: '' }
}

export function toRowView(r: PassTodayRow): RowView {
  const isNew = !!r.is_new
  const linked = !!r.line_linked
  const isDone = r.checkout_status === 'checked_out'
  const isCancel = r.checkout_status === 'cancelled' || r.checkout_status === 'no_show'
  // TODO(design): pass_today が paid_amount を返さないため、会計済みで付与Pが未確定の行・会計状態が無い行を同期待ちとする
  const isSync = r.checkout_status == null || (isDone && r.points_awarded == null)
  const isOver = r.weeks_since_last != null && r.weeks_since_last >= OVERDUE_WEEKS
  const isUnlinked = !linked && !isNew
  const balance = r.balance ?? 0
  const reached = linked ? REWARD_POINTS.find((p) => balance >= p) : undefined
  const chem = isNew ? [] : chemicalLines(r.last_chemical)
  const memo = memoView(r.consult_memo)
  const name = r.customer_name ?? ''

  let chip: Chip | null = null
  if (isSync) chip = { t: '同期待ち', bg: '#EDF1F6', fg: '#3B4656' }
  else if (isNew) chip = { t: '新規', bg: '#EDF1F6', fg: '#3B4656' }
  else if (isOver && !isDone) chip = { t: '来店周期超過', bg: '#FCEBB4', fg: '#7A4E00' }
  else if (r.pending_bonus) chip = { t: '+2P対象', bg: '#E3EFE6', fg: '#3F6B50' }

  let pts = `${balance}P`
  let ptsTone: RowView['ptsTone'] = 'point'
  let given = false
  if (isSync) {
    pts = '同期待ち'
    ptsTone = 'muted'
  } else if (isDone && r.points_awarded != null) {
    pts = `+${r.points_awarded}P → ${balance}P`
    given = true
  } else if (isNew) {
    pts = '—'
    ptsTone = 'muted'
  } else if (!linked) {
    pts = '未連携'
    ptsTone = 'plain'
  }

  const ptags: Chip[] = []
  if (reached && !isSync) ptags.push({ t: `${reached}P交換可`, bg: '#B8894A', fg: '#fff' })
  if (r.pending_bonus && !isSync) ptags.push({ t: '+2P', bg: '#5E9270', fg: '#fff' })

  return {
    id: r.reservation_id,
    time: formatTime(r.start_time),
    status: isCancel ? 'cancel' : isDone ? 'done' : isOver ? 'over' : 'res',
    name: name ? `${name} 様` : '（お名前未登録）',
    initial: name.slice(0, 1),
    visits: r.visit_count ? `${r.visit_count}回目` : '',
    line: linked,
    tags: isNew ? [NEW_TAG] : !linked ? [UNLINKED_TAG] : [],
    menu: r.menu_name ?? '—',
    menuGray: isSync,
    prev: formatMonthDay(r.last_visit_date),
    weeks: r.weeks_since_last != null ? `${r.weeks_since_last}週` : '',
    weeksOver: isOver,
    chem: chem.length ? chem : ['履歴なし'],
    chemEmpty: chem.length === 0,
    wish: memo.wish,
    wishSub: memo.sub,
    pts,
    ptsTone,
    given,
    ptags,
    gift: !!reached && !isSync,
    chip,
    qr: isUnlinked,
    tone: isSync ? 'sync' : isDone ? 'done' : isOver ? 'over' : 'normal',
    isUnlinked,
    isRedeemable: !!reached && !isSync,
    isOver,
    isDone,
  }
}
