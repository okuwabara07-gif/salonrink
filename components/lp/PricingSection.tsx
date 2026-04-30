'use client'

export default function PricingSection() {
  const plans = [
    {
      name: 'Light',
      price: '¥1,980',
      period: '/月',
      description: '基本機能・シンプルに始めたいサロン向け',
      cta: '無料で試す',
      popular: false,
      borderColor: 'var(--sr-border)',
    },
    {
      name: 'Standard',
      price: '¥2,980',
      period: '/月',
      description: 'AIカルテ・HPB連携(売上を伸ばしたいサロン向け)',
      cta: '無料で試す',
      popular: true,
      badge: '人気No.1',
      borderColor: 'var(--accent-gold)',
    },
    {
      name: 'Premium',
      price: '¥4,580',
      period: '/月',
      description: '全機能(本格的に運用したいサロン向け)',
      cta: '無料で試す',
      popular: false,
      borderColor: 'var(--sr-border)',
    },
  ]

  const competitors = [
    { feature: '月額', salonrink: '¥1,980', a: '¥8,000', b: '¥3,980', c: '¥15,000+' },
    { feature: '初期費用', salonrink: '¥0', a: '¥0', b: '¥0', c: '¥100,000' },
    { feature: 'AIカルテ', salonrink: '●', a: '-', b: '-', c: '-', highlight: true },
    { feature: '予約管理', salonrink: '●', a: '●', b: '●', c: '●' },
    { feature: '顧客管理', salonrink: '●', a: '●', b: '●', c: '●' },
    { feature: 'LINE連携', salonrink: '●', a: '●', b: '●', c: '●' },
    { feature: 'HPB連携', salonrink: '●', a: '●', b: '-', c: '●' },
  ]

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* EYEBROW */}
        <p
          style={{
            fontFamily: 'var(--font-noto-sans-jp)',
            fontSize: 'clamp(0.75rem, 1.3vw, 0.875rem)',
            fontWeight: 600,
            color: '#C9A961',
            textAlign: 'center',
            marginBottom: 'clamp(12px, 2vw, 16px)',
            letterSpacing: 0.15,
            textTransform: 'uppercase',
          }}
        >
          PRICING
        </p>

        {/* セクションタイトル */}
        <h2
          style={{
            fontFamily: 'var(--font-noto-serif-jp)',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            textAlign: 'center',
            marginBottom: 'clamp(12px, 2vw, 16px)',
            letterSpacing: 0.02,
          }}
        >
          業界最安級の料金プラン。
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-noto-sans-jp)',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.125rem)',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: 'clamp(60px, 8vw, 80px)',
          }}
        >
          サロンの規模に合わせて選べる3プラン
        </p>

        {/* プランカード 3つ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(24px, 3vw, 32px)',
            marginBottom: 'clamp(80px, 12vw, 120px)',
          }}
        >
          {plans.map((plan, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 'clamp(32px, 5vw, 40px)',
                border: `2px solid ${plan.borderColor}`,
                position: 'relative',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* 人気バッジ */}
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--accent-gold)',
                    color: '#FFFFFF',
                    padding: '6px 20px',
                    borderRadius: 20,
                    fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* プラン名 */}
              <h3
                style={{
                  fontFamily: 'var(--font-noto-sans-jp)',
                  fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginTop: 0,
                  marginBottom: 'clamp(12px, 2vw, 16px)',
                  textAlign: 'center',
                }}
              >
                {plan.name}
              </h3>

              {/* 価格 */}
              <div
                style={{
                  fontFamily: 'var(--font-noto-serif-jp)',
                  fontSize: 'clamp(2.5rem, 6vw, 3.25rem)',
                  fontWeight: 400,
                  color: 'var(--accent-gold)',
                  textAlign: 'center',
                  marginBottom: 4,
                  letterSpacing: -0.02,
                }}
              >
                {plan.price}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-noto-sans-jp)',
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.9375rem)',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  marginBottom: 'clamp(24px, 3vw, 32px)',
                }}
              >
                {plan.period}
              </div>

              {/* 説明文 */}
              <p
                style={{
                  fontFamily: 'var(--font-noto-sans-jp)',
                  fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  marginBottom: 'clamp(32px, 5vw, 40px)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {plan.description}
              </p>

              {/* CTA ボタン */}
              <a
                href="/register"
                style={{
                  display: 'inline-block',
                  background: plan.popular ? 'var(--accent-gold)' : 'var(--text-primary)',
                  color: '#FFFFFF',
                  padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-noto-sans-jp)',
                  fontSize: 'clamp(0.95rem, 1.5vw, 1rem)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  marginTop: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* 競合比較表 */}
        <div
          style={{
            borderRadius: 12,
            border: '1px solid var(--sr-border)',
            overflow: 'hidden',
            marginBottom: 'clamp(24px, 3vw, 32px)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.9375rem)',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--sr-border)' }}>
                <th style={{ padding: 'clamp(12px, 2vw, 16px)', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)' }}>
                  機能
                </th>
                <th style={{ padding: 'clamp(12px, 2vw, 16px)', textAlign: 'center', fontWeight: 600, background: 'var(--accent-light-beige)', color: 'var(--text-primary)' }}>
                  SalonRink
                </th>
                <th style={{ padding: 'clamp(12px, 2vw, 16px)', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                  A社
                </th>
                <th style={{ padding: 'clamp(12px, 2vw, 16px)', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                  B社
                </th>
                <th style={{ padding: 'clamp(12px, 2vw, 16px)', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                  C社
                </th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < competitors.length - 1 ? '1px solid var(--sr-border)' : 'none' }}>
                  <td style={{ padding: 'clamp(12px, 2vw, 16px)', fontWeight: row.highlight ? 600 : 500, color: 'var(--text-primary)' }}>
                    {row.feature}
                  </td>
                  <td
                    style={{
                      padding: 'clamp(12px, 2vw, 16px)',
                      textAlign: 'center',
                      background: 'var(--accent-light-beige)',
                      fontWeight: 600,
                      color: row.salonrink === '●' ? 'var(--accent-gold)' : 'var(--text-primary)',
                    }}
                  >
                    {row.salonrink}
                  </td>
                  <td style={{ padding: 'clamp(12px, 2vw, 16px)', textAlign: 'center', color: row.a === '●' ? 'var(--accent-gold)' : 'var(--text-soft)' }}>
                    {row.a}
                  </td>
                  <td style={{ padding: 'clamp(12px, 2vw, 16px)', textAlign: 'center', color: row.b === '●' ? 'var(--accent-gold)' : 'var(--text-soft)' }}>
                    {row.b}
                  </td>
                  <td style={{ padding: 'clamp(12px, 2vw, 16px)', textAlign: 'center', color: row.c === '●' ? 'var(--accent-gold)' : 'var(--text-soft)' }}>
                    {row.c}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 注記 */}
        <p
          style={{
            fontFamily: 'var(--font-noto-sans-jp)',
            fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
            color: 'var(--text-soft)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          ※ 価格は税抜表示です。全プランで 14日間無料体験できます。
        </p>
      </div>
    </section>
  )
}
