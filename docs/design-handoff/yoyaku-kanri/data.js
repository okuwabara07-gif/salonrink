// Mock data for salon booking management.
// Times are minutes from 00:00.

const TIME_START = 10 * 60; // 10:00
const TIME_END   = 20 * 60; // 20:00
const SLOT_MIN   = 30;      // minor gridline every 30min

const STAFF = [
  { id: "s1", name: "菊地 みなみ",  role: "店長 / カラリスト", color: "#7a8f5a", initials: "MK" },
  { id: "s2", name: "井芹 知緒",    role: "スタイリスト",     color: "#a6794d", initials: "CI" },
  { id: "s3", name: "矢野 玲奈",    role: "スタイリスト",     color: "#6e7fa3", initials: "RY" },
  { id: "s4", name: "浅野 節子",    role: "アシスタント",     color: "#a3727f", initials: "SA" },
  { id: "s5", name: "フリー枠",     role: "未割当",           color: "#9a9285", initials: "—"  },
];

// status: confirmed | tentative | inprogress | done | canceled
// source: web | phone | walkin | repeat
const BOOKINGS = [
  // s1
  { id: "b01", staffId: "s1", start: 10*60+ 0, dur: 90,  customer: "菊地 照美", phone: "090-1234-5678", service: "オーガニックカラーリタッチ (根元染め)", price: 8800,  source: "web",    status: "done",      tags: ["VIP"], memo: "毛先のダメージ気になる。前回より明るめ希望。" },
  { id: "b02", staffId: "s1", start: 11*60+30, dur: 60,  customer: "矢野 玲子", phone: "080-2222-3333", service: "カット + シャンプー",                  price: 6600,  source: "phone",  status: "inprogress",tags: [], memo: "" },
  { id: "b03", staffId: "s1", start: 13*60+ 0, dur: 120, customer: "青山 さやか", phone: "090-9988-1122", service: "ハイライト + トリートメント",            price: 18700, source: "web",    status: "confirmed", tags: ["指名"], memo: "結婚式参列のため2週間以内に再来店予定" },
  { id: "b04", staffId: "s1", start: 15*60+30, dur: 75,  customer: "長嶺 直美", phone: "080-4567-8901", service: "縮毛矯正 (前髪)",                       price: 9900,  source: "repeat", status: "confirmed", tags: [], memo: "" },
  { id: "b05", staffId: "s1", start: 17*60+ 0, dur: 60,  customer: "飯貝 佳奈", phone: "090-3344-5566", service: "オーガニックカラーリタッチ",              price: 8800,  source: "web",    status: "tentative", tags: ["新規"], memo: "アレルギーパッチテスト希望" },

  // s2
  { id: "b06", staffId: "s2", start: 10*60+ 0, dur: 60,  customer: "井芹 知緒", phone: "070-1111-2222", service: "メンズカット",                          price: 5500,  source: "walkin", status: "done",      tags: [], memo: "" },
  { id: "b07", staffId: "s2", start: 11*60+30, dur: 90,  customer: "大塚 有紀", phone: "080-7788-9900", service: "デザインカラー (グラデーション)",          price: 16500, source: "web",    status: "inprogress",tags: ["VIP","指名"], memo: "前回のオレンジ系を継続。退色具合チェック。" },
  { id: "b08", staffId: "s2", start: 13*60+30, dur: 105, customer: "小堀 敦子", phone: "090-5544-3322", service: "カット + ヘッドスパ (40分)",              price: 11000, source: "phone",  status: "confirmed", tags: [], memo: "肩こり強め。圧強めで。" },
  { id: "b09", staffId: "s2", start: 16*60+ 0, dur: 75,  customer: "吉崎 真樹子", phone: "080-2233-4455", service: "縮毛矯正 + カット",                     price: 24200, source: "web",    status: "confirmed", tags: ["指名"], memo: "" },
  { id: "b10", staffId: "s2", start: 18*60+ 0, dur: 60,  customer: "成瀬 英里", phone: "090-6677-8899", service: "ブロー + アレンジ",                     price: 5500,  source: "phone",  status: "tentative", tags: [], memo: "結婚式二次会へ直行" },

  // s3
  { id: "b11", staffId: "s3", start: 10*60+30, dur: 90,  customer: "市川 洋子", phone: "080-1414-2525", service: "白髪染めフルカラー + カット",            price: 13200, source: "repeat", status: "done",      tags: [], memo: "" },
  { id: "b12", staffId: "s3", start: 13*60+ 0, dur: 60,  customer: "鈴木 まり子", phone: "090-8181-7272", service: "前髪カットのみ",                        price: 2200,  source: "walkin", status: "confirmed", tags: [], memo: "" },
  { id: "b13", staffId: "s3", start: 14*60+30, dur: 120, customer: "柳田 友美", phone: "080-3636-4545", service: "ブリーチ + オンカラー",                  price: 22000, source: "web",    status: "confirmed", tags: ["指名"], memo: "毛量多め、所要時間長めに見積もり" },
  { id: "b14", staffId: "s3", start: 17*60+30, dur: 45,  customer: "野村 はる", phone: "070-9090-1010", service: "メンテナンスカット",                    price: 4400,  source: "phone",  status: "tentative", tags: [], memo: "" },

  // s4
  { id: "b15", staffId: "s4", start: 11*60+ 0, dur: 45,  customer: "桜井 葉月", phone: "080-1234-9999", service: "シャンプー + ブロー",                    price: 3300,  source: "walkin", status: "done",      tags: [], memo: "" },
  { id: "b16", staffId: "s4", start: 14*60+ 0, dur: 90,  customer: "森本 美咲", phone: "090-0001-0002", service: "ヘッドスパロング (60分)",                price: 7700,  source: "web",    status: "confirmed", tags: ["新規"], memo: "初回ヒアリングシート記入要" },
  { id: "b17", staffId: "s4", start: 16*60+30, dur: 60,  customer: "田辺 桃子", phone: "080-5050-6060", service: "シャンプー + ヘッドスパ (30分)",          price: 5500,  source: "phone",  status: "confirmed", tags: [], memo: "" },

  // s5 (free / unassigned)
  { id: "b18", staffId: "s5", start: 12*60+ 0, dur: 60,  customer: "鶴田 ゆかり", phone: "090-0202-0303", service: "カット + カラー希望（要割当）",          price: 12100, source: "web",    status: "tentative", tags: ["新規","要割当"], memo: "担当指定なし。経験のあるスタッフ希望。" },
  { id: "b19", staffId: "s5", start: 15*60+ 0, dur: 30,  customer: "（仮押さえ）",  phone: "—",            service: "前髪カット予約枠",                       price: 2200,  source: "phone",  status: "tentative", tags: ["要割当"], memo: "電話受付分、後で振り分け" },
];

const SOURCE_LABEL = {
  web:    { ja: "ウェブ予約", short: "WEB", color: "#5a7a8f" },
  phone:  { ja: "電話",       short: "TEL", color: "#8a6e4d" },
  walkin: { ja: "直接来店",   short: "店頭",color: "#7a8f5a" },
  repeat: { ja: "リピーター", short: "RPT", color: "#a3727f" },
};

const STATUS_LABEL = {
  confirmed:  { ja: "確定",   color: "#5a7a52", bg: "#eaf1e1", border: "#bcc9a8" },
  tentative:  { ja: "仮予約", color: "#a08036", bg: "#f6efde", border: "#d9c89a" },
  inprogress: { ja: "来店中", color: "#4a6b80", bg: "#e3ecf3", border: "#a8c2d2" },
  done:       { ja: "完了",   color: "#6b6357", bg: "#eee9df", border: "#cabfaa" },
  canceled:   { ja: "見送り", color: "#a85555", bg: "#f3e3e3", border: "#d9aeae" },
};

window.SALON_DATA = {
  TIME_START, TIME_END, SLOT_MIN,
  STAFF, BOOKINGS, SOURCE_LABEL, STATUS_LABEL,
};
