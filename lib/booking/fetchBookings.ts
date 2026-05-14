/**
 * lib/booking/fetchBookings.ts
 *
 * Supabase から hpb_reservations と reservations を取得し、
 * UI 用の Booking 型(srkMockData.ts)に正規化する。
 *
 * 既存 commit a07ddf0 の取得ロジックを継承。
 */

import { createClient } from '@/lib/supabase/client';
import type {
  Booking,
  BookingStatus,
  BookingSource,
  ServiceKey,
} from '@/lib/srkMockData';

/* ─── ISO 文字列 → minutes from midnight ─────────────────────── */
function isoToMin(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/* ─── メニュー文字列から ServiceKey タグ群を推定 ─────────────────
   HPB の menu_name は「ナチュラル成分配合で…リタッチカラー(根元染め)」のように長文。
   日本語キーワードからシンプルに分類する。 */
function inferTags(menu: string | null | undefined): ServiceKey[] {
  if (!menu) return [];
  const tags = new Set<ServiceKey>();
  const m = menu;
  if (m.includes('カット') || m.includes('CUT')) tags.add('C');
  if (m.includes('白髪')) tags.add('S');
  else if (m.includes('カラー') || m.includes('COLOR') || m.includes('染め')) tags.add('L');
  if (m.includes('パーマ') || m.includes('PERM')) tags.add('P');
  if (m.includes('トリートメント') || m.includes('TR')) tags.add('T');
  if (m.includes('ヘッドスパ') || m.includes('スパ')) tags.add('H');
  return Array.from(tags);
}

/* ─── status / source の正規化(unknown 値は安全側に倒す) ──── */
const VALID_STATUS: BookingStatus[] = [
  'confirmed', 'tentative', 'inprogress', 'done', 'canceled',
];
function normStatus(s: any): BookingStatus {
  return VALID_STATUS.includes(s) ? (s as BookingStatus) : 'confirmed';
}

const VALID_SOURCE: BookingSource[] = [
  'hpb', 'hotpepper', 'web', 'phone', 'walkin', 'repeat', 'line', 'manual',
];
function normSource(s: any, fallback: BookingSource): BookingSource {
  return VALID_SOURCE.includes(s) ? (s as BookingSource) : fallback;
}

/* ─── 取得関数 ────────────────────────────────────────────────── */

export interface FetchResult {
  bookings: Booking[];
  salonId: string | null;
  salonName: string | null;
  /** True if both tables failed (network/permission). */
  error?: string;
}

/**
 * 指定日付の予約を Supabase から取得し Booking[] に正規化。
 *
 * - `dayStart` ≤ start_time < `dayEnd` の範囲で hpb_reservations & reservations を取得
 * - 認証ユーザーの owner_user_id でサロン特定
 * - 取得失敗時は console.warn してフォールバック (空配列)
 *
 * 戻り値の bookings は start 昇順。
 */
export async function fetchBookingsForRange(
  dayStart: Date,
  dayEnd: Date
): Promise<FetchResult> {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { bookings: [], salonId: null, salonName: null, error: 'unauthenticated' };
  }

  // サロン特定
  const { data: salon, error: salonErr } = await supabase
    .from('salons')
    .select('id, name')
    .eq('owner_user_id', user.id)
    .maybeSingle();

  if (salonErr || !salon) {
    return {
      bookings: [],
      salonId: null,
      salonName: null,
      error: salonErr?.message || 'salon not found',
    };
  }

  // hpb_reservations
  let hpbData: any[] = [];
  try {
    const r = await supabase
      .from('hpb_reservations')
      .select('*')
      .eq('salon_id', salon.id)
      .gte('start_time', dayStart.toISOString())
      .lt('start_time', dayEnd.toISOString())
      .order('start_time', { ascending: true });
    hpbData = r.data || [];
  } catch (e) {
    console.warn('[fetchBookings] hpb_reservations fetch failed:', e);
  }

  // reservations (manual entry)
  let resvData: any[] = [];
  try {
    const r = await supabase
      .from('reservations')
      .select('*')
      .eq('salon_id', salon.id)
      .gte('datetime', dayStart.toISOString())
      .lt('datetime', dayEnd.toISOString())
      .order('datetime', { ascending: true });
    resvData = r.data || [];
  } catch (e) {
    console.warn('[fetchBookings] reservations fetch failed:', e);
  }

  const all: Booking[] = [];

  // HPB → Booking 変換
  for (const r of hpbData) {
    if (!r.start_time) continue;
    const startMin = isoToMin(r.start_time);
    const endMin = r.end_time ? isoToMin(r.end_time) : startMin + 60;
    // 現状 SalonRink は単一スタッフ(オーナー)運用なので s1 に集約。
    // 将来スタッフプラン契約時は r.raw_data.staff_id をマッピング。
    const staffId = 's1';
    const menu = r.menu_name || (r.raw_data && r.raw_data.menu_name) || '';
    all.push({
      id: 'hpb_' + r.id,
      rawId: r.id,
      staff: staffId,
      start: startMin,
      end: endMin,
      customer: r.customer_name || 'ゲスト',
      ageBand: '',
      tags: inferTags(menu),
      status: normStatus(r.status),
      repeat: 0, // TODO: customer table join
      amount: Number(r.price) || 0,
      isNew: false,
      note: menu || undefined,
      source: normSource(r.source, 'hpb'),
    });
  }

  // reservations(手動) → Booking 変換
  for (const r of resvData) {
    if (!r.datetime) continue;
    const startMin = isoToMin(r.datetime);
    const duration = Number(r.duration_min) || 60;
    const endMin = startMin + duration;
    const menu = r.menu_name || r.menu || '';
    all.push({
      id: 'resv_' + r.id,
      rawId: r.id,
      staff: 's1',
      start: startMin,
      end: endMin,
      customer: r.customer_name || r.customerName || 'ゲスト',
      ageBand: '',
      tags: inferTags(menu),
      status: normStatus(r.status),
      repeat: 0,
      amount: Number(r.price) || 0,
      isNew: false,
      note: menu || r.note || r.memo || undefined,
      source: normSource(r.source, 'manual'),
    });
  }

  // start 昇順
  all.sort((a, b) => a.start - b.start);

  return { bookings: all, salonId: salon.id, salonName: salon.name };
}

/* ─── 単日取得(API 統一のため day ラッパー) ────────────────── */
export function fetchBookingsForDay(date: Date): Promise<FetchResult> {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return fetchBookingsForRange(start, end);
}

/* ─── 週取得(月曜開始) ─────────────────────────────────────── */
export function fetchBookingsForWeek(weekContaining: Date): Promise<FetchResult> {
  const start = new Date(weekContaining);
  start.setHours(0, 0, 0, 0);
  const dayDiff = (start.getDay() + 6) % 7; // Monday-start
  start.setDate(start.getDate() - dayDiff);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return fetchBookingsForRange(start, end);
}

/* ─── 月取得 ─────────────────────────────────────────────────── */
export function fetchBookingsForMonth(monthContaining: Date): Promise<FetchResult> {
  const y = monthContaining.getFullYear();
  const m = monthContaining.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);
  return fetchBookingsForRange(start, end);
}
