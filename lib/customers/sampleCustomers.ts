/**
 * lib/customers/sampleCustomers.ts
 *
 * B案プロトタイプの SAMPLE_CUSTOMERS + 詳細データ生成。
 * Phase 4+5 で使用。Phase 6 で Supabase に置換予定。
 *
 * 顧客 c01: 佐藤 美咲 のみリッチデータ(履歴・カルテ・メッセージ完備)、
 * 他はリストから合成。
 */

export type CustomerStatus = '新規' | '再来店' | 'VIP' | '要注意';

export interface SampleCustomer {
  id: string;
  name: string;
  kana: string;
  phone: string;
  lastVisit: string | null;
  nextAppt: string | null;
  totalVisits: number;
  totalSpend: number;
  stylist: string;
  status: CustomerStatus;
  tags: string[];
  note: string;
}

export interface VisitService {
  name: string;
  amt: number;
}

export interface Visit {
  date: string;
  stylist: string;
  services: VisitService[];
  products: string[];
  duration: number;
  photoNote: string;
  note: string;
  amt: number;
}

export interface KarteFormula {
  date: string;
  formula: string;
  notes: string;
}

export interface KarteTreatment {
  date: string;
  name: string;
  notes: string;
}

export interface Karte {
  hair: {
    length: string;
    type: string;
    scalp: string;
    tone: string;
  };
  allergies: string[];
  preferences: string[];
  avoidance: string[];
  lastColor: KarteFormula | null;
  lastPerm: KarteFormula | null;
  lastTreatment: KarteTreatment | null;
  memo: string;
}

export interface ChatMessage {
  id: string;
  ts: string;
  from: 'staff' | 'customer';
  text: string;
  staffName?: string;
  kind?: 'reminder' | 'confirmed';
}

export interface CustomerDetail {
  visits: Visit[];
  karte: Karte;
  messages: ChatMessage[];
}

/* ─── Sample customers (10) ─────────────────────────────────────────── */

export const SAMPLE_CUSTOMERS: SampleCustomer[] = [
  { id: 'c01', name: '佐藤 美咲',   kana: 'サトウ ミサキ',    phone: '090-1234-5678', lastVisit: '2026-05-02', nextAppt: '2026-05-22 14:00', totalVisits: 24, totalSpend: 218400, stylist: '田中', status: 'VIP',    tags: ['カラー', 'ロング', '指名'],     note: '頭皮が敏感。アッシュ系希望。' },
  { id: 'c02', name: '山田 翔',     kana: 'ヤマダ ショウ',    phone: '080-2345-6789', lastVisit: '2026-04-28', nextAppt: '2026-05-19 11:00', totalVisits: 8,  totalSpend: 56000,  stylist: '中村', status: '再来店', tags: ['カット', 'メンズ'],            note: '前回フェード短め。次回も同様。' },
  { id: 'c03', name: '鈴木 千夏',   kana: 'スズキ チナツ',    phone: '090-3456-7890', lastVisit: null,         nextAppt: '2026-05-16 10:30', totalVisits: 0,  totalSpend: 0,      stylist: '—',    status: '新規',   tags: ['初来店', 'カット+カラー'],     note: 'Instagram経由。アッシュベージュ希望。' },
  { id: 'c04', name: '田中 健一',   kana: 'タナカ ケンイチ',  phone: '080-4567-8901', lastVisit: '2026-03-12', nextAppt: null,                totalVisits: 2,  totalSpend: 8800,   stylist: '中村', status: '要注意', tags: ['キャンセル歴', 'カット'],       note: '前回30分遅刻。電話通じにくい。' },
  { id: 'c05', name: '高橋 玲奈',   kana: 'タカハシ レナ',    phone: '090-5678-9012', lastVisit: '2026-05-08', nextAppt: '2026-06-05 13:00', totalVisits: 36, totalSpend: 412000, stylist: '田中', status: 'VIP',    tags: ['カラー', 'パーマ', '指名', '前髪'], note: '毎月第1金曜固定。お茶はほうじ茶。' },
  { id: 'c06', name: '伊藤 涼太',   kana: 'イトウ リョウタ',  phone: '080-6789-0123', lastVisit: '2026-04-19', nextAppt: '2026-05-24 16:30', totalVisits: 12, totalSpend: 78000,  stylist: '小林', status: '再来店', tags: ['メンズ', 'カット'],            note: '会話少なめ希望。' },
  { id: 'c07', name: '渡辺 さくら', kana: 'ワタナベ サクラ',  phone: '090-7890-1234', lastVisit: '2026-05-11', nextAppt: null,                totalVisits: 6,  totalSpend: 49200,  stylist: '田中', status: '再来店', tags: ['縮毛矯正', 'ロング'],           note: '湿気で広がりが気になる。' },
  { id: 'c08', name: '中村 葵',     kana: 'ナカムラ アオイ',  phone: '080-8901-2345', lastVisit: '2026-05-10', nextAppt: '2026-05-20 18:00', totalVisits: 18, totalSpend: 165000, stylist: '田中', status: 'VIP',    tags: ['カラー', 'トリートメント', '指名'], note: 'ブリーチ履歴あり。要パッチ。' },
  { id: 'c09', name: '小林 大輔',   kana: 'コバヤシ ダイスケ', phone: '090-9012-3456', lastVisit: null,         nextAppt: '2026-05-17 12:00', totalVisits: 0,  totalSpend: 0,      stylist: '—',    status: '新規',   tags: ['初来店', 'カット'],             note: '紹介(高橋様より)。' },
  { id: 'c10', name: '加藤 美月',   kana: 'カトウ ミヅキ',    phone: '080-0123-4567', lastVisit: '2026-04-02', nextAppt: '2026-05-30 10:00', totalVisits: 4,  totalSpend: 22000,  stylist: '小林', status: '再来店', tags: ['カット', 'ボブ'],              note: '前回より3cm短く。' },
];

