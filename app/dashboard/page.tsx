'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  resolveMenuPrice,
  resolveMenuDuration,
  toMenuMaster,
  type MenuMaster,
} from '@/lib/menuPricing';
import styles from './page.module.css';

/* ============================================================
   /dashboard — ホーム画面
   挨拶 / KPI 4枚 / タイムライン / 本日予約 / 来店促進 / タスク / メッセージ
   ============================================================ */

// 価格/所要時間は salon_menus マスタから解決(固定表は廃止)。
// マスタ未登録メニューは price=null(UI で - 表示・売上見込から除外)。
const DEFAULT_DURATION = 60;

interface Salon {
  id: string;
  name: string | null;
  owner_name: string | null;
}

interface Reservation {
  id: string;
  salon_id: string | null;
  customer_name: string | null;
  customer_line_id: string | null;
  datetime: string;
  menu: string | null;
  status: string | null;
  line_user_id: string | null;
}

interface Customer {
  id: string;
  salon_id: string | null;
  name: string | null;
  last_visit: string | null;
  visit_count: number | null;
  line_display_name: string | null;
  line_user_id: string | null;
  created_at: string | null;
}

interface PreCounseling {
  id: string;
  customer_id: string;
  salon_id: string;
  reservation_id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: any;
  status: string | null;
  created_at: string | null;
}

interface Task {
  id: string;
  salon_id: string;
  title: string;
  completed: boolean;
  is_urgent: boolean;
  due_at: string | null;
  created_at: string;
}

// メニュー名 -> 表示用トークン(items)+ マスタ解決の duration/price。
// items はチップ表示用の分解のみ(価格には不使用)。
// price は salon_menus マスタで確定できない場合 null(UI で - 表示)。
function parseMenuInfo(
  menu: string | null,
  masters: MenuMaster[]
): { items: string[]; duration: number; price: number | null } {
  const items = menu
    ? menu.split(/[,、+＋\s]/).map((s) => s.trim()).filter(Boolean)
    : [];
  const duration = resolveMenuDuration(menu, masters, DEFAULT_DURATION);
  const price = resolveMenuPrice(menu, masters);
  return { items, duration, price };
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'お疲れさまです';
  if (h < 11) return 'おはようございます';
  if (h < 17) return 'こんにちは';
  return 'こんばんは';
}

