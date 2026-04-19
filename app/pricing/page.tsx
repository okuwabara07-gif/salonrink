import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '料金プラン | SalonRink',
  description: 'SalonRink の料金プラン詳細。ベーシック¥980/月・スモール¥2,480/月・ミディアム¥3,980/月。全プラン14日間無料トライアル付き。',
  alternates: { canonical: 'https://salonrink.com/pricing' },
};

const plans = [
  {
    name: 'ベーシック',
    price: 980,
    color: '#8B7BAA',
    link: 'https://buy.stripe.com/test_28E5kD7lPdahabs9lc0kE00',
    desc: '個人サロン・業務委託美容師向け',
    target: 'まずは予約管理を自動化したい方',
  },
  {
    name: 'スモール',
    price: 2480,
    color: '#B8966A',
    link: 'https://buy.stripe.com/test_3cIeVd49D5HP0ASbtk0kE01',
    desc: '小規模サロン（スタッフ1〜3名）向け',
    target: '顧客管理まで本格運用したい方',
    featured: true,
  },
  {
    name: 'ミディアム',
    price: 3980,
    color: '#7A3550',
    link: 'https://buy.stripe.com/test_7sY28r7lP2vDdnEbtk0kE02',
    desc: '中規模サロン（スタッフ4〜10名）向け',
    target: '売上分析・スタッフ管理まで統合したい方',
  },
];

const features: [string, (boolean | string)[]][] = [
  ['LINE予約連動（リッチメニュー対応）', [true, true, true]],
  ['予約リマインド自動送信', [true, true, true]],
  ['予約枠のダブルブッキング防止', [true, true, true]],
  ['LINE公式アカウント 1個', [true, true, true]],
  ['月額サポート（メール）', [true, true, true]],
  ['顧客カルテ（施術履歴）', ['--', true, true]],
  ['失客アラート（離反予測）', ['--', true, true]],
  ['誕生日・記念日メッセージ自動化', ['--', true, true]],
  ['ポイント管理', ['--', true, true]],
  ['スタッフアカウント', ['--', '3名まで', '10名まで']],
  ['売上レポート・分析', ['--', '--', true]],
  ['AI仕訳・確定申告対応', ['--', '--', true]],
  ['口コミ収益化（AdSense連動）', ['--', '--', true]],
  ['専用サポート担当', ['--', '--', true]],
];

const faqs = [
  { q: '14日間無料トライアルの申込みにクレジットカードは必要ですか?', a: '必要です。トライアル期間中にキャンセルすれば一切の課金は発生しません。' },
  { q: 'プラン変更は可能ですか?', a: 'いつでも可能です。アップグレード即時反映、ダウングレードは次回更新時に反映されます。' },
  { q: '解約したらすぐに使えなくなりますか?', a: '次回更新日までご利用いただけます。データは30日間保管後に削除されます。' },
  { q: 'LINE公式アカウントは自前で用意する必要がありますか?', a: 'はい。既存のアカウントを連携するか、無料で新規作成いただけます。' },
];

