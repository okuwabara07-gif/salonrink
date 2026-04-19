import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Feature = {
  slug: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  useCases: { title: string; detail: string }[];
  plan: string;
};

const features: Feature[] = [
  {
    slug: 'line-reservation',
    icon: '📅',
    title: 'LINE予約',
    subtitle: 'お客様はLINEで1タップ、予約完了',
    description: 'サロン公式 LINE のリッチメニューから、お客様が24時間いつでも予約できる機能です。電話やメールでのやり取りが不要になり、営業時間外でも予約が入ります。ホットペッパー等の他媒体と同時連携している場合も、日時重複を自動ブロックします。',
    benefits: [
      '24時間予約受付で機会損失ゼロ',
      '電話応対時間を70%削減',
      'ホットペッパー等との重複予約を自動ブロック',
      '新規顧客はLINE友だち追加と同時に予約可能',
    ],
    useCases: [
      { title: '営業時間外の予約', detail: '夜間・休日にお客様が思い立った瞬間に予約。翌日の営業開始時には予約が埋まっています。' },
      { title: 'リピーター対応', detail: '常連客が "同じコースで次回予約" をLINEから1タップで完了。スタッフの電話応対工数がゼロに。' },
      { title: '媒体統合', detail: 'ホットペッパー・自社LINE・電話予約を一元管理。ダブルブッキング事故を完全防止。' },
    ],
    plan: 'ベーシックプラン（¥980/月）から利用可能',
  },
  {
    slug: 'customer-record',
    icon: '📋',
    title: '顧客カルテ',
    subtitle: '施術履歴も好みも、すべてが紐づく1枚',
    description: '来店履歴、施術内容、使用薬剤、アレルギー情報、お客様の好みまで、一人ひとりのカルテを自動で構築します。AI が過去データから次回おすすめメニューをレコメンドし、担当者が変わってもサービス品質を維持できます。',
    benefits: [
      '施術履歴の手書き・紙カルテが不要',
      'AI が過去データから次回メニューを提案',
      'ポイント管理・誕生日通知も自動化',
      '複数スタッフ間で顧客情報を共有',
    ],
    useCases: [
      { title: '新人スタッフの接客', detail: '初担当でもカルテを見ればお客様の好み・注意点がわかり、ベテラン並みの接客が可能。' },
      { title: 'リピート促進', detail: '前回施術から最適なタイミングで LINE 経由で次回予約のリマインドを自動送信。' },
      { title: 'トラブル防止', detail: 'アレルギーや過去の肌トラブル情報を必ず事前チェック。事故を未然に防ぎます。' },
    ],
    plan: 'スモールプラン（¥2,480/月）から利用可能',
  },
  {
    slug: 'ec-store',
    icon: '🛍',
    title: 'ECストア',
    subtitle: '店販・アフィリエイトを自社サイトで',
    description: '自社商品（シャンプー・スタイリング剤など）とアフィリエイト商品（Amazon/楽天）を同一ページで販売できる機能です。在庫管理・配送手配・決済までワンストップ。店舗での説明資料としても使えます。',
    benefits: [
      '店販商品をオンラインで24時間販売',
      'アフィリエイトリンクで在庫リスクなしに収益化',
      '配送は自動（ヤマト運輸等の連携）',
      '顧客カルテと連動した商品レコメンド',
    ],
    useCases: [
      { title: '来店後の継続販売', detail: '施術時におすすめした商品を LINE 経由で購入。次回来店前に商品が届き、物販売上が増加。' },
      { title: 'アフィリ収益化', detail: 'おすすめコスメを楽天アフィリでサロンサイトに掲載。在庫を持たずに月数万円の副収入。' },
      { title: '定期購入', detail: 'シャンプー等の定期購入を自動化。月次の安定収益源を構築できます。' },
    ],
    plan: 'ミディアムプラン（¥3,980/月）から利用可能',
  },
  {
    slug: 'review-monetization',
    icon: '⭐',
    title: '口コミ収益化',
    subtitle: 'お客様の声が、そのまま新規集客に',
    description: 'お客様から収集した口コミ・施術写真を、SEO最適化された形でサロンのウェブサイトに自動掲載します。口コミページに AdSense 広告やアフィリエイトリンクを配置することで、集客と収益化を同時に実現します。',
    benefits: [
      '口コミが検索エンジン経由の新規集客を生む',
      '口コミページ自体が広告収益を発生',
      'ビフォーアフター写真の自動整形・掲載',
      'Google ビジネスプロフィールとの連動',
    ],
    useCases: [
      { title: 'SEO流入獲得', detail: '「〇〇駅 美容室 口コミ」で検索したユーザーがサロンサイトに流入。月数十件の新規予約を生成。' },
      { title: '広告収益化', detail: '口コミページに表示される Google AdSense で、月¥5,000〜30,000の副収入。' },
      { title: '権威性構築', detail: '100件超の口コミ蓄積で、地域トップの信頼サロンとしてブランド確立。' },
    ],
    plan: 'ミディアムプラン（¥3,980/月）から利用可能',
  },
  {
    slug: 'line-automation',
    icon: '💬',
    title: 'LINE自動化',
    subtitle: 'リマインド・失客防止・フォローアップを全自動',
    description: '予約前日のリマインド、来店後のフォローメッセージ、離反しそうな顧客への再来店促進まで、すべて LINE で自動送信します。スタッフの手間をかけずに顧客エンゲージメントを維持できます。',
    benefits: [
      '予約前日リマインドでノーショー率を50%削減',
      '離反予測 AI が危険顧客を事前に検知',
      '誕生日・記念日メッセージを自動送信',
      '来店後のアンケート自動収集',
    ],
    useCases: [
      { title: 'ノーショー対策', detail: '予約前日の夜にリマインド配信。キャンセルしたい客は事前連絡しやすくなり、空き枠を他客に回せる。' },
      { title: '失客防止', detail: '3ヶ月以上来店がない顧客に自動で "お久しぶりクーポン" を配信。再来店率が15%→40%に向上。' },
      { title: '記念日マーケティング', detail: '誕生月に特別オファー。リピーター育成と紹介発生の起点に。' },
    ],
    plan: 'スモールプラン（¥2,480/月）から利用可能',
  },
  {
    slug: 'ai-accounting',
    icon: '📊',
    title: 'AI仕訳',
    subtitle: 'フリーランス美容師の確定申告、3時間で完了',
    description: '月次の売上・経費・源泉徴収を自動で集計し、確定申告書類の下書きまで作成します。面貸し美容師・業務委託美容師の複雑な経費計算を AI が代行。税理士費用を削減できます。',
    benefits: [
      '売上データの自動集計（LINE予約連動）',
      '経費レシートを写真撮影でAI仕訳',
      '源泉徴収10%の自動計算',
      'freee / マネーフォワードへの出力対応',
    ],
    useCases: [
      { title: '面貸し美容師', detail: '日々の売上と経費を自動記録。年度末にボタン1つで確定申告書類が完成。' },
      { title: '業務委託美容師', detail: '委託先毎の源泉徴収を自動計算。複数店舗掛け持ちでも混乱なし。' },
      { title: '個人サロン経営者', detail: '従業員の給与計算も対応。税理士費用 月¥30,000 の削減が可能。' },
    ],
    plan: 'ミディアムプラン（¥3,980/月）から利用可能',
  },
];

