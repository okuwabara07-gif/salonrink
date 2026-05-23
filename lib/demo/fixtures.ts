// Demo fixture data for /demo routes

export interface DemoCustomer {
  id: string;
  name: string;
  phone: string;
  lastVisitDate: string; // ISO date
  visitCount: number;
  favoriteStylist: string;
  preferredMenuCategories: string[];
}

export interface DemoReservation {
  id: string;
  customerId: string;
  customerName: string;
  datetime: string; // ISO datetime
  duration: number; // minutes
  menuName: string;
  estimatedPrice: number;
  source: 'hpb' | 'manual';
  notes?: string;
}

export interface DemoKarte {
  id: string;
  customerId: string;
  customerName: string;
  visitCount: number;
  lastVisitDate: string;
  serviceHistory: string[];
  allergies?: string;
  preferences: string;
  notes: string;
}

export interface DemoMenu {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: string;
  description?: string;
}

export interface DemoConsAnalysis {
  todayAnalysis: string;
  tomorrowAlerts: string[];
  recommendations: string[];
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const sampleCustomers: DemoCustomer[] = [
  {
    id: 'cust-demo-001',
    name: '青山 真理',
    phone: '090-1234-0001',
    lastVisitDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    visitCount: 24,
    favoriteStylist: '田中',
    preferredMenuCategories: ['カット', 'カラー'],
  },
  {
    id: 'cust-demo-002',
    name: '柳田 友香',
    phone: '090-1234-0002',
    lastVisitDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    visitCount: 18,
    favoriteStylist: '鈴木',
    preferredMenuCategories: ['カット', 'パーマ'],
  },
  {
    id: 'cust-demo-003',
    name: '浅野 節子',
    phone: '090-1234-0003',
    lastVisitDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    visitCount: 32,
    favoriteStylist: '田中',
    preferredMenuCategories: ['カラー', 'トリートメント'],
  },
  {
    id: 'cust-demo-004',
    name: '矢野 玲子',
    phone: '090-1234-0004',
    lastVisitDate: today.toISOString(),
    visitCount: 15,
    favoriteStylist: '佐藤',
    preferredMenuCategories: ['カット'],
  },
  {
    id: 'cust-demo-005',
    name: '加藤 由美',
    phone: '090-1234-0005',
    lastVisitDate: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    visitCount: 8,
    favoriteStylist: '田中',
    preferredMenuCategories: ['ハイライト'],
  },
  {
    id: 'cust-demo-006',
    name: '佐藤 美咲',
    phone: '090-1234-0006',
    lastVisitDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    visitCount: 21,
    favoriteStylist: '鈴木',
    preferredMenuCategories: ['カット', 'ヘッドスパ'],
  },
  {
    id: 'cust-demo-007',
    name: '鈴木 香織',
    phone: '090-1234-0007',
    lastVisitDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    visitCount: 12,
    favoriteStylist: '佐藤',
    preferredMenuCategories: ['全体カラー'],
  },
  {
    id: 'cust-demo-008',
    name: '山田 知子',
    phone: '090-1234-0008',
    lastVisitDate: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    visitCount: 19,
    favoriteStylist: '田中',
    preferredMenuCategories: ['縮毛矯正'],
  },
  {
    id: 'cust-demo-009',
    name: '小林 由紀',
    phone: '090-1234-0009',
    lastVisitDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    visitCount: 5,
    favoriteStylist: '鈴木',
    preferredMenuCategories: ['カット', 'カラー'],
  },
  {
    id: 'cust-demo-010',
    name: '中村 恵美',
    phone: '090-1234-0010',
    lastVisitDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    visitCount: 27,
    favoriteStylist: '佐藤',
    preferredMenuCategories: ['トリートメント'],
  },
];

export const sampleMenu: DemoMenu[] = [
  { id: 'menu-001', name: 'カット', price: 4400, durationMinutes: 45, category: 'カット', description: 'スタイルカット' },
  { id: 'menu-002', name: 'カット+カラー', price: 9900, durationMinutes: 120, category: 'カット・カラー', description: 'カット+全体カラー' },
  { id: 'menu-003', name: 'ハイライト', price: 13200, durationMinutes: 90, category: 'カラー', description: 'ハイライトコース' },
  { id: 'menu-004', name: '全体カラー', price: 7700, durationMinutes: 75, category: 'カラー', description: '全体染めコース' },
  { id: 'menu-005', name: 'トリートメント単品', price: 3300, durationMinutes: 30, category: 'トリートメント', description: 'オプション可' },
  { id: 'menu-006', name: 'ヘッドスパ', price: 4400, durationMinutes: 40, category: 'ヘッドスパ', description: 'リラックスコース' },
  { id: 'menu-007', name: '縮毛矯正', price: 18700, durationMinutes: 150, category: 'パーマ・矯正', description: 'ナノケアシステム' },
  { id: 'menu-008', name: 'パーマ', price: 9900, durationMinutes: 120, category: 'パーマ・矯正', description: 'デジタルパーマ' },
];

export const sampleReservations: DemoReservation[] = [
  // 過去5件
  {
    id: 'res-past-001',
    customerId: 'cust-demo-001',
    customerName: '青山 真理',
    datetime: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    menuName: 'カット',
    estimatedPrice: 4400,
    source: 'hpb',
    notes: '前回と同じスタイルで',
  },
  {
    id: 'res-past-002',
    customerId: 'cust-demo-003',
    customerName: '浅野 節子',
    datetime: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    menuName: 'カット+カラー',
    estimatedPrice: 9900,
    source: 'manual',
  },
  {
    id: 'res-past-003',
    customerId: 'cust-demo-006',
    customerName: '佐藤 美咲',
    datetime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(),
    duration: 40,
    menuName: 'ヘッドスパ',
    estimatedPrice: 4400,
    source: 'hpb',
  },
  {
    id: 'res-past-004',
    customerId: 'cust-demo-010',
    customerName: '中村 恵美',
    datetime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    menuName: 'トリートメント単品',
    estimatedPrice: 3300,
    source: 'manual',
  },
  {
    id: 'res-past-005',
    customerId: 'cust-demo-004',
    customerName: '矢野 玲子',
    datetime: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    menuName: 'カット',
    estimatedPrice: 4400,
    source: 'hpb',
  },
  // 今日5件
  {
    id: 'res-today-001',
    customerId: 'cust-demo-002',
    customerName: '柳田 友香',
    datetime: new Date(today.getTime() + 9 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    duration: 120,
    menuName: 'パーマ',
    estimatedPrice: 9900,
    source: 'manual',
  },
  {
    id: 'res-today-002',
    customerId: 'cust-demo-005',
    customerName: '加藤 由美',
    datetime: new Date(today.getTime() + 11 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    duration: 90,
    menuName: 'ハイライト',
    estimatedPrice: 13200,
    source: 'hpb',
  },
  {
    id: 'res-today-003',
    customerId: 'cust-demo-007',
    customerName: '鈴木 香織',
    datetime: new Date(today.getTime() + 13 * 60 * 60 * 1000 + 0 * 60 * 1000).toISOString(),
    duration: 75,
    menuName: '全体カラー',
    estimatedPrice: 7700,
    source: 'manual',
  },
  {
    id: 'res-today-004',
    customerId: 'cust-demo-008',
    customerName: '山田 知子',
    datetime: new Date(today.getTime() + 15 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    duration: 150,
    menuName: '縮毛矯正',
    estimatedPrice: 18700,
    source: 'hpb',
  },
  {
    id: 'res-today-005',
    customerId: 'cust-demo-009',
    customerName: '小林 由紀',
    datetime: new Date(today.getTime() + 17 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    duration: 45,
    menuName: 'カット',
    estimatedPrice: 4400,
    source: 'manual',
  },
  // 今後1週間10件
  {
    id: 'res-future-001',
    customerId: 'cust-demo-001',
    customerName: '青山 真理',
    datetime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    menuName: 'カット',
    estimatedPrice: 4400,
    source: 'hpb',
  },
  {
    id: 'res-future-002',
    customerId: 'cust-demo-003',
    customerName: '浅野 節子',
    datetime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    menuName: 'カット+カラー',
    estimatedPrice: 9900,
    source: 'manual',
  },
  {
    id: 'res-future-003',
    customerId: 'cust-demo-006',
    customerName: '佐藤 美咲',
    datetime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(),
    duration: 40,
    menuName: 'ヘッドスパ',
    estimatedPrice: 4400,
    source: 'hpb',
  },
  {
    id: 'res-future-004',
    customerId: 'cust-demo-010',
    customerName: '中村 恵美',
    datetime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    menuName: 'トリートメント単品',
    estimatedPrice: 3300,
    source: 'manual',
  },
  {
    id: 'res-future-005',
    customerId: 'cust-demo-002',
    customerName: '柳田 友香',
    datetime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    menuName: 'カット',
    estimatedPrice: 4400,
    source: 'hpb',
  },
  {
    id: 'res-future-006',
    customerId: 'cust-demo-005',
    customerName: '加藤 由美',
    datetime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    menuName: 'ハイライト',
    estimatedPrice: 13200,
    source: 'manual',
  },
  {
    id: 'res-future-007',
    customerId: 'cust-demo-007',
    customerName: '鈴木 香織',
    datetime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(),
    duration: 75,
    menuName: '全体カラー',
    estimatedPrice: 7700,
    source: 'hpb',
  },
  {
    id: 'res-future-008',
    customerId: 'cust-demo-008',
    customerName: '山田 知子',
    datetime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(),
    duration: 150,
    menuName: '縮毛矯正',
    estimatedPrice: 18700,
    source: 'manual',
  },
  {
    id: 'res-future-009',
    customerId: 'cust-demo-004',
    customerName: '矢野 玲子',
    datetime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    menuName: 'カット',
    estimatedPrice: 4400,
    source: 'hpb',
  },
  {
    id: 'res-future-010',
    customerId: 'cust-demo-009',
    customerName: '小林 由紀',
    datetime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    menuName: 'パーマ',
    estimatedPrice: 9900,
    source: 'manual',
  },
];

export const sampleKarte: DemoKarte[] = [
  {
    id: 'karte-001',
    customerId: 'cust-demo-003',
    customerName: '浅野 節子',
    visitCount: 32,
    lastVisitDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    serviceHistory: ['カット', 'カラー', 'トリートメント', 'ハイライト'],
    allergies: 'なし',
    preferences: 'ハイトーン好き、定期的なカラーメンテナンス希望',
    notes: 'ロングヘアを短めのボブへ変更検討中',
  },
  {
    id: 'karte-002',
    customerId: 'cust-demo-001',
    customerName: '青山 真理',
    visitCount: 24,
    lastVisitDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    serviceHistory: ['カット', 'カラー'],
    allergies: 'あり：ジアミン',
    preferences: 'ナチュラルなストレートヘア、カラーは前回と同色希望',
    notes: '白髪が目立ってきたとのこと。前回から4週間',
  },
  {
    id: 'karte-003',
    customerId: 'cust-demo-010',
    customerName: '中村 恵美',
    visitCount: 27,
    lastVisitDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    serviceHistory: ['トリートメント', 'ヘッドスパ', 'カット'],
    allergies: 'なし',
    preferences: 'うねり・広がり対策希望、月1回のヘッドスパ定期予約',
    notes: '最近仕事が忙しい。ケア意識は高い',
  },
  {
    id: 'karte-004',
    customerId: 'cust-demo-006',
    customerName: '佐藤 美咲',
    visitCount: 21,
    lastVisitDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    serviceHistory: ['カット', 'ヘッドスパ', 'トリートメント'],
    allergies: 'あり：香料',
    preferences: 'ショートヘア推奨、頭皮が敏感',
    notes: '新卒社員。若々しいイメージ維持をサポート',
  },
  {
    id: 'karte-005',
    customerId: 'cust-demo-002',
    customerName: '柳田 友香',
    visitCount: 18,
    lastVisitDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    serviceHistory: ['パーマ', 'カット', 'トリートメント'],
    allergies: 'なし',
    preferences: 'カール感を重視、毎月のメンテナンスパーマ希望',
    notes: '約1ヶ月ぶりの来店予定。パーマの状態確認必須',
  },
];

export const sampleConsAnalysis: DemoConsAnalysis = {
  todayAnalysis:
    '本日は5件の予約で合計 ¥42,400 の売上予想。スタイリスト田中の予約が多め（3件）。ハイライトやパーマなど高単価メニューが含まれており、客単価良好。',
  tomorrowAlerts: [
    '明日は柳田友香（パーマ定期メンテ）が予約。前回から30日経過しているため、パーマの持ちを確認し、必要に応じてヘアケアアドバイス推奨。',
    '加藤由美は初回ハイライトから3ヶ月経過。カラー褪色が予想されるため、今回はメンテナンスカラーの提案機会。',
  ],
  recommendations: [
    '小林由紀（visit 5回）：リピート率向上のため、次回のカラーチケット（¥1,000割引）クーポンを発行推奨。',
    '浅野節子：ボブへのスタイルチェンジ検討中。事前にトレンドスタイル画像をLINEで送付し、来店時の相談をスムーズに。',
    '加藤由美：ハイライトの褪色対策として、カラーシャンプーの販売機会あり。',
  ],
};