function formatJpDate(d: Date): string {
  const day = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日(${day})`;
}

function formatHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function diffDays(from: Date | string, to: Date = new Date()): number {
  const f = typeof from === 'string' ? new Date(from) : from;
  return Math.floor((to.getTime() - f.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DashboardHomePage() {
  // === Core state ===
  const [salon, setSalon] = useState<Salon | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [preCounselings, setPreCounselings] = useState<PreCounseling[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [menus, setMenus] = useState<MenuMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // === Task add modal ===
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskUrgent, setNewTaskUrgent] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  // === Refresh time every minute for "現在 HH:MM" indicator ===
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // === Data load ===
  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadError('ログインが必要です');
        setLoading(false);
        return;
      }

      // salon
      const { data: salonRow, error: salonErr } = await supabase
        .from('salons')
        .select('id, name, owner_name')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (salonErr || !salonRow) {
        setLoadError('サロン情報が取得できません');
        setLoading(false);
        return;
      }
      setSalon(salonRow as Salon);

      // 過去7日 + 未来7日の予約を取得(タイムライン/KPI 双方の為)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const [resRes, custRes, preRes, taskRes, hpbRes, menuRes] = await Promise.all([
        supabase
          .from('reservations')
          .select('id, salon_id, customer_name, customer_line_id, datetime, menu, status, line_user_id')
          .eq('salon_id', salonRow.id)
          .gte('datetime', startDate.toISOString())
          .lte('datetime', endDate.toISOString())
          .order('datetime', { ascending: true }),
        supabase
          .from('customers')
          .select('id, salon_id, name, last_visit, visit_count, line_display_name, line_user_id, created_at')
          .eq('salon_id', salonRow.id),
        supabase
          .from('pre_counselings')
          .select('id, customer_id, salon_id, reservation_id, answers, status, created_at')
          .eq('salon_id', salonRow.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('tasks')
          .select('id, salon_id, title, completed, is_urgent, due_at, created_at')
          .eq('salon_id', salonRow.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('hpb_reservations')
          .select('id, salon_id, customer_name, start_time, menu_name, status')
          .eq('salon_id', salonRow.id)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .order('start_time', { ascending: true }),
        supabase
          .from('salon_menus')
          .select('name, price, duration')
          .eq('salon_id', salonRow.id)
          .order('sort_order', { ascending: true }),
      ]);

      if (resRes.error) console.error('reservations:', resRes.error);
      if (custRes.error) console.error('customers:', custRes.error);
      if (preRes.error) console.error('pre_counselings:', preRes.error);
      if (taskRes.error) console.error('tasks:', taskRes.error);
      if (hpbRes.error) console.error('hpb_reservations:', hpbRes.error);
      if (menuRes.error) console.error('salon_menus:', menuRes.error);

      // HPB予約を home の Reservation 形に正規化してマージ
      const manualResv = (resRes.data as Reservation[]) ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hpbResv: Reservation[] = ((hpbRes.data as any[]) ?? [])
        .filter((r) => r.start_time)
        .map((r) => ({
          id: 'hpb_' + r.id,
          salon_id: r.salon_id ?? null,
          customer_name: r.customer_name ?? null,
          customer_line_id: null,
          datetime: r.start_time,
          menu: r.menu_name ?? null,
          status: r.status ?? null,
          line_user_id: null,
        }));
      const mergedResv = [...manualResv, ...hpbResv].sort(
        (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );
      setReservations(mergedResv);
      setCustomers((custRes.data as Customer[]) ?? []);
      setPreCounselings((preRes.data as PreCounseling[]) ?? []);
      setTasks((taskRes.data as Task[]) ?? []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMenus(((menuRes.data as any[]) ?? []).map(toMenuMaster));
    } catch (e) {
      console.error(e);
      setLoadError('予期しないエラー');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // === Derived data ===

  const now = currentTime;
  const startOfToday = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);
  const endOfToday = useMemo(() => {
    const d = new Date(now);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [now]);

  const todayReservations = useMemo(
    () =>
      reservations.filter(r => {
        const d = new Date(r.datetime);
        return d >= startOfToday && d <= endOfToday;
      }),
    [reservations, startOfToday, endOfToday],
  );

  const yesterdayCount = useMemo(() => {
    const yStart = new Date(startOfToday);
    yStart.setDate(yStart.getDate() - 1);
    const yEnd = new Date(endOfToday);
    yEnd.setDate(yEnd.getDate() - 1);
    return reservations.filter(r => {
      const d = new Date(r.datetime);
      return d >= yStart && d <= yEnd;
    }).length;
  }, [reservations, startOfToday, endOfToday]);

  const weekCount = useMemo(() => {
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(endOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    return reservations.filter(r => {
      const d = new Date(r.datetime);
      return d >= startOfWeek && d <= endOfWeek;
    }).length;
  }, [reservations, startOfToday, endOfToday]);

  const lastWeekCount = useMemo(() => {
    const startOfLastWeek = new Date(startOfToday);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay() - 7);
    const endOfLastWeek = new Date(endOfToday);
    endOfLastWeek.setDate(endOfLastWeek.getDate() + (6 - endOfLastWeek.getDay()) - 7);
    return reservations.filter(r => {
      const d = new Date(r.datetime);
      return d >= startOfLastWeek && d <= endOfLastWeek;
    }).length;
  }, [reservations, startOfToday, endOfToday]);

  const newCustomersThisMonth = useMemo(() => {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return customers.filter(c => c.created_at && new Date(c.created_at) >= startOfMonth).length;
  }, [customers, now]);

  const newCustomersLastMonth = useMemo(() => {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return customers.filter(c => {
      if (!c.created_at) return false;
      const d = new Date(c.created_at);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    }).length;
  }, [customers, now]);

  const todayRevenue = useMemo(() => {
    return todayReservations.reduce((sum, r) => {
      const p = resolveMenuPrice(r.menu, menus);
      return sum + (p ?? 0);
    }, 0);
  }, [todayReservations, menus]);

  // 1 件でもマスタ解決できた予約があるか(無ければ売上見込は - 表示)
  const hasResolvablePrice = useMemo(
    () => todayReservations.some((r) => resolveMenuPrice(r.menu, menus) != null),
    [todayReservations, menus],
  );

  const REVENUE_TARGET = 80000;

  // === Promotion candidates ===
  const promoCandidates = useMemo(() => {
    const candidates = customers
      .filter(c => c.last_visit && c.name)
      .map(c => {
        const days = diffDays(c.last_visit!);
        let category: string | null = null;
        if (days >= 90) category = `休眠(90日超)`;
        else if (days >= 60) category = `カット周期`;
        else if (days >= 45) category = `カラー周期`;
        if (!category) return null;
        return { ...c, daysSinceVisit: days, category };
      })
      .filter((c): c is Customer & { daysSinceVisit: number; category: string } => c !== null)
      .sort((a, b) => b.daysSinceVisit - a.daysSinceVisit)
      .slice(0, 5);
    return candidates;
  }, [customers]);

  // === Recent messages from pre_counselings ===
  const recentMessages = useMemo(() => {
    return preCounselings
      .filter(pc => pc.answers && (pc.status === 'submitted' || pc.status === 'answered' || pc.status === 'opened'))
      .slice(0, 3)
      .map(pc => {
        const customer = customers.find(c => c.id === pc.customer_id);
        const answersStr = (() => {
          try {
            const a = pc.answers;
            if (typeof a === 'string') return a.slice(0, 50);
            if (a?.message) return String(a.message).slice(0, 50);
            if (a?.note) return String(a.note).slice(0, 50);
            if (a?.request) return String(a.request).slice(0, 50);
            const firstVal = Object.values(a)[0];
            return firstVal ? String(firstVal).slice(0, 50) : '内容を確認...';
          } catch {
            return '内容を確認...';
          }
        })();
        return {
          id: pc.id,
          customerName: customer?.name || customer?.line_display_name || '顧客',
          text: answersStr,
          createdAt: pc.created_at,
          isUrgent: false,
        };
      });
  }, [preCounselings, customers]);

  // === Tasks computed ===
  const taskCompletion = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
  }, [tasks]);

  const taskRemaining = tasks.filter(t => !t.completed).length;

  // === Handlers ===

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed: !completed } : t)));
    try {
      const supabase = createClient();
      await supabase.from('tasks').update({ completed: !completed }).eq('id', taskId);
    } catch (e) {
      console.error('task toggle:', e);
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed: completed } : t)));
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !salon) return;
    setAddingTask(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          salon_id: salon.id,
          title: newTaskTitle.trim(),
          is_urgent: newTaskUrgent,
          completed: false,
        })
        .select()
        .single();
      if (error) throw error;
      setTasks(prev => [data as Task, ...prev]);
      setNewTaskTitle('');
      setNewTaskUrgent(false);
      setShowTaskModal(false);
    } catch (e) {
      console.error(e);
      alert('タスクの追加に失敗しました');
    } finally {
      setAddingTask(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <p style={{ color: '#8a7860', fontSize: 14, padding: 40 }}>読み込み中...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div style={{
          padding: '14px 18px',
          background: '#fdf5f3',
          border: '1px solid #e8b8b0',
          borderRadius: 8,
          color: '#c4392e',
          fontSize: 13,
        }}>
          ⚠ {loadError}
        </div>
      </div>
    );
  }

  const ownerName = salon?.owner_name || 'オーナー';
  const salonName = salon?.name || 'サロン';

  // Compute timeline range
  const TIMELINE_START_HOUR = 10;
  const TIMELINE_END_HOUR = 21;
  const TIMELINE_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

  return (
    <div className={styles.page}>
      {/* Greeting */}
      <header className={styles.greeting}>
        <h1 className={styles.greetingTitle}>
          {getGreeting()}、{ownerName}さん
        </h1>
        <p className={styles.greetingMeta}>
          {salonName} · {formatJpDate(now)}
        </p>
      </header>

      {/* KPI cards */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>本日の予約</p>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiIcon}>📅</span>
            <span className={styles.kpiValue}>{todayReservations.length}<span className={styles.kpiUnit}>件</span></span>
          </div>
          <p className={styles.kpiDelta}>
            {todayReservations.length >= yesterdayCount ? '↗' : '↘'} {todayReservations.length - yesterdayCount >= 0 ? '+' : ''}{todayReservations.length - yesterdayCount} 件 vs 昨日
          </p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>今週の予約</p>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiIcon}>👥</span>
            <span className={styles.kpiValue}>{weekCount}<span className={styles.kpiUnit}>件</span></span>
          </div>
          <p className={styles.kpiDelta}>
            {weekCount >= lastWeekCount ? '↗' : '↘'} {weekCount - lastWeekCount >= 0 ? '+' : ''}{weekCount - lastWeekCount} 件 vs 先週
          </p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>新規顧客(今月)</p>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiIcon}>✨</span>
            <span className={styles.kpiValue}>{newCustomersThisMonth}<span className={styles.kpiUnit}>名</span></span>
          </div>
          <p className={styles.kpiDelta}>
            {newCustomersThisMonth >= newCustomersLastMonth ? '↗' : '↘'} {newCustomersThisMonth - newCustomersLastMonth >= 0 ? '+' : ''}{newCustomersThisMonth - newCustomersLastMonth} 名 vs 先月
          </p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>本日の売上見込み</p>
          <div className={styles.kpiValueRow}>
            {hasResolvablePrice ? (
              <>
                <span className={styles.kpiIcon}>¥</span>
                <span className={styles.kpiValue}>
                  {(todayRevenue / 1000).toFixed(1)}<span className={styles.kpiUnit}>k</span>
                </span>
              </>
            ) : (
              <span className={styles.kpiValue}>—</span>
            )}
          </div>
          {hasResolvablePrice ? (
            <p className={styles.kpiDelta} style={{ color: todayRevenue >= REVENUE_TARGET ? '#7a8a5c' : '#c4392e' }}>
              目標 ¥{(REVENUE_TARGET / 1000).toFixed(0)}k に対して {Math.round((todayRevenue / REVENUE_TARGET) * 100)}%
            </p>
          ) : (
            <p className={styles.kpiDelta} style={{ color: 'var(--muted)' }}>
              メニュー単価未登録のため算出不可
            </p>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>本日のタイムライン</h2>
          <span className={styles.cardSub}>● 現在 {formatHHMM(now)}</span>
          <Link href="/dashboard/booking" className={styles.cardAction}>スケジュール全画面 →</Link>
        </div>
        <div className={styles.timelineWrap}>
          <div className={styles.timelineHours}>
            {Array.from({ length: TIMELINE_HOURS + 1 }, (_, i) => TIMELINE_START_HOUR + i).map(h => (
              <span key={h} className={styles.timelineHour}>{String(h).padStart(2, '0')}:00</span>
            ))}
          </div>
          <div className={styles.timelineTrack}>
            {todayReservations.map(r => {
              const dt = new Date(r.datetime);
              const startMin = dt.getHours() * 60 + dt.getMinutes() - TIMELINE_START_HOUR * 60;
              const info = parseMenuInfo(r.menu, menus);
              const widthMin = info.duration;
              const left = (startMin / (TIMELINE_HOURS * 60)) * 100;
              const width = (widthMin / (TIMELINE_HOURS * 60)) * 100;
              if (left < 0 || left > 100) return null;
              return (
                <div
                  key={r.id}
                  className={styles.timelineBlock}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${r.customer_name || '名前なし'} - ${r.menu || ''}`}
                >
                  <span className={styles.timelineBlockTime}>
                    {formatHHMM(dt)}–{formatHHMM(new Date(dt.getTime() + widthMin * 60_000))}
                  </span>
                  <span className={styles.timelineBlockMenu}>{info.items[0] || r.menu || 'メニュー'}</span>
                </div>
              );
            })}
            {/* Now indicator */}
            {(() => {
              const nowMin = now.getHours() * 60 + now.getMinutes() - TIMELINE_START_HOUR * 60;
              if (nowMin < 0 || nowMin > TIMELINE_HOURS * 60) return null;
              return (
                <div
                  className={styles.timelineNow}
                  style={{ left: `${(nowMin / (TIMELINE_HOURS * 60)) * 100}%` }}
                />
              );
            })()}
          </div>
          <p className={styles.timelineHint}>→ 30分刻み・横にスクロール可能</p>
        </div>
      </section>

      {/* Today's Reservations List */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>本日の予約</h2>
          <span className={styles.cardCount}>全て {todayReservations.length}</span>
        </div>
        {todayReservations.length === 0 ? (
          <p className={styles.emptyMsg}>本日の予約はありません</p>
        ) : (
          <div className={styles.reservationList}>
            {todayReservations.map(r => {
              const dt = new Date(r.datetime);
              const customer = customers.find(c => 
                c.line_user_id && r.line_user_id && c.line_user_id === r.line_user_id
                || c.name === r.customer_name
              );
              const info = parseMenuInfo(r.menu, menus);
              const preCounseling = preCounselings.find(pc => pc.reservation_id === r.id);
              return (
                <div key={r.id} className={styles.reservationRow}>
                  <div className={styles.resTime}>
                    <div className={styles.resTimeMain}>{formatHHMM(dt)}</div>
                    <div className={styles.resTimeSub}>{info.duration}分</div>
                  </div>
                  <div className={styles.resAvatar}>
                    {(r.customer_name || customer?.name || '?').charAt(0)}
                  </div>
                  <div className={styles.resBody}>
                    <div className={styles.resCustomer}>
                      <span className={styles.resName}>{r.customer_name || customer?.name || '名前なし'} 様</span>
                      {r.status && (
                        <span className={styles.resStatus}>● {r.status === 'confirmed' ? '確定' : r.status}</span>
                      )}
                    </div>
                    <div className={styles.resMeta}>
                      {customer?.visit_count != null && `${customer.visit_count + 1}回目`}
                      {customer?.last_visit && ` · 前回 ${new Date(customer.last_visit).toLocaleDateString('ja-JP')}(${diffDays(customer.last_visit)}日前)`}
                    </div>
                    <div className={styles.resMenuRow}>
                      <span className={styles.resMenuLabel}>メニュー</span>
                      {info.items.length > 0 ? (
                        info.items.map((it, i) => (
                          <span key={i} className={styles.resMenuChip}>{it}</span>
                        ))
                      ) : (
                        <span className={styles.resMenuChip}>{r.menu || '—'}</span>
                      )}
                    </div>
                    {preCounseling && (
                      <div className={styles.resCounseling}>
                        <div className={styles.resCounselingHead}>○ LINE 事前カウンセリング</div>
                        <div className={styles.resCounselingBody}>
                          「{(() => {
                            try {
                              const a = preCounseling.answers;
                              if (typeof a === 'string') return a.slice(0, 100);
                              if (a?.message) return String(a.message).slice(0, 100);
                              if (a?.note) return String(a.note).slice(0, 100);
                              if (a?.request) return String(a.request).slice(0, 100);
                              const firstVal = Object.values(a || {})[0];
                              return firstVal ? String(firstVal).slice(0, 100) : '内容を確認...';
                            } catch {
                              return '内容を確認...';
                            }
                          })()}」
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.resRight}>
                    <div className={styles.resPrice}>{info.price == null ? '—' : `¥${info.price.toLocaleString()}`}</div>
                    <button type="button" className={styles.resCta}>受付開始</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom row: Promo candidates / Tasks / Messages */}
      <section className={styles.bottomGrid}>
        {/* Promo candidates */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>来店促進候補</h2>
            <span className={styles.cardCount}>{promoCandidates.length}名</span>
          </div>
          {promoCandidates.length === 0 ? (
            <p className={styles.emptyMsg}>該当する顧客はいません</p>
          ) : (
            <>
              <div className={styles.promoList}>
                {promoCandidates.map(c => (
                  <div key={c.id} className={styles.promoRow}>
                    <div className={styles.promoAvatar}>{(c.name || '?').charAt(0)}</div>
                    <div className={styles.promoBody}>
                      <div className={styles.promoName}>{c.name} 様</div>
                      <div className={styles.promoMeta}>● {c.daysSinceVisit}日前 · {c.category}</div>
                    </div>
                    <Link href="/dashboard/messages" className={styles.promoCta}>+ 招待</Link>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/messages" className={styles.promoFooter}>DM一括配信 →</Link>
            </>
          )}
        </div>

        {/* Tasks */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>今日のタスク</h2>
            <button type="button" className={styles.cardAction} onClick={() => setShowTaskModal(true)}>+ 追加</button>
          </div>
          {tasks.length === 0 ? (
            <p className={styles.emptyMsg}>タスクはありません</p>
          ) : (
            <>
              <div className={styles.taskList}>
                {tasks.map(t => (
                  <label key={t.id} className={styles.taskRow}>
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleTask(t.id, t.completed)}
                      className={styles.taskCheckbox}
                    />
                    <span className={`${styles.taskTitle} ${t.completed ? styles.taskTitleDone : ''}`}>
                      {t.title}
                    </span>
                    {t.is_urgent && !t.completed && (
                      <span className={styles.taskBadge}>急ぎ</span>
                    )}
                  </label>
                ))}
              </div>
              <p className={styles.taskSummary}>
                残り {taskRemaining} 件 · 完了率 {taskCompletion}%
              </p>
            </>
          )}
        </div>

        {/* Messages */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>メッセージ</h2>
            <span className={styles.cardCount}>{recentMessages.length}</span>
          </div>
          {recentMessages.length === 0 ? (
            <p className={styles.emptyMsg}>新着メッセージはありません</p>
          ) : (
            <>
              <div className={styles.msgList}>
                {recentMessages.map(m => (
                  <div key={m.id} className={styles.msgRow}>
                    <div className={styles.msgAvatar}>{m.customerName.charAt(0)}</div>
                    <div className={styles.msgBody}>
                      <div className={styles.msgHead}>
                        <span className={styles.msgName}>{m.customerName} 様</span>
                        <span className={styles.msgTime}>
                          {m.createdAt ? (
                            new Date(m.createdAt).toDateString() === now.toDateString()
                              ? formatHHMM(new Date(m.createdAt))
                              : '昨日'
                          ) : ''}
                        </span>
                      </div>
                      <div className={styles.msgText}>{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/messages" className={styles.msgFooter}>全てのメッセージ →</Link>
            </>
          )}
        </div>
      </section>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className={styles.modalOverlay} onClick={() => !addingTask && setShowTaskModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>新規タスク追加</h3>
            <input
              type="text"
              className={styles.modalInput}
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="例: 在庫: カラー剤発注確認"
              autoFocus
            />
            <label className={styles.modalCheckbox}>
              <input
                type="checkbox"
                checked={newTaskUrgent}
                onChange={e => setNewTaskUrgent(e.target.checked)}
              />
              急ぎ
            </label>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setShowTaskModal(false)}
                disabled={addingTask}
              >
                キャンセル
              </button>
              <button
                type="button"
                className={styles.modalSubmit}
                onClick={handleAddTask}
                disabled={addingTask || !newTaskTitle.trim()}
              >
                {addingTask ? '追加中...' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
