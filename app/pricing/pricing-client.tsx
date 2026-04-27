'use client'

import { CheckoutButton } from './checkout-button'

const plans = [
  {
    id: 'freelance',
    internalKey: 'basic' as const,
    name: 'フリーランス',
    price: 980,
    icon: '🌸',
    target: '自宅サロン・業務委託・出張美容師',
    tagline: '個人事業主のための、ちいさな相棒。',
    features: [
      'LINE予約管理',
      '顧客カルテ',
      '確定申告サポート',
      '顧客管理',
      '記事自動配信',
      '基本サポート',
    ],
  },
  {
    id: 'standard',
    internalKey: 'small' as const,
    name: 'スタンダード',
    price: 2480,
    icon: '🌿',
    popular: true,
    target: '1〜3席・スタッフ2名まで',
    tagline: '小規模サロンに、ちょうどいい。',
    features: [
      '全機能利用可',
      'LINE予約・カルテ・EC',
      'スタッフ2名まで',
      'クーポン・ポイント機能',
      'ブログ機能',
      '優先サポート',
    ],
  },
  {
    id: 'pro',
    internalKey: 'medium' as const,
    name: 'プロ',
    price: 3980,
    icon: '🌳',
    target: 'HPB運用中・3〜5席',
    tagline: 'HPBと共存する、本格運用へ。',
    features: [
      '全機能 + HPB同期込み',
      'スタッフ無制限',
      '広告非表示',
      '高度な分析機能',
      '専任サポート',
    ],
  },
  {
    id: 'custom',
    internalKey: null,
    name: 'カスタム',
    price: null,
    icon: '🏢',
    target: '5店舗以上・特別要件',
    tagline: '多店舗・チェーン向け。',
    features: [
      '完全カスタマイズ',
      '専任エンジニア対応',
      'API連携',
      'SSO対応',
      '法人契約',
      'SLA保証',
    ],
  },
] satisfies ReadonlyArray<{
  id: string
  internalKey: 'basic' | 'small' | 'medium' | null
  name: string
  price: number | null
  icon: string
  target: string
  tagline: string
  popular?: boolean
  features: string[]
}>

const addons = [
  { id: 'hpb', name: 'HPB同期', price: 1000, popular: true },
  { id: 'karte', name: 'カルテ', price: 300 },
  { id: 'ec', name: '店販EC', price: 300 },
  { id: 'point', name: 'ポイント', price: 300 },
  { id: 'blog', name: 'ブログ', price: 200 },
  { id: 'tax', name: '確定申告', price: 200 },
  { id: 'staff', name: 'スタッフ追加（1名）', price: 500 },
  { id: 'beauty-column', name: '美容コラム配信', price: 300 },
]

const competitors = [
  {
    feature: 'LINE予約連動',
    us: true,
    compA: true,
    compB: true,
  },
  {
    feature: '顧客カルテ',
    us: true,
    compA: false,
    compB: true,
  },
  {
    feature: '売上分析',
    us: true,
    compA: false,
    compB: true,
  },
  {
    feature: 'スタッフ管理',
    us: true,
    compA: false,
    compB: true,
  },
  {
    feature: 'EC機能',
    us: true,
    compA: false,
    compB: false,
  },
  {
    feature: 'HPB同期対応',
    us: true,
    compA: false,
    compB: false,
  },
  {
    feature: 'PWA対応（アプリ化）',
    us: true,
    compA: false,
    compB: false,
  },
  {
    feature: '初期費用',
    us: '¥3,000（SNSシェアで無料）',
    compA: '¥10,000',
    compB: '¥5,000',
  },
]

