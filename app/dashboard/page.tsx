'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Salon {
  id: string;
  name: string | null;
  owner_name: string | null;
  email: string | null;
  plan: string | null;
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

interface Alert {
  id: string;
  message: string | null;
  type: string | null;
  created_at: string | null;
}

interface HPBReservation {
  id: string;
  salon_id: string | null;
  start_time: string;
  end_time: string | null;
  staff_name: string | null;
  menu_name: string | null;
  customer_name: string | null;
  status: string | null;
  source: string | null;
}

function formatJpDate(d: Date): string {
  const day = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日（${day}）`;
}

function formatHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const VIEW_TITLES: Record<string, string> = {
  home: 'ホーム',
  booking: 'HPB予約',
  cust: '顧客',
  dm: 'DM配信',
  int: '連携',
  con: 'コンシェルジュ',
  plan: 'プラン',
  news: 'お知らせ',
  ec: '店販EC',
  rev: '口コミ承認',
};

// SVGアイコンコンポーネント
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

const BookingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M4 10h16" />
  </svg>
);

const CustomerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M16.5 14.5c2.6.3 4.5 2.5 4.5 5.5" />
  </svg>
);

const DMIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12h6M8 7H6a5 5 0 0 0 0 10h2M16 7h2a5 5 0 0 1 0 10h-2" />
  </svg>
);

const ConciergIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" />
  </svg>
);

const PlanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const NewsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 2 8 2 8H4s2-1 2-8" />
    <path d="M10 21h4" />
  </svg>
);

const ECIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 7h12l-1.2 12.2a1.8 1.8 0 0 1-1.8 1.8H9a1.8 1.8 0 0 1-1.8-1.8L6 7z" />
    <path d="M9 9V6a3 3 0 0 1 6 0v3" />
  </svg>
);

const ReviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 2 8 2 8H4s2-1 2-8" />
    <path d="M10 21h4" />
  </svg>
);

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [baseTheme, setBaseTheme] = useState<string>('');
  const [accTheme, setAccTheme] = useState<string>('terracotta');
  const [salon, setSalon] = useState<Salon | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBookingDate, setSelectedBookingDate] = useState(new Date());
  const [bookingHpb, setBookingHpb] = useState<HPBReservation[]>([]);
  const [bookingManual, setBookingManual] = useState<Reservation[]>([]);

  // Load theme from localStorage
  useEffect(() => {
    const savedBase = localStorage.getItem('sr-admin-base') || '';
    const savedAcc = localStorage.getItem('sr-admin-acc') || 'terracotta';
    setBaseTheme(savedBase);
    setAccTheme(savedAcc);
  }, []);

  // Update time every minute
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Load data
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: salonRow } = await supabase
        .from('salons')
        .select('id, name, owner_name, email, plan')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (!salonRow) {
        setLoading(false);
        return;
      }
      setSalon(salonRow as Salon);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const [resRes, custRes, alertRes] = await Promise.all([
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
          .from('alerts')
          .select('id, message, type, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      setReservations((resRes.data as Reservation[]) ?? []);
      setCustomers((custRes.data as Customer[]) ?? []);
      setAlerts((alertRes.data as Alert[]) ?? []);
    } catch (e) {
      console.error('Data load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // booking ビュー: selectedBookingDate ごとにfetch
  useEffect(() => {
    if (!salon) return;
    const ds = new Date(selectedBookingDate);
    ds.setHours(0, 0, 0, 0);
    const de = new Date(selectedBookingDate);
    de.setHours(23, 59, 59, 999);
    const supabase = createClient();
    (async () => {
      const [h, m] = await Promise.all([
        supabase
          .from('hpb_reservations')
          .select('id, salon_id, start_time, end_time, staff_name, menu_name, customer_name, status, source')
          .eq('salon_id', salon.id)
          .gte('start_time', ds.toISOString())
          .lte('start_time', de.toISOString())
          .order('start_time', { ascending: true }),
        supabase
          .from('reservations')
          .select('id, salon_id, customer_name, customer_line_id, datetime, menu, status, line_user_id')
          .eq('salon_id', salon.id)
          .gte('datetime', ds.toISOString())
          .lte('datetime', de.toISOString())
          .order('datetime', { ascending: true }),
      ]);
      setBookingHpb((h.data as HPBReservation[]) ?? []);
      setBookingManual((m.data as Reservation[]) ?? []);
    })();
  }, [salon, selectedBookingDate]);

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

  // booking ビュー用: bookingHpb + bookingManual をスタッフ別にグループ化
  const selectedDayReservations = useMemo(() => {
    return [...bookingHpb, ...bookingManual];
  }, [bookingHpb, bookingManual]);

  const staffLanes = useMemo(() => {
    const staffMap = new Map<string | null, any[]>();
    selectedDayReservations.forEach(r => {
      const staff = 'staff_name' in r ? r.staff_name : null;
      if (!staffMap.has(staff)) {
        staffMap.set(staff, []);
      }
      staffMap.get(staff)!.push(r);
    });
    // フリー枠を最後に
    const result = Array.from(staffMap.entries())
      .filter(([staff]) => staff !== null)
      .map(([staff, reservs]) => ({ staff, reservs }))
      .concat(staffMap.has(null) ? [{ staff: null, reservs: staffMap.get(null)! }] : []);
    return result;
  }, [selectedDayReservations]);

  const handleThemeChange = (base: string) => {
    setBaseTheme(base);
    localStorage.setItem('sr-admin-base', base);
  };

  const handleAccThemeChange = (acc: string) => {
    setAccTheme(acc);
    localStorage.setItem('sr-admin-acc', acc);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="ad" data-theme={baseTheme === 'white' ? 'white' : ''} data-acc={accTheme}>
      {/* ============ サイドバー ============ */}
      <aside className="sb">
        <div className="sb-brand">
          <span className="sb-logo">S</span>
          <div>
            <strong>SalonRink</strong>
            <span>サロン管理</span>
          </div>
        </div>
        <nav className="sb-nav">
          <button
            className={`sb-item ${currentView === 'home' ? 'on' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            <HomeIcon />
            ホーム
          </button>
          <button
            className={`sb-item ${currentView === 'booking' ? 'on' : ''}`}
            onClick={() => setCurrentView('booking')}
          >
            <BookingIcon />
            HPB予約
          </button>
          <button
            className={`sb-item ${currentView === 'cust' ? 'on' : ''}`}
            onClick={() => setCurrentView('cust')}
          >
            <CustomerIcon />
            顧客
          </button>
          <button
            className={`sb-item ${currentView === 'dm' ? 'on' : ''}`}
            onClick={() => setCurrentView('dm')}
          >
            <DMIcon />
            DM配信
          </button>
          <button
            className={`sb-item ${currentView === 'int' ? 'on' : ''}`}
            onClick={() => setCurrentView('int')}
          >
            <LinkIcon />
            連携
          </button>
          <button
            className={`sb-item ${currentView === 'con' ? 'on' : ''}`}
            onClick={() => setCurrentView('con')}
          >
            <ConciergIcon />
            コンシェルジュ<span className="tag">NEW</span>
          </button>
          <button
            className={`sb-item ${currentView === 'plan' ? 'on' : ''}`}
            onClick={() => setCurrentView('plan')}
          >
            <PlanIcon />
            プラン<span className="tag">FREE</span>
          </button>
          <button
            className={`sb-item ${currentView === 'news' ? 'on' : ''}`}
            onClick={() => setCurrentView('news')}
          >
            <NewsIcon />
            お知らせ<span className="tag">3</span>
          </button>
          <button
            className={`sb-item ${currentView === 'ec' ? 'on' : ''}`}
            onClick={() => setCurrentView('ec')}
          >
            <ECIcon />
            店販EC
          </button>
          <button
            className={`sb-item ${currentView === 'rev' ? 'on' : ''}`}
            onClick={() => setCurrentView('rev')}
          >
            <ReviewIcon />
            口コミ承認
          </button>
        </nav>
        <div className="sb-user">
          <span className="ava">{salon?.name?.charAt(0) || 'サ'}</span>
          <div>
            <strong>{salon?.name || 'サロン'}</strong>
            <span>{salon?.email || 'owner@salonrink.jp'}</span>
          </div>
        </div>
        <button className="sb-logout" onClick={handleLogout}>
          → ログアウト
        </button>
      </aside>

      {/* ============ メイン ============ */}
      <main className="main">
        {/* トップバー */}
        <div className="topbar">
          <div>
            <h1>{VIEW_TITLES[currentView]}</h1>
            <span className="date">{formatJpDate(now)}</span>
          </div>
          <div className="search">
            <SearchIcon />
            顧客・予約を検索
            <kbd>⌘K</kbd>
          </div>
          <div className="top-right">
            <div className="theme-pick">
              <span className="theme-lbl">ベース</span>
              <button
                className={`${baseTheme === '' ? 'on' : ''}`}
                style={{
                  background: '#EFE8E2',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), 2px 2px 5px var(--dark)',
                }}
                onClick={() => handleThemeChange('')}
              />
              <button
                className={`${baseTheme === 'white' ? 'on' : ''}`}
                style={{
                  background: 'linear-gradient(145deg, #FFFFFF, #E8E6E1)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12), 2px 2px 5px var(--dark)',
                }}
                onClick={() => handleThemeChange('white')}
              />
            </div>
            <div className="theme-pick">
              <span className="theme-lbl">アクセント</span>
              {['terracotta', 'sage', 'bluegray', 'gold', 'plum', 'charcoal'].map((acc) => (
                <button
                  key={acc}
                  className={`${accTheme === acc ? 'on' : ''}`}
                  onClick={() => handleAccThemeChange(acc)}
                  style={{
                    background:
                      acc === 'terracotta'
                        ? 'linear-gradient(145deg, #CD7758, #AE5C40)'
                        : acc === 'sage'
                          ? 'linear-gradient(145deg, #67A07B, #54855F)'
                          : acc === 'bluegray'
                            ? 'linear-gradient(145deg, #7B93B4, #5F7798)'
                            : acc === 'gold'
                              ? 'linear-gradient(145deg, #C29D58, #A37F3E)'
                              : acc === 'plum'
                                ? 'linear-gradient(145deg, #A87288, #8A4F66)'
                                : 'linear-gradient(145deg, #6B6560, #4A4540)',
                  }}
                />
              ))}
            </div>
            <span className="plan-chip">
              <span className="dot" />
              プラン {salon?.plan || 'FREE'}
            </span>
            <button className="icon-btn">
              <BellIcon />
              <span className="n">—</span>
            </button>
            <button className="cta-btn">＋ 新規予約</button>
          </div>
        </div>

        {/* ホームビュー */}
        {currentView === 'home' && (
          <section className="view on">
            {/* KPI 4枚 */}
            <div className="kpis">
              <div className="kpi">
                <div className="lbl">本日の予約</div>
                <div className="val">
                  {todayReservations.length}
                  <small> 件</small>
                </div>
                <div className="delta">うち指名 —</div>
              </div>
              <div className="kpi">
                <div className="lbl">今月の来客</div>
                <div className="val">
                  {customers.length}
                  <small> 人</small>
                </div>
                <div className="delta">＋— 前月比</div>
              </div>
              <div className="kpi">
                <div className="lbl">リピート率</div>
                <div className="val">
                  —
                  <small> %</small>
                </div>
                <div className="delta">＋— 前月比</div>
              </div>
              <div className="kpi">
                <div className="lbl">今月の売上</div>
                <div className="val">
                  —
                  <small>/月</small>
                </div>
                <div className="delta">目標の —%</div>
              </div>
            </div>

            {/* グリッド: タイムライン + お知らせ */}
            <div className="home-grid">
              <div className="card">
                <div className="v-head" style={{ margin: '0 0 4px' }}>
                  <h2>本日のタイムライン</h2>
                  <span className="en hand">Today</span>
                  <span className="right">{formatJpDate(now)}</span>
                </div>
                <div className="tl">
                  {todayReservations.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--hint)', fontSize: '13px' }}>
                      本日の予約はありません
                    </div>
                  ) : (
                    todayReservations.slice(0, 5).map((r) => (
                      <div key={r.id} className="tl-row">
                        <span className="t hand">{formatHHMM(new Date(r.datetime))}</span>
                        <div>
                          <strong>{r.customer_name || '名前未設定'}</strong>
                          <span className="m">{r.menu || 'メニュー未設定'}</span>
                        </div>
                        <span className="st">{r.status === 'confirmed' ? '確定' : 'リクエスト'}</span>
                      </div>
                    ))
                  )}
                </div>
                <p className="note">※表示は本日の確定・リクエスト予約です。</p>
              </div>

              <div className="card">
                <div className="v-head" style={{ margin: '0 0 4px' }}>
                  <h2>お知らせ</h2>
                  <span className="en hand">News</span>
                </div>
                <div className="news-li">
                  {alerts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--hint)', fontSize: '13px' }}>
                      お知らせはありません
                    </div>
                  ) : (
                    alerts.map((a) => (
                      <div key={a.id} className="news-row">
                        <div className="meta">
                          <span className="b">{a.type || '情報'}</span>
                          {a.created_at && new Date(a.created_at).toLocaleDateString('ja-JP')}
                        </div>
                        <strong>{a.message}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* HPB予約ビュー */}
        {currentView === 'booking' && (
          <section className="view on">
            <div className="card">
              <div className="day-nav">
                <div className="arrows">
                  <button onClick={() => setSelectedBookingDate(new Date(selectedBookingDate.getTime() - 86400000))}>‹</button>
                  <button onClick={() => setSelectedBookingDate(new Date(selectedBookingDate.getTime() + 86400000))}>›</button>
                </div>
                <span className="big hand">{String(selectedBookingDate.getDate()).padStart(2, ' ')} {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][selectedBookingDate.getMonth()]}</span>
                <span className="d">{formatJpDate(selectedBookingDate)}</span>
                <div className="chip-row" style={{ marginLeft: 'auto' }}>
                  <button className="chip on">日</button>
                  <button className="chip">週</button>
                  <button className="chip">月</button>
                </div>
              </div>
              {selectedDayReservations.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--hint)', fontSize: '13px' }}>
                  この日の予約はありません
                </div>
              ) : (
                <div className="tt">
                  <div className="tt-grid">
                    <div className="tt-hours">
                      <span></span>
                      {Array.from({ length: 10 }, (_, i) => {
                        const h = 10 + i;
                        return <span key={`${h}:00`}>{String(h).padStart(2, '0')}:00</span>;
                      })}
                      {Array.from({ length: 10 }, (_, i) => {
                        const h = 10 + i;
                        return <span key={`${h}:30`}>:30</span>;
                      })}
                    </div>
                    {/* スタッフレーンを動的生成 */}
                    {staffLanes.length === 0 ? (
                      <div style={{ padding: '30px', color: 'var(--hint)', fontSize: '12px' }}>
                        データなし
                      </div>
                    ) : (
                      staffLanes.map((lane, idx) => (
                        <div key={idx} className="tt-lane">
                          <div className="tt-staff">
                            <span className="ava" style={lane.staff === null ? { boxShadow: 'var(--inset-sm)', background: 'var(--bg)', color: 'var(--acc-ink)' } : {}}>
                              {lane.staff ? lane.staff.charAt(0) : '空'}
                            </span>
                            <div>
                              <strong>{lane.staff || 'フリー枠'}</strong>
                              <span>—</span>
                            </div>
                          </div>
                          {/* ブロック表示 */}
                          {lane.reservs.map((r, blockIdx) => {
                            const startTime = new Date('start_time' in r ? r.start_time : r.datetime);
                            const endTime = 'end_time' in r && r.end_time ? new Date(r.end_time) : new Date(startTime.getTime() + 60 * 60000);
                            const startMinutes = startTime.getHours() * 60 + startTime.getMinutes() - 10 * 60;
                            const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
                            const leftPercent = Math.max(0, (startMinutes / (10 * 60)) * 100);
                            const widthPercent = Math.max(2, (durationMinutes / (10 * 60)) * 100);
                            const isGradient = 'staff_name' in r;
                            return (
                              <span
                                key={blockIdx}
                                className={`tt-block ${!isGradient ? 'lite' : ''}`}
                                style={{
                                  left: `calc(150px + (100% - 150px) * ${leftPercent / 100})`,
                                  width: `calc((100% - 150px) * ${widthPercent / 100})`,
                                }}
                              >
                                {r.customer_name || '名前未設定'}
                                <small>{'menu' in r ? r.menu : r.menu_name || 'メニュー未設定'}</small>
                              </span>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              <p className="note">＋ スタッフ枠を追加（¥3,300/月・1名）</p>
            </div>
          </section>
        )}

        {/* TODO: その他のビュー (cust, dm, int, con, plan, news, ec, rev) は段階2以降 */}
        {currentView !== 'home' && currentView !== 'booking' && (
          <section className="view on">
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--hint)' }}>
              <p style={{ fontSize: '16px', fontWeight: '700' }}>{VIEW_TITLES[currentView]} は段階2で実装予定です</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>お楽しみにお待ちください</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
