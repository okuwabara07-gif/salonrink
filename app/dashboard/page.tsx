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
  updated_at?: string | null;
}

interface CustomerRecord {
  id: string;
  salon_id: string | null;
  name: string | null;
  kana: string | null;
  phone: string | null;
  last_visit: string | null;
  visit_count: number | null;
  line_display_name: string | null;
  is_vip: boolean | null;
  needs_attention: boolean | null;
  tags: string[] | null;
  memo: string | null;
  stylist: string | null;
}

interface DMCampaign {
  id: string;
  salon_id: string | null;
  template_name: string | null;
  target_label: string | null;
  target_count: number | null;
  status: string | null;
  sent_at: string | null;
  created_at: string | null;
}

interface LineAccount {
  id: string;
  salon_id: string | null;
  line_status: string | null;
  line_bot_basic_id: string | null;
  line_connected_at: string | null;
  active: boolean | null;
}

interface HPBIntegration {
  id: string;
  salon_id: string | null;
  ical_url: string | null;
  last_synced_at: string | null;
  last_sync_status: string | null;
  active: boolean | null;
}

interface SyncStatus {
  id: string;
  salon_id: string | null;
  status: string | null;
  last_sync_at: string | null;
  last_success_at: string | null;
  consecutive_failures: number | null;
}

interface RichMenuConfig {
  id: string;
  salon_id: string | null;
  published_at: string | null;
  line_rich_menu_id: string | null;
}

interface SalonLead {
  id: string;
  line_user_id: string | null;
  type_name: string | null;
  recommend: string | null;
  display_name: string | null;
  source: string | null;
  status: string | null;
  created_at: string | null;
}

interface DiagnosisResult {
  id: string;
  salon_id: string | null;
  diagnosis_type: string | null;
  result: any;
  created_at: string | null;
  share_code: string | null;
  converted_to_karte: boolean | null;
}

interface ConsDailyAnalysis {
  id: string;
  salon_id: string | null;
  analysis_date: string | null;
  narrative: string | null;
  suggestions: any;
  kpi_snapshot: any;
}

