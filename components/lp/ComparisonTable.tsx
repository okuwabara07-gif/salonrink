export default function ComparisonTable() {
  const features = ['LINE予約', 'HPB連携', 'ミニモ連携', 'AIカルテ', 'AI接客スクリプト', 'AIアレルギー警告', '月額料金']
  const competitors = [
    { name: 'SalonRink', line: '✅', hpb: '✅', minimo: '🔔', aichart: '✅', aiscript: '✅', aialert: '✅', price: '¥1,980〜' },
    { name: 'A社', line: '✅', hpb: '❌', minimo: '❌', aichart: '❌', aiscript: '❌', aialert: '❌', price: '¥2,000〜' },
    { name: 'B社', line: '❌', hpb: '✅', minimo: '❌', aichart: '❌', aiscript: '❌', aialert: '❌', price: '¥3,980〜' },
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
              {competitors.map((comp, i) => {
                const getStatusColor = (value: string) => {
                  if (value === '✅') return '#10b981'
                  if (value === '❌') return '#9ca3af'
                  if (value === '🔔') return '#f59e0b'
                  return 'var(--sr-text-soft)'
                }
                return (
                  <tr key={i} style={{ background: comp.name === 'SalonRink' ? 'linear-gradient(90deg, #ffd1dc30 0%, transparent 100%)' : '#ffffff', borderBottom: '1px solid var(--sr-border)' }}>
                    <td style={{ padding: '16px', fontWeight: comp.name === 'SalonRink' ? 700 : 600, color: 'var(--sr-blue-pale-deepest)' }}>
                      {comp.name}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: getStatusColor(comp.line), fontSize: '16px' }}>{comp.line}</td>
                    <td style={{ padding: '16px', textAlign: 'center', color: getStatusColor(comp.hpb), fontSize: '16px' }}>{comp.hpb}</td>
                    <td style={{ padding: '16px', textAlign: 'center', color: getStatusColor(comp.minimo), fontSize: '16px' }}>{comp.minimo}</td>
                    <td style={{ padding: '16px', textAlign: 'center', color: getStatusColor(comp.aichart), fontSize: '16px' }}>{comp.aichart}</td>
                    <td style={{ padding: '16px', textAlign: 'center', color: getStatusColor(comp.aiscript), fontSize: '16px' }}>{comp.aiscript}</td>
                    <td style={{ padding: '16px', textAlign: 'center', color: getStatusColor(comp.aialert), fontSize: '16px' }}>{comp.aialert}</td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: comp.name === 'SalonRink' ? '#f0a0a0' : 'var(--sr-text-soft)' }}>
                      {comp.price}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
