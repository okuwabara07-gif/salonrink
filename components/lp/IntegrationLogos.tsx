export default function IntegrationLogos() {
  const logos = [
    { name: 'LINE', emoji: '💬' },
    { name: 'ホットペッパー', emoji: '🍲' },
    { name: 'Stripe', emoji: '💳' },
    { name: 'Google', emoji: '🔍' },
  ]
  return (
    <section style={{ background: '#ffffff', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--sr-text-soft)', marginBottom: '40px' }}>
          連携サービス
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {logos.map((logo) => (
            <div key={logo.name} style={{ fontSize: '48px' }}>
              {logo.emoji}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