export function generateStaticParams() {
  return features.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const feature = features.find((f) => f.slug === slug);
  if (!feature) return {};
  return {
    title: `${feature.title} | SalonRink 機能紹介`,
    description: feature.description.slice(0, 120),
    alternates: { canonical: `https://salonrink.com/features/${slug}` },
  };
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feature = features.find((f) => f.slug === slug);
  if (!feature) notFound();

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #F2EAD8 0%, #FAF6EE 50%, #F2EAD8 100%)',
      fontFamily: 'Georgia, "Noto Serif JP", serif',
      color: '#2d2d2d',
    }}>
      <header style={{ padding: '24px 40px', borderBottom: '1px solid rgba(184,150,106,.3)' }}>
        <a href="/" style={{ textDecoration: 'none', lineHeight: 1, display: 'inline-block' }}>
          <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: 6, color: '#1A1018' }}>
            Salon<span style={{ color: '#B8966A' }}>Rink</span>
          </div>
        </a>
      </header>

      <article style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{feature.icon}</div>
          <p style={{ fontSize: 12, letterSpacing: 4, color: '#B8966A', fontFamily: 'sans-serif', textTransform: 'uppercase', marginBottom: 12 }}>
            Feature
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: 3, color: '#1A1018', marginBottom: 12 }}>
            {feature.title}
          </h1>
          <p style={{ fontSize: 16, color: '#7A6E64', fontFamily: 'sans-serif' }}>
            {feature.subtitle}
          </p>
        </div>

        <section style={{ marginBottom: 48, padding: 32, background: '#fff', borderRadius: 12, border: '1px solid #e8ddd4' }}>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: '#3d2b1f' }}>{feature.description}</p>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 400, letterSpacing: 3, marginBottom: 20, color: '#3d2b1f' }}>主なベネフィット</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
            {feature.benefits.map((b, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e8ddd4' }}>
                <span style={{ color: '#B8966A', fontSize: 18, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, lineHeight: 1.7, fontFamily: 'sans-serif' }}>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 400, letterSpacing: 3, marginBottom: 20, color: '#3d2b1f' }}>活用シーン</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {feature.useCases.map((u, i) => (
              <div key={i} style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #e8ddd4', borderLeft: '4px solid #8B7BAA' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1018', marginBottom: 8 }}>{u.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#5a4a3f', fontFamily: 'sans-serif' }}>{u.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48, padding: 32, background: '#1A1018', borderRadius: 12, textAlign: 'center', color: '#FAF6EE' }}>
          <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12, fontFamily: 'sans-serif', letterSpacing: 2 }}>ご利用プラン</p>
          <p style={{ fontSize: 18, marginBottom: 24, fontWeight: 400 }}>{feature.plan}</p>
          <a href="/#pricing" style={{
            display: 'inline-block', padding: '14px 36px', background: '#FAF6EE', color: '#1A1018',
            textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif', borderRadius: 6,
          }}>料金プランを見る →</a>
        </section>

        <nav style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid #e8ddd4' }}>
          <a href="/" style={{ color: '#B8966A', fontSize: 13, fontFamily: 'sans-serif', textDecoration: 'none', letterSpacing: 2 }}>
            ← 機能一覧に戻る
          </a>
        </nav>
      </article>
    </main>
  );
}
