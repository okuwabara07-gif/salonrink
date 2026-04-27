export default function ResourceForm() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #b8e8c8 0%, #7bca9c 100%)', padding: '80px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          資料請求
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>
          SalonRinkの詳細な機能・料金情報をメールでお送りします。
        </p>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="メールアドレス"
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
            }}
          />
          <input
            type="text"
            placeholder="サロン名"
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
            }}
          />
          <button
            style={{
              background: '#ffffff',
              color: '#7bca9c',
              padding: '14px',
              borderRadius: '999px',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            資料請求
          </button>
        </form>
      </div>
    </section>
  )
}
