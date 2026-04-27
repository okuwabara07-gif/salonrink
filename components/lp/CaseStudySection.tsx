export default function CaseStudySection() {
  return (
    <section
      id="case-study"
      style={{
        background: '#ffffff',
        padding: '80px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: 'var(--sr-blue-pale-deepest)',
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          導入事例
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
          }}
        >
          <div style={{ background: 'linear-gradient(135deg, #d8c8b8 0%, #c4b4a4 100%)', height: '300px', borderRadius: '16px' }} />
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--sr-blue-pale-deepest)', marginBottom: '16px' }}>
              キレイ鶴見店
            </h3>
            <p style={{ color: 'var(--sr-text-soft)', lineHeight: 1.8, marginBottom: '16px' }}>
              美容室オーナー様がSalonRinkを導入後、LINE予約が月30件→150件に増加。
            </p>
            <a href="/case-studies/kirei-tsurumi" style={{ color: '#f0a0a0', fontWeight: 600, textDecoration: 'none' }}>
              詳細を見る →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
