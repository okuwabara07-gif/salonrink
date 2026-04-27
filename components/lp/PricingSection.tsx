'use client'

export default function PricingSection() {
  const plans = [
    { name: 'フリーランス', price: '¥980', desc: 'ソロオーナー向け', popular: false },
    { name: 'スタンダード', price: '¥2,480', desc: '小規模店舗向け', popular: true },
    { name: 'プロ', price: '¥3,980', desc: 'HPB同期・中〜大規模向け', popular: false },
    { name: 'カスタム', price: 'お問い合わせ', desc: '大規模・複数店舗', popular: false },
  ]
  return (
    <section
      id="pricing"
      style={{
        background: 'linear-gradient(135deg, #b8d4e8 0%, #9dbddb 100%)',
        padding: '80px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          シンプルな料金体系
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {plans.map((plan, i) => (
            <div
              key={i}
              style={{
                background: plan.popular ? 'var(--sr-pink-pale)' : '#ffffff',
                borderRadius: '16px',
                padding: '32px 24px',
                textAlign: 'center',
                border: plan.popular ? '2px solid #f0a0a0' : '1px solid var(--sr-border)',
                position: 'relative',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#f0a0a0',
                    color: '#ffffff',
                    padding: '4px 16px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  最も人気
                </div>
              )}
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sr-blue-pale-deepest)', marginBottom: '8px' }}>
                {plan.name}
              </h3>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#f0a0a0', marginBottom: '8px' }}>
                {plan.price}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--sr-text-soft)', marginBottom: '24px' }}>
                {plan.desc}
              </div>
              <a
                href="/register"
                style={{
                  display: 'inline-block',
                  background: plan.popular ? 'linear-gradient(135deg, #f0a0a0 0%, #d88896 100%)' : '#9dbddb',
                  color: '#ffffff',
                  padding: '12px 32px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                選択する
              </a>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#ffffff', marginTop: '40px', fontSize: '14px' }}>
          14日間無料トライアル。クレジットカード不要。
        </p>
      </div>
    </section>
  )
}