const faqs = [
  {
    q: '14日間無料トライアルの申込みにクレジットカードは必要ですか?',
    a: '必要です。トライアル期間中にキャンセルすれば一切の課金は発生しません。',
  },
  {
    q: '初期費用¥3,000はいつ請求されますか?',
    a: 'トライアル終了後の初回課金時に月額料金と一緒に請求されます。SNSで当社をシェアいただければ無料化します。',
  },
  {
    q: 'プラン変更は可能ですか?',
    a: 'いつでも可能です。アップグレード即時反映、ダウングレードは次回更新時に反映されます。',
  },
  {
    q: 'HPB同期は月額に含まれていますか?',
    a: 'プロプランに含まれています。フリーランス・スタンダードをご利用の場合は、+¥1,000/月のアドオンでご利用いただけます。',
  },
  {
    q: 'セットアップ代行はありますか?',
    a: 'はい。LINE公式アカウント連携・HPB連携など、セットアップサポートは無料で対応します。詳細はお問い合わせください。',
  },
  {
    q: '解約したらすぐに使えなくなりますか?',
    a: '次回更新日までご利用いただけます。データは30日間保管後に削除されます。',
  },
]

export function PricingClient() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F2EAD8 0%, #FAF6EE 50%, #F2EAD8 100%)',
        fontFamily: 'Italiana, Cormorant Garamond, "Noto Serif JP", Georgia, serif',
        color: '#2C2620',
      }}
    >
      {/* Header */}
      <header style={{ padding: '24px 40px', borderBottom: '1px solid rgba(184,150,106,.3)' }}>
        <a href="/" style={{ textDecoration: 'none', lineHeight: 1, display: 'inline-block' }}>
          <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: 6, color: '#1A1018' }}>
            Salon<span style={{ color: '#9B8AAB' }}>Rink</span>
          </div>
        </a>
      </header>

      <article style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: 80 }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 8vw, 56px)',
              fontWeight: 300,
              letterSpacing: 2,
              color: '#2C2620',
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            美容室経営、<br />
            もうこれ1つで完結。
          </h1>
          <p
            style={{
              fontSize: 16,
              color: '#5C4F3F',
              fontFamily: 'sans-serif',
              lineHeight: 1.8,
              marginBottom: 40,
              maxWidth: 600,
              margin: '0 auto 40px',
            }}
          >
            LINE予約・顧客管理・売上分析・スタッフ管理を一元化。
            <br />
            フリーランス美容師から多店舗チェーンまで対応。
          </p>
        </section>

        {/* Initial Fee Section */}
        <section
          style={{
            marginBottom: 80,
            padding: 40,
            background: '#fff',
            borderRadius: 16,
            border: '2px solid #9B8AAB',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 400, letterSpacing: 2, color: '#2C2620', marginBottom: 20 }}>
            初期費用
          </h2>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 48, fontWeight: 300, color: '#2C2620' }}>¥3,000</span>
            <span style={{ fontSize: 16, color: '#8A7A6A', fontFamily: 'sans-serif', marginLeft: 8 }}>
              （1回のみ）
            </span>
          </div>
          <div
            style={{
              display: 'inline-block',
              background: '#9B8AAB',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 24,
              fontSize: 14,
              fontFamily: 'sans-serif',
              marginBottom: 20,
            }}
          >
            SNSシェアで無料化
          </div>
          <p style={{ fontSize: 14, color: '#5C4F3F', fontFamily: 'sans-serif', lineHeight: 1.8 }}>
            X・Instagram・Facebookのいずれかでシェアいただければ、初期費用は無料になります。
          </p>
        </section>

        {/* Plans Section */}
        <section style={{ marginBottom: 80 }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: 3,
              color: '#2C2620',
              textAlign: 'center',
              marginBottom: 60,
            }}
          >
            月額プラン
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
              gap: 24,
              marginBottom: 40,
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  padding: 32,
                  background: plan.popular ? '#F5E8EE' : '#fff',
                  borderRadius: 16,
                  border: plan.popular ? '2px solid #9B8AAB' : '1px solid #e8ddd4',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      right: 20,
                      background: '#9B8AAB',
                      color: '#fff',
                      fontSize: 11,
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontFamily: 'sans-serif',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    RECOMMENDED
                  </div>
                )}

                <div
                  style={{
                    fontSize: 40,
                    marginBottom: 12,
                    lineHeight: 1,
                  }}
                >
                  {plan.icon}
                </div>

                <div style={{ fontSize: 13, color: '#9B8AAB', letterSpacing: 2, fontFamily: 'sans-serif', marginBottom: 12 }}>
                  {plan.name.toUpperCase()}
                </div>

                {plan.price !== null ? (
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 42, fontWeight: 300, color: '#2C2620' }}>¥{plan.price.toLocaleString()}</span>
                    <span style={{ fontSize: 14, color: '#8A7A6A', fontFamily: 'sans-serif', marginLeft: 4 }}>/月</span>
                  </div>
                ) : (
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 20, color: '#8A7A6A', fontFamily: 'sans-serif' }}>お問い合わせ</span>
                  </div>
                )}

                <p
                  style={{
                    fontSize: 13,
                    color: '#5C4F3F',
                    fontFamily: 'sans-serif',
                    lineHeight: 1.6,
                    marginBottom: 4,
                  }}
                >
                  {plan.target}
                </p>

                <p
                  style={{
                    fontSize: 12,
                    color: '#9B8AAB',
                    fontFamily: 'sans-serif',
                    lineHeight: 1.6,
                    marginBottom: 24,
                    fontStyle: 'italic',
                  }}
                >
                  {plan.tagline}
                </p>

                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 24px 0',
                    flex: 1,
                  }}
                >
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      style={{
                        fontSize: 12,
                        color: '#5C4F3F',
                        fontFamily: 'sans-serif',
                        lineHeight: 1.8,
                        paddingLeft: 20,
                        position: 'relative',
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0 }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.id === 'custom' ? (
                  <a
                    href="/contact"
                    style={{
                      display: 'block',
                      padding: '12px 20px',
                      background: '#2C2620',
                      color: '#FAF6F0',
                      textAlign: 'center',
                      fontSize: 13,
                      fontFamily: 'sans-serif',
                      borderRadius: 6,
                      letterSpacing: 1,
                      textDecoration: 'none',
                    }}
                  >
                    お問い合わせ
                  </a>
                ) : plan.internalKey ? (
                  <CheckoutButton plan={plan.internalKey} />
                ) : null}
              </div>
            ))}
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#8A7A6A',
              fontFamily: 'sans-serif',
              marginTop: 20,
            }}
          >
            年額契約（2ヶ月分割引）をご希望の方は、<a href="/contact" style={{ color: '#9B8AAB', textDecoration: 'none' }}>お問い合わせ</a>
            ください
          </p>
        </section>

        {/* Addons Section */}
        <section style={{ marginBottom: 80 }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: 3,
              color: '#2C2620',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            アドオン機能
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
              gap: 16,
              marginBottom: 40,
            }}
          >
            {addons.map((addon) => (
              <div
                key={addon.id}
                style={{
                  padding: 20,
                  background: addon.popular ? '#F5E8EE' : '#fff',
                  borderRadius: 12,
                  border: addon.popular ? '2px solid #9B8AAB' : '1px solid #e8ddd4',
                  position: 'relative',
                }}
              >
                {addon.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: 10,
                      background: '#9B8AAB',
                      color: '#fff',
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 8,
                      fontFamily: 'sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    POPULAR
                  </div>
                )}
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#2C2620', marginBottom: 8, fontFamily: 'sans-serif' }}>
                  {addon.name}
                </h3>
                <p style={{ fontSize: 18, fontWeight: 300, color: '#9B8AAB', margin: 0 }}>
                  +¥{addon.price.toLocaleString()}/月
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#8A7A6A',
              fontFamily: 'sans-serif',
            }}
          >
            ※ スタッフ追加は1名単位で追加可能です。複数プランの機能重複分は自動で除外されます。
          </p>
        </section>

        {/* PWA Section */}
        <section
          style={{
            marginBottom: 80,
            padding: 60,
            background: '#2C2620',
            borderRadius: 16,
            color: '#FAF6F0',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(24px, 6vw, 40px)',
              fontWeight: 300,
              letterSpacing: 2,
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            アプリのように、使える。
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              marginBottom: 24,
              maxWidth: 600,
              margin: '0 auto 24px',
              opacity: 0.9,
            }}
          >
            App Store不要。ホーム画面に追加するだけで、
            <br />
            ネイティブアプリのように快適に使用可能。
          </p>
          <div
            style={{
              display: 'inline-block',
              background: '#9B8AAB',
              color: '#FAF6F0',
              padding: '8px 16px',
              borderRadius: 24,
              fontSize: 12,
              fontFamily: 'sans-serif',
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            業界初 PWA対応
          </div>
        </section>

        {/* Competitor Comparison */}
        <section
          style={{
            marginBottom: 80,
            padding: 32,
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e8ddd4',
            overflowX: 'auto',
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 400,
              letterSpacing: 2,
              marginBottom: 32,
              color: '#2C2620',
            }}
          >
            競合比較
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              minWidth: 600,
              fontFamily: 'sans-serif',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #C19A8C' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#5C4F3F' }}>機能</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#9B8AAB' }}>
                  SalonRink
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#8A7A6A' }}>
                  他社A
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#8A7A6A' }}>
                  他社B
                </th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0e7da' }}>
                  <td style={{ padding: '12px 16px', color: '#5C4F3F' }}>{row.feature}</td>
                  <td
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: row.us === true ? '#9B8AAB' : row.us === false ? '#ccc' : '#2C2620',
                    }}
                  >
                    {row.us === true ? '✓' : row.us === false ? '−' : row.us}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: row.compA === true ? '#5C4F3F' : row.compA === false ? '#ccc' : '#2C2620',
                    }}
                  >
                    {row.compA === true ? '✓' : row.compA === false ? '−' : row.compA}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: row.compB === true ? '#5C4F3F' : row.compB === false ? '#ccc' : '#2C2620',
                    }}
                  >
                    {row.compB === true ? '✓' : row.compB === false ? '−' : row.compB}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 80 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 400,
              letterSpacing: 2,
              marginBottom: 32,
              color: '#2C2620',
            }}
          >
            よくあるご質問
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {faqs.map((f, i) => (
              <details
                key={i}
                style={{
                  padding: 20,
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid #e8ddd4',
                }}
              >
                <summary
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#2C2620',
                    cursor: 'pointer',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {f.q}
                </summary>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: '#5C4F3F',
                    marginTop: 12,
                    fontFamily: 'sans-serif',
                  }}
                >
                  {f.a}
                </p>
              </details>
            ))}
          </div>
          <p
            style={{
              textAlign: 'center',
              marginTop: 24,
              fontSize: 13,
              color: '#8A7A6A',
              fontFamily: 'sans-serif',
            }}
          >
            他にご質問があれば <a href="/faq" style={{ color: '#9B8AAB', textDecoration: 'none' }}>FAQ一覧</a> または{' '}
            <a href="/contact" style={{ color: '#9B8AAB', textDecoration: 'none' }}>お問い合わせ</a> からどうぞ
          </p>
        </section>

        {/* Final CTA */}
        <section
          style={{
            padding: 60,
            background: '#2C2620',
            borderRadius: 16,
            textAlign: 'center',
            color: '#FAF6F0',
          }}
        >
          <h2
            style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: 2,
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            14日間、お試しください。
          </h2>
          <p
            style={{
              fontSize: 14,
              opacity: 0.85,
              marginBottom: 32,
              fontFamily: 'sans-serif',
              lineHeight: 1.8,
            }}
          >
            トライアル期間中はいつでも解約可能。
            <br />
            クレジットカードの登録が必要ですが、期間内の解約なら一切課金されません。
          </p>
          <CheckoutButton
            plan="small"
            style={{
              display: 'inline-block',
              padding: '14px 40px',
              background: '#FAF6F0',
              color: '#2C2620',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 6,
              letterSpacing: 2,
              width: 'auto',
            }}
          />
        </section>
      </article>
    </main>
  )
}
