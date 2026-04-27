export default function SetupFlow() {
  const steps = [
    { num: 1, title: '登録', desc: 'メールアドレスで簡単登録' },
    { num: 2, title: '基本情報', desc: 'サロン情報を入力' },
    { num: 3, title: 'HPB連携', desc: '既存HPB顧客を自動読み込み' },
    { num: 4, title: '運用開始', desc: 'LINE予約をスタート' },
  ]
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
          導入の流れ（10分で完了）
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          {steps.map((step, i) => (
            <div key={i}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #ffd1dc 0%, #f0a0a0 100%)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                {step.num}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sr-blue-pale-deepest)', marginBottom: '8px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--sr-text-soft)', margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
