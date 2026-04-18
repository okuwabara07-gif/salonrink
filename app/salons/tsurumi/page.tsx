const styles = {
  main: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #F2EAD8 0%, #FAF6EE 50%, #F2EAD8 100%)',
    fontFamily: 'Georgia, serif',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: 48,
    fontWeight: 300,
    color: '#1A1018',
    letterSpacing: 4,
    lineHeight: 1.2,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A6E64',
    lineHeight: 1.8,
    marginBottom: 48,
    maxWidth: 600,
    fontFamily: 'sans-serif',
  },
  button: {
    padding: '16px 40px',
    background: '#B8966A',
    color: '#FAF6EE',
    textDecoration: 'none',
    fontSize: 14,
    letterSpacing: 2,
    fontFamily: 'sans-serif',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 8,
  },
}

export default function KireiturumiPage() {
  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.title}>
          キレイ鶴見店がSALOMÉで変わった
        </h1>
        <p style={styles.subtitle}>
          LINE予約の確定率 68% → 92% に改善。<br />
          顧客再来率を 45% → 68% に拡大。<br />
          月額売上 ¥680k → ¥850k へ。
        </p>
        <a href="/register" style={styles.button}>
          30日無料で始める
        </a>
      </section>
    </main>
  )
}