export const ALL_TAGS: string[] = Array.from(
  new Set(SAMPLE_CUSTOMERS.flatMap((c) => c.tags))
).sort();

export const STATUS_LIST: ('すべて' | CustomerStatus)[] = [
  'すべて', '新規', '再来店', 'VIP', '要注意',
];

/* ─── Rich detail for c01 + synthesized for others ─────────────────── */

const DETAIL_DATA: Record<string, CustomerDetail> = {
  c01: {
    visits: [
      { date: '2026-05-02', stylist: '田中', services: [{ name: 'カット', amt: 5500 }, { name: 'カラー(リタッチ)', amt: 7300 }], products: ['ケアトリートメント'], duration: 110, photoNote: 'before/after 2枚', note: 'ベージュ系で根元馴染ませ。仕上がり良好。', amt: 12800 },
      { date: '2026-04-04', stylist: '田中', services: [{ name: 'カット', amt: 5500 }, { name: 'トリートメント', amt: 3300 }], products: [], duration: 80, photoNote: 'after 1枚', note: 'ロング維持。毛先のみカット。', amt: 8800 },
      { date: '2026-03-07', stylist: '田中', services: [{ name: 'カラー + トリートメント', amt: 11000 }], products: ['ホームケアオイル'], duration: 130, photoNote: '—', note: '春に向けて明るめ8トーン。', amt: 11000 },
      { date: '2026-02-09', stylist: '田中', services: [{ name: 'カット', amt: 5500 }], products: [], duration: 60, photoNote: '—', note: '前髪整え。', amt: 5500 },
      { date: '2026-01-12', stylist: '田中', services: [{ name: 'カット', amt: 5500 }, { name: 'パーマ', amt: 8800 }], products: [], duration: 150, photoNote: 'before/after 2枚', note: '緩めウェーブ。アイロン推奨。', amt: 14300 },
      { date: '2025-12-08', stylist: '田中', services: [{ name: 'カット + カラー', amt: 12800 }, { name: 'トリートメント', amt: 3300 }], products: ['ヘアマスク'], duration: 140, photoNote: '—', note: '年末暗めトーン。', amt: 16100 },
      { date: '2025-11-11', stylist: '田中', services: [{ name: 'カット', amt: 5500 }], products: [], duration: 60, photoNote: '—', note: '', amt: 5500 },
      { date: '2025-10-06', stylist: '中村', services: [{ name: 'カット + カラー', amt: 12800 }], products: [], duration: 120, photoNote: '—', note: '田中休みのため代打。問題なし。', amt: 12800 },
    ],
    karte: {
      hair: { length: 'ロング(鎖骨下20cm)', type: '直毛・普通量・やや太め', scalp: '敏感・乾燥傾向', tone: '7-8' },
      allergies: ['ジアミン軽度', 'パッチテスト推奨'],
      preferences: ['アッシュベージュ', 'シアー系', '前髪は流す'],
      avoidance: ['赤味', 'バッサリカット'],
      lastColor: { date: '2026-05-02', formula: 'イルミナ アッシュ8 + クリア(1:1) + 6%', notes: '根元のみ、20分放置' },
      lastPerm:  { date: '2026-01-12', formula: 'ロッド 25mm / コスメ系1液 → 中和10分', notes: '毛先弱めに' },
      lastTreatment: { date: '2026-05-02', name: 'システムトリートメント 3step', notes: '5回目' },
      memo: 'お茶はほうじ茶希望。施術中は雑誌読まれることが多い。香水控えめに。',
    },
    messages: [
      { id: 'm1', ts: '2026-05-12 10:24', from: 'customer', text: '次回の予約お願いします!' },
      { id: 'm2', ts: '2026-05-12 10:31', from: 'staff', text: 'ご連絡ありがとうございます😊 5/22 14:00 でいかがでしょうか?', staffName: 'テスト太郎' },
      { id: 'm3', ts: '2026-05-12 11:02', from: 'customer', text: '大丈夫です!よろしくお願いします' },
      { id: 'm4', ts: '2026-05-12 11:05', from: 'staff', text: '承知いたしました。当日お待ちしております。', staffName: 'テスト太郎', kind: 'confirmed' },
      { id: 'm5', ts: '2026-05-02 17:48', from: 'staff', text: '本日もご来店ありがとうございました。気になる点ありましたらお気軽にご連絡ください。', staffName: 'テスト太郎' },
      { id: 'm6', ts: '2026-05-02 19:15', from: 'customer', text: 'すごくよかったです!次回もよろしくお願いします' },
      { id: 'm7', ts: '2026-04-04 09:30', from: 'staff', text: '本日14:00のご予約、お待ちしております🌸', staffName: 'テスト太郎', kind: 'reminder' },
    ],
  },
};

