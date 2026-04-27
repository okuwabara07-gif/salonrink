export default function BookingFlowSection() {
  return (
    <section style={{ background: 'var(--sr-bg)', padding: '80px 20px' }}>
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
          予約までの流れ（わずか5秒）
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '9/16',
                  background: `linear-gradient(135deg, ${['#d8c8b8', '#c8d4e0', '#b8e8c8', '#ffd1dc', '#ffe89a'][step - 1]} 0%, ${['#c4b4a4', '#b4c0d0', '#98d4a8', '#f5b8c8', '#ffd878'][step - 1]} 100%)`,
                  borderRadius: '12px',
                  border: '2px solid var(--sr-border)',
                  marginBottom: '12px',
                }}
              />
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sr-blue-pale-deepest)' }}>
                ステップ {step}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
