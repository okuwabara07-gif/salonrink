/**
 * srkMockData.ts — Typed mock data for SalonRink prototype views.
 *
 * 注: 本番では Supabase クエリに置換予定。Phase 3 の予約画面では
 * すでに `hpb_reservations` テーブルから実データ取得する経路がある。
 * このファイルはホーム画面・顧客・カルテ・DM配信の暫定データ用。
 */

/* ─── Types ─────────────────────────────────────────────────────────── */

export type ServiceKey = 'C' | 'L' | 'P' | 'T' | 'H' | 'S';

export interface Service {
  label: string;
  short: string;
  color: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  color: string;
  initial: string;
}

export interface AddableStaff extends Staff {
  monthly: number;
}

export interface Booking {
  id: string;
  staff: string;
  start: number;       // minutes from midnight
  end: number;
  customer: string;
  ageBand: string;
  tags: ServiceKey[];
  status: 'confirmed' | 'tentative';
  repeat: number;
  amount: number;
  isNew?: boolean;
  lastVisit?: string;
  lineDigest?: string;
  note?: string;
}

export interface MessageItem {
  id: string;
  from: string;
  preview: string;
  time: string;
  unread: boolean;
}

export interface CustomerSegment {
  label: string;
  value: number;
  color: string;
}

export interface Todo {
  id: string;
  label: string;
  urgent: boolean;
  done: boolean;
}

export interface RecentCustomer {
  id: string;
  name: string;
  last: string;
  visits: number;
  fav: string;
  isNew?: boolean;
}

