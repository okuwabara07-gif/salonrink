export default function ComparisonTable() {
  const features = ['HPB連携', 'LINE予約', 'リマインド', '月額料金']
  const competitors = [
    { name: 'SalonRink', hpb: '✓', line: '✓', reminder: '✓', price: '¥980〜' },
    { name: 'A社', hpb: '✗', line: '✓', reminder: '✓', price: '¥2,970' },
    { name: 'B社', hpb: '✗', line: '✓', reminder: '✓', price: '¥2,970' },
  ]
  return (
    <section style={{ background: 'var(--sr-bg)', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: 'var(--sr-blue-pale-deepest)',
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          他社との比較
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sr-border)' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--sr-blue-pale-deepest)' }}>
                  サービス
                </th>
                {features.map((f) => (
                  <th key={f} style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: 'var(--sr-blue-pale-deepest)' }}>
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp, i) => (
                <tr key={i} style={{ background: comp.name === 'SalonRink' ? 'linear-gradient(90deg, #ffd1dc30 0%, transparent 100%)' : '#ffffff', borderBottom: '1px solid var(--sr-border)' }}>
                  <td style={{ padding: '16px', fontWeight: comp.name === 'SalonRink' ? 700 : 600, color: 'var(--sr-blue-pale-deepest)' }}>
                    {comp.name}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', color: 'var(--sr-text-soft)' }}>{comp.hpb}</td>
                  <td style={{ padding: '16px', textAlign: 'center', color: 'var(--sr-text-soft)' }}>{comp.line}</td>
                  <td style={{ padding: '16px', textAlign: 'center', color: 'var(--sr-text-soft)' }}>{comp.reminder}</td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: comp.name === 'SalonRink' ? '#f0a0a0' : 'var(--sr-text-soft)' }}>
                    {comp.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
