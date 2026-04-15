export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #F2EAD8 0%, #FAF6EE 50%, #F2EAD8 100%)',
      fontFamily: 'Georgia, serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(184,150,106,.2)',
      }}>
        <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: 6, color: '#1A1018' }}>
          Salon<span style={{ color: '#B8966A' }}>Rink</span>
        </div>
        <nav style={{ display: 'flex', gap: 32, fontSize: 13, color: '#7A6E64', fontFamily: 'sans-serif' }}>
          <a href="#features" style={{ textDecoration: 'none', color: 'inherit' }}>機能</a>
          <a href="#pricing" style={{ textDecoration: 'none', color: 'inherit' }}>料金</a>
          <a href="#contact" style={{ textDecoration: 'none', color: 'inherit' }}>お問い合わせ</a>
        </nav>
      </header>

      {/* Hero */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, letterSpacing: 6, color: '#B8966A', marginBottom: 24, fontFamily: 'sans-serif', textTransform: 'uppercase' }}>
          Beauty × Technology
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 300, color: '#1A1018', letterSpacing: 4, lineHeight: 1.2, marginBottom: 24 }}>
          サロンと顧客を、<br />
          <span style={{ color: '#B8966A' }}>なめらかに</span>つなぐ。
        </h1>
        <p style={{ fontSize: 18, color: '#7A6E64', lineHeight: 1.8, marginBottom: 48, maxWidth: 600, fontFamily: 'sans-serif' }}>
          LINEリッチメニューからワンタップで予約。<br />
          顧客カルテ・EC・配送・口コミ収益化まで、<br />
          美容サロンに必要なすべてを一つに。
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#" style={{
            padding: '16px 40px',
            background: '#7A3550',
            color: '#FAF6EE',
            textDecoration: 'none',
            fontSize: 14,
            letterSpacing: 2,
            fontFamily: 'sans-serif',
          }}>
            30日間無料で試す
          </a>
          <a href="#features" style={{
            padding: '16px 40px',
            border: '1px solid #B8966A',
            color: '#7A6E64',
            textDecoration: 'none',
            fontSize: 14,
            letterSpacing: 2,
            fontFamily: 'sans-serif',
          }}>
            機能を見る
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px', background: '#1A1018' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 300, color: '#FAF6EE', letterSpacing: 4, marginBottom: 60 }}>
          できること
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {[
            { icon: '📅', title: 'LINE予約', desc: 'リッチメニューからワンタップで予約。ホットペッパーとの重複もブロック。' },
            { icon: '📋', title: '顧客カルテ', desc: '施術履歴・AIレコメンド・ポイント管理を一元化。' },
            { icon: '🛍', title: 'ECストア', desc: '自社商品とアフィリを同時展開。配送も自動管理。' },
            { icon: '⭐', title: '口コミ収益化', desc: '口コミページにAdSense・アフィリを自動表示。' },
            { icon: '💬', title: 'LINE自動化', desc: 'リマインド・失客防止・来店後フォローを自動送信。' },
            { icon: '📊', title: 'AI仕訳', desc: 'フリーランス向け売上自動集計・確定申告対応。' },
          ].map((f) => (
            <div key={f.title} style={{
              padding: '32px',
              border: '1px solid rgba(184,150,106,.2)',
              background: 'rgba(255,255,255,.03)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, color: '#FAF6EE', marginBottom: 12, fontWeight: 400, letterSpacing: 2 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#A89E94', lineHeight: 1.8, fontFamily: 'sans-serif' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 40px', background: '#FAF6EE' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 300, color: '#1A1018', letterSpacing: 4, marginBottom: 60 }}>
          料金プラン
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {[
            { name: 'FL Solo', price: '¥980', unit: '/月', desc: 'フリーランス向け', color: '#8B7BAA' },
            { name: 'FL Pro', price: '¥2,480', unit: '/月', desc: 'フリーランス上位', color: '#8B7BAA' },
            { name: 'Starter', price: '¥2,980', unit: '/月', desc: 'サロン向け基本', color: '#B8966A' },
            { name: 'Standard', price: '¥5,980', unit: '/月', desc: 'サロン向け人気', color: '#7A3550', featured: true },
            { name: 'Premium', price: '¥9,800', unit: '/月', desc: 'サロン向け上位', color: '#1A1018' },
          ].map((p) => (
            <div key={p.name} style={{
              padding: '32px 24px',
              border: `1px solid ${p.featured ? '#7A3550' : '#DDD8D0'}`,
              background: p.featured ? '#F5E8EE' : '#fff',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: p.color, letterSpacing: 2, marginBottom: 8, fontFamily: 'sans-serif' }}>{p.name}</div>
              <div style={{ fontSize: 36, color: '#1A1018', marginBottom: 4 }}>{p.price}</div>
              <div style={{ fontSize: 12, color: '#A89E94', marginBottom: 16, fontFamily: 'sans-serif' }}>{p.unit}</div>
              <div style={{ fontSize: 13, color: '#7A6E64', fontFamily: 'sans-serif' }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 40, fontSize: 14, color: '#A89E94', fontFamily: 'sans-serif' }}>
          すべてのプランに30日間無料トライアル付き
        </p>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', background: '#1A1018', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: 6, color: '#FAF6EE', marginBottom: 16 }}>
          Salon<span style={{ color: '#B8966A' }}>Rink</span>
        </div>
        <p style={{ fontSize: 12, color: '#7A6E64', fontFamily: 'sans-serif', letterSpacing: 2 }}>
          © 2026 SalonRink
        </p>
      </footer>
    </main>
  );
}