export interface ReachoutCandidate {
  id: string;
  name: string;
  daysSince: number;
  cycle: number;
  reason: string;
  last: string;
  fav: ServiceKey[];
  repeat: number;
  score: number;
  ageBand: string;
  avgSpend: number;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  want: string;
  service: ServiceKey[];
  regAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DmRule {
  id: string;
  name: string;
  trigger: string;
  channel: 'LINE' | 'メール' | 'SMS';
  status: 'on' | 'paused';
  sent: number;
  opened: number;
  lastEdit: string;
}

export interface DmLogEntry {
  id: string;
  when: string;
  to: string;
  rule: string;
  channel: 'LINE' | 'メール' | 'SMS';
  state: 'opened' | 'delivered';
}

export interface ChartVisit {
  date: string;
  staff: string;
  service: ServiceKey[];
  amount: number;
  cut: string | null;
  color: string | null;
  perm: string | null;
  memo: string;
  photoTags: string[];
}

export interface ChartRecord {
  name: string;
  kana: string;
  ageBand: string;
  gender: string;
  phone: string;
  mail: string;
  birthday: string;
  firstVisit: string;
  totalVisits: number;
  totalSpend: number;
  avgCycle: number;
  daysSince: number;
  nextSuggest: string;
  preferences: string;
  allergy: string;
  visits: ChartVisit[];
}

/* ─── Constants ─────────────────────────────────────────────────────── */

export const OWNER: Staff = {
  id: 's1', name: 'テスト 太郎', role: 'オーナー', color: '#b89564', initial: '太',
};
export const STAFF: Staff[] = [OWNER];

export const ADDABLE_STAFF: AddableStaff[] = [
  { id: 's2', name: 'スタッフ枠 ②', role: '空き', color: '#6b2d3a', initial: '②', monthly: 3300 },
  { id: 's3', name: 'スタッフ枠 ③', role: '空き', color: '#3d5a6b', initial: '③', monthly: 3300 },
  { id: 's4', name: 'スタッフ枠 ④', role: '空き', color: '#5a6b3c', initial: '④', monthly: 3300 },
];

export const SERVICES: Record<ServiceKey, Service> = {
  C: { label: 'カット',           short: 'C', color: '#b89564' },
  L: { label: 'カラー',           short: 'L', color: '#a85a3e' },
  P: { label: 'パーマ',           short: 'P', color: '#6b2d3a' },
  T: { label: 'トリートメント',   short: 'T', color: '#5a6b3c' },
  H: { label: 'ヘッドスパ',       short: 'H', color: '#3d5a6b' },
  S: { label: '白髪染め',         short: 'S', color: '#7a4a2b' },
};

export const todayBookings: Booking[] = [
  { id:'b1', staff:'s1', start: 10*60,    end: 11*60+30, customer:'菊地 照子', ageBand:'60s', tags:['L','S'], status:'confirmed', repeat:8,  amount:9800,
    lastVisit:'2026/03/15（60日前）',
    lineDigest:'白髪が気になってきました。前回と同じ色味でお願いします。仕上がりは少し明るめにしてもらえると嬉しいです。' },
  { id:'b2', staff:'s1', start: 11*60+45, end: 12*60+45, customer:'井芹 知美', ageBand:'40s', tags:['C','T'], status:'confirmed', repeat:3,  amount:7600,
    lastVisit:'2026/03/02（73日前）',
    lineDigest:'前髪を短めにしたいです。傷みが気になるのでトリートメントも合わせて。所要時間1時間以内希望。' },
  { id:'b3', staff:'s1', start: 13*60,    end: 14*60+30, customer:'青山 真理', ageBand:'40s', tags:['C','H'], status:'confirmed', repeat:4,  amount:9500,
    lastVisit:'2026/05/11（3日前）',
    lineDigest:'ヘッドスパを追加でお願いできますか？最近肩こりがひどくて。カットはいつも通り肩下5cmで。' },
  { id:'b4', staff:'s1', start: 14*60+45, end: 16*60,    customer:'矢野 玲子', ageBand:'30s', tags:['L'],     status:'confirmed', repeat:1,  amount:6800, isNew:true,
    lastVisit:'初回',
    lineDigest:'はじめての利用です。明るめのベージュにしたいです。写真添付しました。傷みは少なめだと思います。アレルギーなし。' },
  { id:'b5', staff:'s1', start: 16*60+15, end: 17*60+15, customer:'柳田 友香', ageBand:'50s', tags:['P','L'], status:'tentative', repeat:5,  amount:14800,
    lastVisit:'2026/03/20（55日前）',
    lineDigest:'パーマとカラー両方お願いします。柔らかめのウェーブで。前回より少し短くしたいです。' },
  { id:'b6', staff:'s1', start: 17*60+30, end: 18*60+30, customer:'飯貝 佳奈', ageBand:'20s', tags:['C'],     status:'confirmed', repeat:1,  amount:5200, isNew:true,
    lastVisit:'初回',
    lineDigest:'はじめまして。鎖骨くらいの長さにしたいです。前髪は眉ぎりぎりで。お話は控えめが嬉しいです。' },
];

export const messages: MessageItem[] = [
  { id:'m1', from:'青山 真理', preview:'ヘッドスパも追加できますか？', time:'08:42', unread:true },
  { id:'m2', from:'飯貝 佳奈', preview:'初めての予約です。よろしくお願い…', time:'昨日', unread:true },
  { id:'m3', from:'矢野 玲子', preview:'明日の予約、確認しました。', time:'昨日', unread:false },
];

export const weekTrend: number[]    = [3,5,4,6,8,7,5, 6,4,7,9,8,10,12];
export const revenueTrend: number[] = [42,55,48,61,72,68,58, 62,49,71,84,79,92,108]; // ×1000円

export const customerSegments: CustomerSegment[] = [
  { label: '新規',          value: 12, color: '#b89564' },
  { label: '定期 (3+回)',   value: 48, color: '#6b2d3a' },
  { label: '休眠 (90日+)',  value: 23, color: '#8a7e72' },
];

export const todos: Todo[] = [
  { id:'t1', label:'青山様にヘッドスパ可否を返信', urgent:true,  done:false },
  { id:'t2', label:'5月の来店促進DMを送信',         urgent:false, done:false },
  { id:'t3', label:'在庫: カラー剤8L 発注確認',     urgent:false, done:false },
  { id:'t4', label:'明日のシフト確認',              urgent:false, done:true  },
];

export const recentCustomers: RecentCustomer[] = [
  { id:'c1', name:'青山 真理', last:'3日前', visits:4,  fav:'カット+ヘッドスパ' },
  { id:'c2', name:'矢野 玲子', last:'本日',   visits:1, fav:'カラー',     isNew:true },
  { id:'c3', name:'浅野 節子', last:'本日',   visits:12, fav:'白髪染め' },
  { id:'c4', name:'柳田 友香', last:'本日',   visits:5,  fav:'パーマ+カラー' },
];

export const reachoutCandidates: ReachoutCandidate[] = [
  { id:'r1', name:'森本 由紀',  daysSince: 96,  cycle: 60, reason:'休眠（90日超）',  last:'2月8日',  fav:['L','S'], repeat:14, score: 92, ageBand:'50s', avgSpend:9800 },
  { id:'r2', name:'吉崎 真樹子', daysSince: 58, cycle: 56, reason:'カット周期',       last:'3月17日', fav:['C','T'], repeat:7,  score: 88, ageBand:'40s', avgSpend:7600 },
  { id:'r3', name:'近藤 ひろみ', daysSince: 71, cycle: 70, reason:'カラー周期',       last:'3月4日',  fav:['L'],     repeat:9,  score: 85, ageBand:'50s', avgSpend:8400 },
  { id:'r4', name:'西川 美穂',   daysSince: 124, cycle: 90, reason:'休眠（90日超）', last:'1月11日', fav:['P'],     repeat:3,  score: 76, ageBand:'30s', avgSpend:12000 },
  { id:'r5', name:'山口 さやか', daysSince: 49, cycle: 45, reason:'カット周期',       last:'3月26日', fav:['C'],     repeat:5,  score: 72, ageBand:'30s', avgSpend:6200 },
];

export const waitlist: WaitlistEntry[] = [
  { id:'w1', name:'青山 真理',  want:'本日 / 14:00〜16:00', service:['C','H'], regAt:'08:42', priority:'high'   },
  { id:'w2', name:'飯貝 佳奈',  want:'本日 / 終日',         service:['C'],     regAt:'昨日', priority:'medium' },
  { id:'w3', name:'森本 由紀',  want:'明日 / 午前',         service:['L','S'], regAt:'昨日', priority:'medium' },
  { id:'w4', name:'山口 さやか', want:'今週中 / 平日',      service:['C'],     regAt:'3日前', priority:'low'    },
];

export const dmRules: DmRule[] = [
  { id:'dm1', name:'前日リマインダー',              trigger:'予約24時間前',     channel:'LINE',  status:'on',     sent: 312, opened: 0.94, lastEdit:'5/1'  },
  { id:'dm2', name:'来店翌日 お礼メッセージ',       trigger:'来店翌日 10:00',   channel:'LINE',  status:'on',     sent: 287, opened: 0.71, lastEdit:'4/22' },
  { id:'dm3', name:'休眠 60日アプローチ',           trigger:'最終来店から60日', channel:'LINE',  status:'on',     sent: 48,  opened: 0.42, lastEdit:'3/8'  },
  { id:'dm4', name:'休眠 90日リカバリー（10%OFF）', trigger:'最終来店から90日', channel:'メール',status:'on',     sent: 31,  opened: 0.35, lastEdit:'2/14' },
  { id:'dm5', name:'お誕生日クーポン',              trigger:'誕生月初日',       channel:'LINE',  status:'paused', sent: 12,  opened: 0.83, lastEdit:'2/1'  },
];

export const dmLog: DmLogEntry[] = [
  { id:'l1', when:'本日 08:00', to:'青山 真理',   rule:'前日リマインダー',         channel:'LINE',   state:'opened'    },
  { id:'l2', when:'本日 08:00', to:'柳田 友香',   rule:'前日リマインダー',         channel:'LINE',   state:'opened'    },
  { id:'l3', when:'本日 08:00', to:'矢野 玲子',   rule:'前日リマインダー',         channel:'LINE',   state:'delivered' },
  { id:'l4', when:'昨日 10:00', to:'森本 由紀',   rule:'休眠 90日リカバリー',      channel:'メール', state:'opened'    },
  { id:'l5', when:'昨日 10:00', to:'西川 美穂',   rule:'休眠 90日リカバリー',      channel:'メール', state:'delivered' },
  { id:'l6', when:'昨日 10:00', to:'佐々木 涼子', rule:'来店翌日 お礼メッセージ', channel:'LINE',   state:'opened'    },
];

export const chartHistory: Record<string, ChartRecord> = {
  c_aoyama: {
    name: '青山 真理', kana: 'アオヤマ マリ', ageBand: '40s', gender: 'F',
    phone: '090-•••-••12', mail: 'm.aoyama@••••', birthday: '11月7日',
    firstVisit: '2023年4月', totalVisits: 14, totalSpend: 134800,
    avgCycle: 58, daysSince: 3,
    nextSuggest: '6月10日 前後',
    preferences: '前髪は眉上ギリギリ。耳まわりすっきり。会話は控えめが好み。',
    allergy: 'なし',
    visits: [
      { date:'2026/05/11', staff:'田中 美咲', service:['C','H'], amount:9500,
        cut:'肩下5cm、レイヤー多め。前髪眉上1cm', color:null, perm:null,
        memo:'ヘッドスパが気持ち良かったとのこと。次回も追加希望',
        photoTags:['front','side'] },
      { date:'2026/03/14', staff:'田中 美咲', service:['C','L'], amount:11800,
        cut:'肩下8cm、軽く梳く', color:'8GB:7Be = 1:1 / 30g / 30min', perm:null,
        memo:'白髪気になり始め。次回からハイライト検討',
        photoTags:['front'] },
      { date:'2026/01/18', staff:'田中 美咲', service:['C'], amount:5500,
        cut:'肩下7cm、前髪のみ', color:null, perm:null,
        memo:'忘年会前の調整', photoTags:[] },
      { date:'2025/11/29', staff:'田中 美咲', service:['C','L'], amount:11800,
        cut:'肩上10cm にバッサリ', color:'10NB:9Be = 1:1 / 35g / 30min', perm:null,
        memo:'ボブ希望。仕上がり気に入った様子', photoTags:['front','side','back'] },
    ],
  },
};

/* ─── Helpers ───────────────────────────────────────────────────────── */

export function fmtTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