export default function PricingPage() {
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

      <article style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ fontSize: 12, letterSpacing: 4, color: '#B8966A', fontFamily: 'sans-serif', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</p>
          <h1 style={{ fontSize: 40, fontWeight: 300, letterSpacing: 3, color: '#1A1018', marginBottom: 16 }}>料金プラン</h1>
          <p style={{ fontSize: 16, color: '#7A6E64', fontFamily: 'sans-serif', lineHeight: 1.8 }}>
            サロンの規模・ご予算にあわせて、最適なプランをお選びいただけます。<br />
            <strong style={{ color: '#1A1018' }}>全プラン14日間無料</strong>・いつでも解約OK。
          </p>
        </div>

        {/* プラン3つのカード */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 60 }}>
          {plans.map((p) => (
            <div key={p.name} style={{
              padding: 32, background: p.featured ? '#F5E8EE' : '#fff', borderRadius: 16,
              border: p.featured ? `2px solid ${p.color}` : '1px solid #e8ddd4',
              position: 'relative',
            }}>
              {p.featured && (
                <div style={{
                  position: 'absolute', top: -12, right: 20, background: p.color, color: '#fff',
                  fontSize: 11, padding: '4px 12px', borderRadius: 12, fontFamily: 'sans-serif', fontWeight: 700, letterSpacing: 1,
                }}>人気</div>
              )}
              <div style={{ fontSize: 13, color: p.color, letterSpacing: 3, fontFamily: 'sans-serif', marginBottom: 12 }}>{p.name}</div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 42, fontWeight: 300, color: '#1A1018' }}>¥{p.price.toLocaleString()}</span>
                <span style={{ fontSize: 14, color: '#A89E94', fontFamily: 'sans-serif', marginLeft: 4 }}>/月</span>
              </div>
              <p style={{ fontSize: 13, color: '#7A6E64', fontFamily: 'sans-serif', lineHeight: 1.6, marginBottom: 4 }}>{p.desc}</p>
              <p style={{ fontSize: 12, color: p.color, fontFamily: 'sans-serif', lineHeight: 1.6, marginBottom: 20 }}>{p.target}</p>
              <a href={p.link} style={{
                display: 'block', padding: '12px 20px', background: '#1A1018', color: '#FAF6EE',
                textAlign: 'center', textDecoration: 'none', fontSize: 13, fontFamily: 'sans-serif', borderRadius: 6, letterSpacing: 1,
              }}>14日間無料で始める →</a>
            </div>
          ))}
        </section>

        {/* 機能比較表 */}
        <section style={{ marginBottom: 60, padding: 32, background: '#fff', borderRadius: 16, border: '1px solid #e8ddd4', overflowX: 'auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 3, marginBottom: 24, color: '#3d2b1f' }}>機能比較</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #c8a97e' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#5a4a3f' }}>機能</th>
                {plans.map((p) => (
                  <th key={p.name} style={{ padding: '12px 16px', color: p.color, fontFamily: 'sans-serif', fontSize: 13, letterSpacing: 1 }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map(([label, values]) => (
                <tr key={label as string} style={{ borderBottom: '1px solid #f0e7da' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'sans-serif', fontSize: 13 }}>{label as string}</td>
                  {(values as (boolean | string)[]).map((v, i) => (
                    <td key={i} style={{ padding: '14px 16px', textAlign: 'center', fontFamily: 'sans-serif', fontSize: 13, color: v === true ? '#7A3550' : v === '--' ? '#ccc' : '#5a4a3f' }}>
                      {v === true ? '✓' : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 3, marginBottom: 20, color: '#3d2b1f' }}>よくあるご質問</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {faqs.map((f, i) => (
              <details key={i} style={{ padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e8ddd4' }}>
                <summary style={{ fontSize: 14, fontWeight: 600, color: '#1A1018', cursor: 'pointer', fontFamily: 'sans-serif' }}>{f.q}</summary>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: '#5a4a3f', marginTop: 12, fontFamily: 'sans-serif' }}>{f.a}</p>
              </details>
            ))}
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#7A6E64', fontFamily: 'sans-serif' }}>
              他にご質問があれば <a href="/faq" style={{ color: '#B8966A' }}>FAQ一覧</a> または <a href="/contact" style={{ color: '#B8966A' }}>お問い合わせ</a> からどうぞ
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 40, background: '#1A1018', borderRadius: 16, textAlign: 'center', color: '#FAF6EE' }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: 3, marginBottom: 12 }}>まずは14日間無料でお試しください</h2>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 24, fontFamily: 'sans-serif', lineHeight: 1.8 }}>
            トライアル期間中はいつでも解約可能。<br />クレジットカードの登録が必要ですが、期間内の解約なら一切課金されません。
          </p>
          <a href={plans[1].link} style={{
            display: 'inline-block', padding: '14px 40px', background: '#FAF6EE', color: '#1A1018',
            textDecoration: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'sans-serif', borderRadius: 6, letterSpacing: 2,
          }}>スモールプランで始める</a>
        </section>
      </article>
    </main>
  );
}