interface Subscription {
  id: string;
  user_id: string | null;
  plan: string | null;
  status: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

interface SalonAddon {
  id: string;
  salon_id: string | null;
  addon_key: string | null;
  enabled: boolean | null;
  price: number | null;
}

interface Order {
  id: string;
  salon_id: string | null;
  items: any[] | null;
  total: number | null;
  shipping_name: string | null;
  shipping_address: string | null;
  payment_status: string | null;
  fulfillment_status: string | null;
  shipped_at: string | null;
  created_at: string | null;
}

interface Product {
  id: string;
  salon_id: string | null;
  name: string | null;
  brand: string | null;
  category: string | null;
  price: number | null;
  volume: string | null;
  image_url: string | null;
  stock: number | null;
  is_active: boolean | null;
  sort_order: number | null;
}

interface ProductReview {
  id: string;
  salon_id: string | null;
  product_id: string | null;
  customer_id: string | null;
  rating: number | null;
  body: string | null;
  status: string | null;
  created_at: string | null;
  approved_at: string | null;
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
  const [custList, setCustList] = useState<CustomerRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dmCampaigns, setDmCampaigns] = useState<DMCampaign[]>([]);
  const [lineAccount, setLineAccount] = useState<LineAccount | null>(null);
  const [hpbIntegration, setHpbIntegration] = useState<HPBIntegration | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [richMenuConfig, setRichMenuConfig] = useState<RichMenuConfig | null>(null);
  const [salonLeads, setSalonLeads] = useState<SalonLead[]>([]);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [consDailyAnalysis, setConsDailyAnalysis] = useState<ConsDailyAnalysis | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [salonAddons, setSalonAddons] = useState<SalonAddon[]>([]);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [ecTab, setEcTab] = useState('orders');
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    volume: '',
    stock: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBookingDate, setSelectedBookingDate] = useState(new Date());
  const [bookingHpb, setBookingHpb] = useState<HPBReservation[]>([]);
  const [bookingManual, setBookingManual] = useState<Reservation[]>([]);
  const [custSearchQuery, setCustSearchQuery] = useState('');
  const [hpbLastUpdated, setHpbLastUpdated] = useState<string | null>(null);

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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }
      setUser(authUser);

      const { data: salonRow } = await supabase
        .from('salons')
        .select('id, name, owner_name, email, plan')
        .eq('owner_user_id', authUser.id)
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

      const [resRes, custRes, alertRes, dmRes, lineRes, hpbRes, syncRes, richRes, leadsRes, diagRes, consRes, subRes, addonsRes, ordersRes, productsRes, reviewsRes, hpbFreshRes] = await Promise.all([
        supabase
          .from('reservations')
          .select('id, salon_id, customer_name, customer_line_id, datetime, menu, status, line_user_id')
          .eq('salon_id', salonRow.id)
          .gte('datetime', startDate.toISOString())
          .lte('datetime', endDate.toISOString())
          .order('datetime', { ascending: true }),
        supabase
          .from('customers')
          .select('id, salon_id, name, kana, phone, last_visit, visit_count, line_display_name, is_vip, needs_attention, tags, memo, stylist')
          .eq('salon_id', salonRow.id),
        supabase
          .from('alerts')
          .select('id, message, type, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('dm_campaigns')
          .select('id, salon_id, template_name, target_label, target_count, status, sent_at, created_at')
          .eq('salon_id', salonRow.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('line_accounts')
          .select('id, salon_id, line_status, line_bot_basic_id, line_connected_at, active')
          .eq('salon_id', salonRow.id)
          .maybeSingle(),
        supabase
          .from('hpb_integrations')
          .select('id, salon_id, ical_url, last_synced_at, last_sync_status, active')
          .eq('salon_id', salonRow.id)
          .maybeSingle(),
        supabase
          .from('sync_status')
          .select('id, salon_id, status, last_sync_at, last_success_at, consecutive_failures')
          .eq('salon_id', salonRow.id)
          .maybeSingle(),
        supabase
          .from('rich_menu_configs')
          .select('id, salon_id, published_at, line_rich_menu_id')
          .eq('salon_id', salonRow.id)
          .maybeSingle(),
        supabase
          .from('salon_leads')
          .select('id, line_user_id, type_name, recommend, display_name, source, status, created_at')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('diagnosis_results')
          .select('id, salon_id, diagnosis_type, result, created_at, share_code, converted_to_karte')
          .eq('salon_id', salonRow.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('cons_daily_analysis')
          .select('id, salon_id, analysis_date, narrative, suggestions, kpi_snapshot')
          .eq('salon_id', salonRow.id)
          .order('analysis_date', { ascending: false })
          .limit(1),
        supabase
          .from('subscriptions')
          .select('id, user_id, plan, status, trial_ends_at, current_period_end, cancel_at_period_end')
          .eq('user_id', authUser.id)
          .maybeSingle(),
        supabase
          .from('salon_addons')
          .select('id, salon_id, addon_key, enabled, price')
          .eq('salon_id', salonRow.id),
        supabase
          .from('orders')
          .select('id, salon_id, items, total, shipping_name, shipping_address, payment_status, fulfillment_status, shipped_at, created_at')
          .eq('salon_id', salonRow.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('id, salon_id, name, brand, category, price, volume, image_url, stock, is_active, sort_order')
          .eq('salon_id', salonRow.id)
          .order('sort_order', { ascending: true }),
        supabase
          .from('product_reviews')
          .select('id, salon_id, product_id, customer_id, rating, body, status, created_at, approved_at')
          .eq('salon_id', salonRow.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('hpb_reservations')
          .select('updated_at')
          .eq('salon_id', salonRow.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      setReservations((resRes.data as Reservation[]) ?? []);
      setCustList((custRes.data as CustomerRecord[]) ?? []);
      setAlerts((alertRes.data as Alert[]) ?? []);
      setDmCampaigns((dmRes.data as DMCampaign[]) ?? []);
      setLineAccount((lineRes.data as LineAccount) || null);
      setHpbIntegration((hpbRes.data as HPBIntegration) || null);
      setSyncStatus((syncRes.data as SyncStatus) || null);
      setRichMenuConfig((richRes.data as RichMenuConfig) || null);
      setSalonLeads((leadsRes.data as SalonLead[]) ?? []);
      setDiagnosisResults((diagRes.data as DiagnosisResult[]) ?? []);
      setConsDailyAnalysis((consRes.data as ConsDailyAnalysis[])?.[0] || null);
      setSubscription((subRes.data as Subscription) || null);
      setSalonAddons((addonsRes.data as SalonAddon[]) ?? []);
      setOrders((ordersRes.data as Order[]) ?? []);
      setProducts((productsRes.data as Product[]) ?? []);
      setProductReviews((reviewsRes.data as ProductReview[]) ?? []);
      setHpbLastUpdated((hpbFreshRes.data as any)?.updated_at ?? null);
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
          .select('id, salon_id, start_time, end_time, staff_name, menu_name, customer_name, status, source, updated_at')
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
      const hpbData = h.data as HPBReservation[];
      if (hpbData && hpbData.length > 0) {
        const maxUpdated = hpbData.reduce((max, r) => {
          const rUpdated = r.updated_at ? new Date(r.updated_at).getTime() : 0;
          const maxTime = max ? new Date(max).getTime() : 0;
          return rUpdated > maxTime ? r.updated_at! : max;
        }, null as string | null);
        setHpbLastUpdated(maxUpdated);
      } else {
        const { data: allHpbData } = await supabase
          .from('hpb_reservations')
          .select('updated_at')
          .eq('salon_id', salon.id)
          .order('updated_at', { ascending: false })
          .limit(1);
        if (allHpbData && allHpbData.length > 0) {
          setHpbLastUpdated((allHpbData[0] as any).updated_at);
        }
      }
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

  const getHpbFreshness = (lastUpdated: string | null) => {
    if (!lastUpdated) return { daysAgo: null, isStale: false, isWarning: false };
    const updated = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - updated.getTime();
    const daysAgo = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    return {
      daysAgo,
      isStale: daysAgo >= 2,
      isWarning: daysAgo >= 2,
    };
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
                <div className="lbl">総顧客数</div>
                <div className="val">
                  {custList.length}
                  <small> 人</small>
                </div>
                <div className="delta">—</div>
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
                  <div>この日の予約はありません</div>
                  {(() => {
                    const freshness = getHpbFreshness(hpbLastUpdated);
                    if (freshness.isWarning && freshness.daysAgo !== null) {
                      return (
                        <div style={{ marginTop: '12px', fontSize: '11px', color: '#d97706' }}>
                          ※HPB同期が{freshness.daysAgo}日前から停止している可能性があります。設定→連携をご確認ください
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : staffLanes.length === 1 ? (
                /* 1レーン（フリー枠のみ）→ リスト表示 */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                  {selectedDayReservations
                    .sort((a, b) => new Date('start_time' in a ? a.start_time : a.datetime).getTime() - new Date('start_time' in b ? b.start_time : b.datetime).getTime())
                    .map(r => {
                      const startTime = new Date('start_time' in r ? r.start_time : r.datetime);
                      return (
                        <div key={r.id} className="tl-row">
                          <span className="t hand">{formatHHMM(startTime)}</span>
                          <div>
                            <strong>{r.customer_name || '名前未設定'}</strong>
                            <span className="m">{'menu' in r ? r.menu : r.menu_name || 'メニュー未設定'}</span>
                          </div>
                          <span className="st">{r.status === 'confirmed' ? '確定' : 'リクエスト'}</span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                /* 複数レーン → タイムテーブル表示 */
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
                    {staffLanes.map((lane, idx) => (
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
                    ))}
                  </div>
                </div>
              )}
              <p className="note">＋ スタッフ枠を追加（¥3,300/月・1名）</p>
            </div>
          </section>
        )}

        {/* 顧客ビュー */}
        {currentView === 'cust' && (
          <section className="view on">
            <div className="v-head">
              <h2>顧客一覧</h2>
              <span className="en hand">Customers</span>
              <span className="right">{custList.length}名</span>
            </div>
            <div className="chip-row" style={{ marginBottom: '18px' }}>
              <button className="chip on">すべて<span className="c">{custList.length}</span></button>
              <button className="chip">直近30日<span className="c">—</span></button>
              <button className="chip">60日休眠<span className="c">—</span></button>
              <button className="chip">今月誕生月<span className="c">—</span></button>
            </div>
            <div className="th-row">
              <span>お客様</span>
              <span>タグ</span>
              <span>来店回数</span>
              <span>前回来店</span>
              <span>単価</span>
            </div>
            {custList.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--hint)', fontSize: '13px' }}>
                顧客データはまだありません
              </div>
            ) : (
              <div className="cust-table">
                {custList
                  .filter(c => !custSearchQuery || (c.name && c.name.includes(custSearchQuery)) || (c.kana && c.kana.includes(custSearchQuery)))
                  .map(c => {
                    const lastVisitDaysAgo = c.last_visit
                      ? Math.floor((new Date().getTime() - new Date(c.last_visit).getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    return (
                      <div key={c.id} className="cust-row">
                        <div className="cust-id">
                          <span className="ava">{c.name?.charAt(0) || '—'}</span>
                          <div>
                            <strong>{c.name || '名前未設定'}</strong>
                            <span>{c.line_display_name ? 'LINE連携済み' : '—'}</span>
                          </div>
                        </div>
                        <div className="cust-tags">
                          {c.is_vip && <em>VIP</em>}
                          {c.needs_attention && <em>要対応</em>}
                          {c.tags && c.tags.length > 0 && c.tags.slice(0, 2).map((t, i) => <em key={i}>{t}</em>)}
                        </div>
                        <span className="cust-num">
                          <b>{c.visit_count ?? '—'}</b> 回
                        </span>
                        <span className="cust-num">{lastVisitDaysAgo !== null ? `${lastVisitDaysAgo}日前` : '—'}</span>
                        <span className="cust-num">—</span>
                      </div>
                    );
                  })}
              </div>
            )}
            <p className="note">※行をタップで詳細(カルテ)へ(実装予定)。単価は集計未実装。</p>
          </section>
        )}

        {/* DM配信ビュー */}
        {currentView === 'dm' && (
          <section className="view on">
            <div className="v-head">
              <h2>DM配信</h2>
              <span className="en hand">Campaigns</span>
            </div>
            <div className="dm-grid">
              <div className="card">
                <div className="v-head" style={{ margin: '0' }}>
                  <h2>テンプレート選択</h2>
                  <span className="en hand">Template</span>
                </div>
                <div className="dm-tpls">
                  {['来店リマインド', '空き枠埋め（平日特典）', '来店御礼', 'お誕生月特典', 'キャンペーン告知', 'カスタム'].map((tpl, i) => (
                    <button key={i} className={`dm-tpl ${i === 0 ? 'on' : ''}`}>
                      <strong>{tpl}</strong>
                    </button>
                  ))}
                </div>
                <div className="dm-seg">
                  <div className="v-head" style={{ margin: '0 0 12px' }}>
                    <h2>配信対象を絞り込み</h2>
                    <span className="en hand">Segment</span>
                  </div>
                  <div className="chip-row">
                    <button className="chip">全顧客<span className="c">{custList.length}</span></button>
                    <button className="chip">直近30日来店<span className="c">—</span></button>
                    <button className="chip on">60日休眠<span className="c">—</span></button>
                    <button className="chip">90日以上休眠<span className="c">—</span></button>
                    <button className="chip">今月誕生月<span className="c">—</span></button>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="v-head" style={{ margin: '0' }}>
                  <h2>プレビューと配信</h2>
                  <span className="en hand">Preview</span>
                </div>
                <div className="dm-preview">
                  <div className="bub">来店ありがとうございます。前回のご来店から63日が経過しました。メンテナンスのタイミングです。</div>
                </div>
                <div className="dm-sum">
                  <div className="r">
                    <span>配信対象</span>
                    <b>60日休眠</b>
                  </div>
                  <div className="r">
                    <span>対象人数</span>
                    <b>—</b>
                  </div>
                  <div className="r">
                    <span>配信媒体</span>
                    <b>LINE公式</b>
                  </div>
                </div>
                <button className="dm-send" disabled style={{ opacity: 0.6 }}>
                  配信する → （準備中）
                </button>
                <p className="note">送信処理は実装予定です。</p>
              </div>
            </div>
          </section>
        )}

        {/* 連携ビュー */}
        {currentView === 'int' && (
          <section className="view on">
            <div className="v-head">
              <h2>連携設定</h2>
              <span className="en hand">Integrations</span>
              <span className="right">
                {[lineAccount?.active, hpbIntegration?.active, richMenuConfig?.published_at].filter(Boolean).length} 接続中
              </span>
            </div>
            <div className="int-grid">
              {/* LINE連携 */}
              <div className="int-card">
                <div className="int-head">
                  <span className="int-ic">L</span>
                  <div>
                    <strong>LINE連携</strong>
                    <span>予約・リマインド・フォローアップ</span>
                  </div>
                </div>
                <div className="int-foot">
                  <span className="int-st" style={lineAccount?.active ? { color: 'var(--green)' } : {}}>
                    ● {lineAccount?.active ? '接続中' : '未接続'}
                  </span>
                  <button className="int-go">設定を開く →</button>
                </div>
              </div>

              {/* HPB連携 */}
              <div className="int-card">
                <div className="int-head">
                  <span className="int-ic">H</span>
                  <div>
                    <strong>ホットペッパー連携</strong>
                    <span>外部予約サイトの自動同期</span>
                  </div>
                </div>
                <div style={{ padding: '12px 0', fontSize: '12px', color: 'var(--hint)' }}>
                  {hpbLastUpdated ? (
                    (() => {
                      const freshness = getHpbFreshness(hpbLastUpdated);
                      const lastDate = new Date(hpbLastUpdated);
                      const dateStr = `${lastDate.getFullYear()}/${lastDate.getMonth() + 1}/${lastDate.getDate()}`;
                      return (
                        <div>
                          最終取込: {dateStr} （{freshness.daysAgo}日前）
                        </div>
                      );
                    })()
                  ) : (
                    <div>未取込</div>
                  )}
                </div>
                <div className="int-foot">
                  {(() => {
                    const freshness = getHpbFreshness(hpbLastUpdated);
                    return (
                      <span className="int-st" style={freshness.isWarning ? { color: '#d97706' } : { color: 'var(--green)' }}>
                        ● {freshness.isWarning ? '⚠ 要確認（同期停止の可能性）' : '接続中'}
                      </span>
                    );
                  })()}
                  <button className="int-go">接続する →</button>
                </div>
              </div>

              {/* リッチメニュー */}
              <div className="int-card">
                <div className="int-head">
                  <span className="int-ic">R</span>
                  <div>
                    <strong>リッチメニュー設定</strong>
                    <span>LINEメニューをカスタマイズ</span>
                  </div>
                </div>
                <div className="int-foot">
                  <span className="int-st" style={richMenuConfig?.published_at ? { color: 'var(--green)' } : {}}>
                    ● {richMenuConfig?.published_at ? '公開中' : '未接続'}
                  </span>
                  <button className="int-go">設定する →</button>
                </div>
              </div>

              {/* Googleカレンダー（未対応） */}
              <div className="int-card">
                <div className="int-head">
                  <span className="int-ic">G</span>
                  <div>
                    <strong>Googleカレンダー</strong>
                    <span>スタッフ予定の双方向同期</span>
                  </div>
                </div>
                <div className="int-foot">
                  <span className="int-st">● 未対応</span>
                  <button className="int-go" disabled style={{ opacity: 0.5 }}>
                    準備中
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* コンシェルジュビュー */}
        {currentView === 'con' && (
          <section className="view on">
            <div className="v-head">
              <h2>コンシェルジュ</h2>
              <span className="en hand">Concierge</span>
            </div>

            {/* KPI 3枚 */}
            <div className="kpis" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="kpi">
                <div className="lbl">AIカルテ作成数</div>
                <div className="val">
                  {diagnosisResults.length}
                  <small> 件</small>
                </div>
                <div className="delta">今月 —件</div>
              </div>
              <div className="kpi">
                <div className="lbl">診断 完了数</div>
                <div className="val">
                  {diagnosisResults.filter(d => d.converted_to_karte).length}
                  <small> 件</small>
                </div>
                <div className="delta">完了率 —%</div>
              </div>
              <div className="kpi">
                <div className="lbl">Warm Lead</div>
                <div className="val">
                  {salonLeads.length}
                  <small> 件</small>
                </div>
                <div className="delta">最新 —</div>
              </div>
            </div>

            {/* 本日の分析 */}
            <div className="card" style={{ marginTop: '18px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>本日の分析</h3>
              {!consDailyAnalysis ? (
                <div style={{ padding: '20px', color: 'var(--hint)', fontSize: '13px' }}>
                  本日の分析はまだ生成されていません
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '12.5px', lineHeight: '1.6', marginBottom: '12px', color: 'var(--ink)' }}>
                    {consDailyAnalysis.narrative || '—'}
                  </p>
                  {consDailyAnalysis.suggestions && (
                    <div style={{ fontSize: '12px', color: 'var(--sub)', marginTop: '8px' }}>
                      <strong>提案:</strong> {Array.isArray(consDailyAnalysis.suggestions) ? consDailyAnalysis.suggestions.slice(0, 2).join(' / ') : '—'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Warm Lead 一覧 */}
            <div className="card" style={{ marginTop: '18px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Warm Lead</h3>
              {salonLeads.length === 0 ? (
                <div style={{ padding: '20px', color: 'var(--hint)', fontSize: '13px' }}>
                  まだ warm lead はありません
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {salonLeads.slice(0, 5).map(lead => (
                    <div key={lead.id} style={{ padding: '10px 12px', borderRadius: '12px', boxShadow: 'var(--raise-sm)', fontSize: '12px' }}>
                      <strong>{lead.display_name || lead.line_user_id?.slice(0, 8) || '—'}</strong>
                      <div style={{ fontSize: '10px', color: 'var(--hint)', marginTop: '2px' }}>
                        {lead.type_name} · {lead.source} · {lead.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="note">※経営ダッシュボードのサマリー。詳細は各ビューを参照ください。</p>
          </section>
        )}

        {/* プランビュー */}
        {currentView === 'plan' && (
          <section className="view on">
            <div className="v-head">
              <h2>プラン管理</h2>
              <span className="en hand">Plan</span>
              <span className="right">
                現在: {subscription?.plan || salon?.plan || '—'} / {subscription?.status || '—'}
                {subscription?.current_period_end && ` / ${new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}まで`}
              </span>
            </div>
            <div className="card">
              <div className="plan-grid">
                {/* Light プラン */}
                <div className={`plan-opt ${subscription?.plan === 'light' ? 'cur' : ''}`}>
                  {subscription?.plan === 'light' && <span className="b">現在</span>}
                  <strong>Light</strong>
                  <div className="pr">
                    ¥1,980
                    <small>/月</small>
                  </div>
                  <p>ソロオーナー向け</p>
                </div>

                {/* Standard プラン */}
                <div className={`plan-opt ${subscription?.plan === 'standard' ? 'cur' : ''}`}>
                  {subscription?.plan === 'standard' && <span className="b">現在</span>}
                  <strong>Standard</strong>
                  <div className="pr">
                    ¥2,980
                    <small>/月</small>
                  </div>
                  <p>2〜5名のサロン向け</p>
                </div>

                {/* Professional プラン */}
                <div className={`plan-opt ${subscription?.plan === 'professional' ? 'cur' : ''}`}>
                  {subscription?.plan === 'professional' && <span className="b">現在</span>}
                  <strong>Professional</strong>
                  <div className="pr">
                    ¥4,980
                    <small>/月</small>
                  </div>
                  <p>6名以上のサロン向け</p>
                </div>
              </div>
              <p className="note">税込・初期費用0円。プラン変更は次回請求から適用されます。</p>
            </div>

            {/* サブスクリプション状態 */}
            {subscription && (
              <div className="card" style={{ marginTop: '18px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>契約状態</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>プラン:</span>
                    <strong>{subscription.plan || '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ステータス:</span>
                    <strong>{subscription.status === 'active' ? 'アクティブ' : subscription.status === 'canceled' ? '解約済み' : subscription.status || '—'}</strong>
                  </div>
                  {subscription.current_period_end && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>利用可能期間:</span>
                      <strong>{new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}まで</strong>
                    </div>
                  )}
                  {subscription.trial_ends_at && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>トライアル終了:</span>
                      <strong>{new Date(subscription.trial_ends_at).toLocaleDateString('ja-JP')}</strong>
                    </div>
                  )}
                  {subscription.cancel_at_period_end && (
                    <div style={{ color: 'var(--hint)' }}>
                      ⚠️ 現在の期間終了後、解約予定
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* アドオン */}
            {salonAddons.length > 0 && (
              <div className="card" style={{ marginTop: '18px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>アドオン</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {salonAddons.map(addon => (
                    <div key={addon.id} style={{ padding: '10px 12px', borderRadius: '12px', boxShadow: 'var(--raise-sm)', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{addon.addon_key} {addon.enabled ? '✓' : '—'}</span>
                      <strong>¥{addon.price?.toLocaleString()}/月</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* お知らせビュー */}
        {currentView === 'news' && (
          <section className="view on">
            <div className="v-head">
              <h2>お知らせ</h2>
              <span className="en hand">News</span>
            </div>
            <div className="chip-row" style={{ marginBottom: '18px' }}>
              <button className="chip on">すべて</button>
              <button className="chip">新機能</button>
              <button className="chip">ヒント</button>
              <button className="chip">メンテ</button>
            </div>
            <div className="news-big">
              {alerts.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--hint)', fontSize: '13px' }}>
                  お知らせはありません
                </div>
              ) : (
                alerts.map(a => (
                  <div key={a.id} className="card">
                    <div className="news-row" style={{ boxShadow: 'none', padding: '0' }}>
                      <div className="meta">
                        <span className="b">{a.type || '情報'}</span>
                        {a.created_at && new Date(a.created_at).toLocaleDateString('ja-JP')}
                      </div>
                      <strong style={{ fontSize: '14.5px' }}>{a.message}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* 店販ECビュー */}
        {currentView === 'ec' && (
          <section className="view on">
            <div className="v-head">
              <h2>店販EC</h2>
              <span className="en hand">Store</span>
            </div>
            <div className="chip-row" style={{ marginBottom: '18px' }}>
              <button className={`chip ${ecTab === 'orders' ? 'on' : ''}`} onClick={() => setEcTab('orders')}>
                注文管理<span className="c">{orders.length}</span>
              </button>
              <button className={`chip ${ecTab === 'products' ? 'on' : ''}`} onClick={() => setEcTab('products')}>
                商品一覧<span className="c">{products.length}</span>
              </button>
              <button className={`chip ${ecTab === 'register' ? 'on' : ''}`} onClick={() => setEcTab('register')}>
                ＋ 商品を登録
              </button>
            </div>

            {/* 注文管理 */}
            {ecTab === 'orders' && (
              <div>
                {orders.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--hint)', fontSize: '13px' }}>
                    注文はありません
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.map(o => (
                      <div key={o.id} className="order-row">
                        <span className="th">📦</span>
                        <div>
                          <strong>{(o.items as any[])?.[0]?.name || '商品未設定'}</strong>
                          <span className="m">
                            {o.shipping_name || '名前未設定'} · {o.created_at && new Date(o.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <span className="pr">¥{o.total?.toLocaleString() || '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="note">※決済・発送処理は Stripe 連携で実装。</p>
              </div>
            )}

            {/* 商品一覧 */}
            {ecTab === 'products' && (
              <div>
                {products.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--hint)', fontSize: '13px' }}>
                    商品がありません
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {products.map(p => (
                      <div key={p.id} className="prod-row">
                        <span className="th">🛍</span>
                        <div>
                          <strong>{p.name}</strong>
                          <span className="m">{p.category} · 在庫{p.stock || 0}</span>
                        </div>
                        <span className="pr">¥{p.price?.toLocaleString()}</span>
                        <span className="st" style={p.is_active ? { color: 'var(--green)' } : {}}>
                          {p.is_active ? '公開中' : '非公開'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="note">※行をタップで編集へ(実装予定)。</p>
              </div>
            )}

            {/* 商品登録 */}
            {ecTab === 'register' && (
              <div className="f-grid">
                <div className="card">
                  <label className="f-label">商品名</label>
                  <input
                    className="f-input"
                    type="text"
                    placeholder="例：コンシェルジュ ヘアオイル 100mL"
                    value={newProductForm.name}
                    onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  />
                  <div className="f-row">
                    <div>
                      <label className="f-label">ブランド</label>
                      <input
                        className="f-input"
                        type="text"
                        value={newProductForm.brand}
                        onChange={e => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="f-label">カテゴリ</label>
                      <select
                        className="f-select"
                        value={newProductForm.category}
                        onChange={e => setNewProductForm({ ...newProductForm, category: e.target.value })}
                      >
                        <option>ヘアケア</option>
                        <option>スカルプ</option>
                        <option>スタイリング</option>
                        <option>雑貨</option>
                      </select>
                    </div>
                  </div>
                  <div className="f-row">
                    <div>
                      <label className="f-label">販売価格（税込）</label>
                      <span className="f-unit">
                        <input
                          className="f-input"
                          type="number"
                          value={newProductForm.price}
                          onChange={e => setNewProductForm({ ...newProductForm, price: e.target.value })}
                          placeholder="3520"
                        />
                        <span className="u">円</span>
                      </span>
                    </div>
                    <div>
                      <label className="f-label">在庫数</label>
                      <span className="f-unit">
                        <input
                          className="f-input"
                          type="number"
                          value={newProductForm.stock}
                          onChange={e => setNewProductForm({ ...newProductForm, stock: e.target.value })}
                          placeholder="24"
                        />
                        <span className="u">個</span>
                      </span>
                    </div>
                  </div>
                  <label className="f-label">容量（任意）</label>
                  <input
                    className="f-input"
                    type="text"
                    placeholder="100mL"
                    value={newProductForm.volume}
                    onChange={e => setNewProductForm({ ...newProductForm, volume: e.target.value })}
                  />
                </div>
                <div>
                  <div className="card" style={{ marginTop: '0' }}>
                    <label className="f-label">商品画像（最大5枚）</label>
                    <div className="f-photos">
                      <button className="f-photo-add">
                        <span className="plus">＋</span>メイン
                      </button>
                      <button className="f-photo-add">
                        <span className="plus">＋</span>追加
                      </button>
                      <button className="f-photo-add">
                        <span className="plus">＋</span>追加
                      </button>
                    </div>
                    <p className="f-photo-hint">正方形・1200px以上推奨。</p>
                  </div>
                  <div className="card" style={{ marginTop: '16px' }}>
                    <div className="f-toggle-row">
                      <div>
                        <strong>ストアに公開</strong>
                        <span>LINEミニアプリの商品一覧に表示</span>
                      </div>
                      <button
                        className={`f-sw ${newProductForm.is_active ? 'on' : ''}`}
                        onClick={() => setNewProductForm({ ...newProductForm, is_active: !newProductForm.is_active })}
                      />
                    </div>
                    <button
                      className="dm-send"
                      onClick={async () => {
                        if (!newProductForm.name || !newProductForm.price) {
                          alert('商品名と価格は必須です');
                          return;
                        }
                        const supabase = createClient();
                        const { error } = await supabase.from('products').insert({
                          salon_id: salon!.id,
                          name: newProductForm.name,
                          brand: newProductForm.brand || null,
                          category: newProductForm.category || null,
                          price: parseInt(newProductForm.price),
                          volume: newProductForm.volume || null,
                          stock: parseInt(newProductForm.stock) || 0,
                          is_active: newProductForm.is_active,
                        });
                        if (error) {
                          alert('登録に失敗しました: ' + error.message);
                        } else {
                          alert('商品を登録しました');
                          setNewProductForm({ name: '', brand: '', category: '', price: '', volume: '', stock: '', is_active: true });
                          loadAll();
                        }
                      }}
                    >
                      この内容で登録する
                    </button>
                    <p className="note">※画像アップロードは実装予定。</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 口コミ承認ビュー */}
        {currentView === 'rev' && (
          <section className="view on">
            <div className="v-head">
              <h2>口コミ承認</h2>
              <span className="en hand">Reviews</span>
            </div>
            {productReviews.length === 0 ? (
              <div className="empty">承認待ちの口コミはありません。<br />新しい口コミが届くとここに表示されます。</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {productReviews.map(r => (
                  <div key={r.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <strong>⭐ {r.rating} / 5</strong>
                        <p style={{ fontSize: '12px', color: 'var(--hint)', margin: '4px 0 0' }}>
                          {r.created_at && new Date(r.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '4px 11px',
                          borderRadius: '999px',
                          boxShadow: 'var(--raise-sm)',
                          color: r.status === 'approved' ? 'var(--green)' : 'var(--hint)',
                        }}
                      >
                        {r.status === 'approved' ? '✓ 承認済み' : '待機中'}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', margin: '0 0 8px' }}>{r.body}</p>
                    {r.status !== 'approved' && (
                      <button
                        className="cta-btn"
                        style={{ width: 'auto' }}
                        onClick={async () => {
                          const supabase = createClient();
                          const { error } = await supabase
                            .from('product_reviews')
                            .update({ status: 'approved', approved_at: new Date().toISOString() })
                            .eq('id', r.id);
                          if (error) {
                            alert('承認に失敗しました: ' + error.message);
                          } else {
                            alert('口コミを承認しました');
                            loadAll();
                          }
                        }}
                      >
                        承認する
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TODO: すべてのビュー実装完了 */}
        {currentView !== 'home' && currentView !== 'booking' && currentView !== 'cust' && currentView !== 'dm' && currentView !== 'int' && currentView !== 'con' && currentView !== 'plan' && currentView !== 'news' && currentView !== 'ec' && currentView !== 'rev' && (
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