export function getCustomerDetail(c: SampleCustomer): CustomerDetail {
  const cached = DETAIL_DATA[c.id];
  if (cached) return cached;

  const visits: Visit[] = [];
  const baseDate = c.lastVisit ? new Date(c.lastVisit) : null;
  for (let i = 0; i < Math.min(c.totalVisits, 6); i++) {
    if (!baseDate) break;
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() - i);
    const amt = Math.round(
      (c.totalSpend / Math.max(c.totalVisits, 1)) * (0.85 + (i % 3) * 0.1)
    );
    const svcName = c.tags.includes('カラー')
      ? 'カット + カラー'
      : c.tags.includes('パーマ')
        ? 'カット + パーマ'
        : 'カット';
    visits.push({
      date: d.toISOString().slice(0, 10),
      stylist: c.stylist,
      services: [{ name: svcName, amt }],
      products: [],
      duration: 60 + (i % 3) * 30,
      photoNote: '—',
      note: ['仕上がり良好', 'リピート希望', '次回も同様', ''][i % 4],
      amt,
    });
  }

  return {
    visits,
    karte: {
      hair: {
        length: c.tags.includes('ロング')
          ? 'ロング'
          : c.tags.includes('ボブ') ? 'ボブ' : 'ミディアム',
        type: '—', scalp: '—', tone: '—',
      },
      allergies: [],
      preferences: c.tags.filter((t) => !['指名', '初来店', '前髪'].includes(t)),
      avoidance: [],
      lastColor: null, lastPerm: null, lastTreatment: null,
      memo: c.note,
    },
    messages: c.lastVisit
      ? [
          { id: 'g1', ts: c.lastVisit + ' 18:00', from: 'staff', text: '本日もご来店ありがとうございました。', staffName: 'テスト太郎' },
          { id: 'g2', ts: c.lastVisit + ' 19:24', from: 'customer', text: 'ありがとうございました!' },
        ]
      : [],
  };
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

export function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function fmtDateFull(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function fmtDateTime(iso: string | null): string {
  if (!iso) return '予約なし';
  const [date, time] = iso.split(' ');
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()} ${time || ''}`;
}

export function fmtYen(n: number): string {
  return '¥' + n.toLocaleString();
}

export function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

/* ─── Status & Tag palette (mapped to SalonRink tokens) ─────────────── */

export interface PaletteEntry {
  bg: string;
  fg: string;
}

export const STATUS_PALETTE: Record<CustomerStatus, PaletteEntry> = {
  '新規':   { bg: 'rgba(61,90,107,0.10)',  fg: '#3d5a6b' }, // sky
  '再来店': { bg: 'rgba(138,126,114,0.12)', fg: '#6b6357' }, // stone
  'VIP':    { bg: 'rgba(184,149,100,0.18)', fg: '#7a5e3a' }, // gold
  '要注意': { bg: 'rgba(168,90,62,0.12)',   fg: '#a85a3e' }, // rose
};

const TAG_PALETTE: PaletteEntry[] = [
  { bg: 'rgba(90,107,60,0.12)',   fg: '#5a6b3c' }, // sage
  { bg: 'rgba(168,90,62,0.12)',   fg: '#a85a3e' }, // rose
  { bg: 'rgba(61,90,107,0.10)',   fg: '#3d5a6b' }, // sky
  { bg: 'rgba(184,149,100,0.18)', fg: '#7a5e3a' }, // gold
  { bg: 'rgba(107,45,58,0.10)',   fg: '#6b2d3a' }, // plum
  { bg: 'rgba(138,126,114,0.12)', fg: '#6b6357' }, // stone
];

export function tagColorFor(label: string): PaletteEntry {
  let h = 0;
  for (let i = 0; i < label.length; i++) {
    h = (h * 33 + label.charCodeAt(i)) >>> 0;
  }
  return TAG_PALETTE[h % TAG_PALETTE.length];
}

/* ─── Avatar deterministic hue ─────────────────────────────────────── */

export function avatarColors(name: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % 360;
  }
  return {
    bg: `oklch(0.90 0.03 ${h})`,
    fg: `oklch(0.40 0.06 ${h})`,
  };
}
