import { createClient } from '@/lib/supabase/client'

export type FormulaItem = {
  maker?: string | null
  product?: string | null
  shade?: string | null
  ratio?: number | string | null
  grams?: number | null
}

export type ChemNote = {
  id: string
  salon_id: string
  customer_id: string
  reservation_id: string | null
  visited_on: string
  service_type: string | null
  formula: FormulaItem[] | null
  oxidant_pct: number | null
  process_min: number | null
  heat: boolean | null
  root_growth_cm: number | null
  gray_ratio: number | null
  scalp_note: string | null
  finish: string | null
  handover: string | null
  patch_test_on: string | null
  color_label: string | null
  source: 'carry_over' | 'edited' | 'migration'
  updated_at: string | null
}

export type ChemDraft = {
  service_type: string
  formula: string
  oxidant_pct: string
  process_min: string
  root_growth_cm: string
  gray_ratio: string
  scalp_note: string
  finish: string
  handover: string
  color_label: string
}

const COLUMNS =
  'id, salon_id, customer_id, reservation_id, visited_on, service_type, formula, oxidant_pct, process_min, heat, root_growth_cm, gray_ratio, scalp_note, finish, handover, patch_test_on, color_label, source, updated_at'

export function formulaText(f: FormulaItem[] | null | undefined): string {
  if (!f || f.length === 0) return ''
  const shades = f.map((x) => String(x.shade ?? x.product ?? '')).filter(Boolean)
  if (shades.length === 1) return `${shades[0]} 単品`
  const ratios = f.map((x) => x.ratio).filter((r) => r != null && r !== '')
  return ratios.length === shades.length ? `${shades.join('+')} ${ratios.join(':')}` : shades.join('+')
}

/** "6/0+8/0 1:1" / "6/0 単品" を formula に戻す */
export function parseFormula(text: string): FormulaItem[] {
  const t = text.trim()
  if (!t) return []
  const [shadePart, ratioPart] = t.replace(/\s*単品\s*$/, '').split(/\s+/)
  const shades = shadePart.split('+').map((s) => s.trim()).filter(Boolean)
  const ratios = (ratioPart ?? '').split(':').map((r) => Number(r)).filter((n) => Number.isFinite(n) && n > 0)
  return shades.map((shade, i) => ({ shade, ratio: ratios.length === shades.length ? ratios[i] : null }))
}

function str(v: number | string | null | undefined): string {
  return v == null ? '' : String(v)
}

export function toDraft(n: ChemNote | null): ChemDraft {
  return {
    service_type: n?.service_type ?? '',
    formula: formulaText(n?.formula),
    oxidant_pct: str(n?.oxidant_pct),
    process_min: str(n?.process_min),
    root_growth_cm: str(n?.root_growth_cm),
    gray_ratio: str(n?.gray_ratio),
    scalp_note: n?.scalp_note ?? '',
    finish: n?.finish ?? '',
    handover: n?.handover ?? '',
    color_label: n?.color_label ?? '',
  }
}

function num(v: string): number | null {
  const t = v.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

function text(v: string): string | null {
  const t = v.trim()
  return t ? t : null
}

export async function fetchChemNotes(
  customerId: string,
  reservationId: string,
): Promise<{ current: ChemNote | null; past: ChemNote[] } | { error: string }> {
  const supabase = createClient()
  const [cur, past] = await Promise.all([
    supabase.from('pass_chemical_notes').select(COLUMNS).eq('reservation_id', reservationId).maybeSingle(),
    supabase
      .from('pass_chemical_notes')
      .select(COLUMNS)
      .eq('customer_id', customerId)
      .or(`reservation_id.is.null,reservation_id.neq.${reservationId}`)
      .order('visited_on', { ascending: false })
      .limit(3),
  ])
  if (cur.error) return { error: cur.error.message }
  if (past.error) return { error: past.error.message }
  return { current: (cur.data as ChemNote | null) ?? null, past: (past.data as ChemNote[] | null) ?? [] }
}

/** 今回分があれば update、無ければ前回を複製して insert。どちらも source='edited' */
export async function saveChemNote(params: {
  draft: ChemDraft
  current: ChemNote | null
  previous: ChemNote | null
  salonId: string
  customerId: string
  reservationId: string
  visitedOn: string
}): Promise<{ error: string | null }> {
  const { draft, current, previous } = params
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const base = current ?? previous
  const formulaUnchanged = draft.formula.trim() === formulaText(base?.formula)
  const fields = {
    service_type: text(draft.service_type),
    formula: formulaUnchanged ? (base?.formula ?? null) : parseFormula(draft.formula),
    oxidant_pct: num(draft.oxidant_pct),
    process_min: num(draft.process_min),
    root_growth_cm: num(draft.root_growth_cm),
    gray_ratio: num(draft.gray_ratio),
    scalp_note: text(draft.scalp_note),
    finish: text(draft.finish),
    handover: text(draft.handover),
    color_label: text(draft.color_label),
    source: 'edited' as const,
    updated_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
  }

  if (current) {
    const { error } = await supabase.from('pass_chemical_notes').update(fields).eq('id', current.id)
    return { error: error?.message ?? null }
  }

  const { error } = await supabase.from('pass_chemical_notes').insert({
    salon_id: params.salonId,
    customer_id: params.customerId,
    reservation_id: params.reservationId,
    visited_on: params.visitedOn,
    heat: previous?.heat ?? null,
    patch_test_on: previous?.patch_test_on ?? null,
    ...fields,
  })
  return { error: error?.message ?? null }
}
