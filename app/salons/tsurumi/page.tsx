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
  section2: {
    padding: '80px 40px',
    background: '#fff',
  },
  section2Title: {
    textAlign: 'center' as const,
    fontSize: 32,
    fontWeight: 300,
    color: '#1A1018',
    letterSpacing: 4,
    marginBottom: 60,
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    maxWidth: 1200,
    margin: '0 auto',
  },
  card: {
    padding: '32px',
    border: '1px solid #E8E8E8',
    background: '#FAFAFA',
    borderRadius: 10,
  },
  cardLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    fontFamily: 'sans-serif',
  },
  cardBefore: {
    fontSize: 28,
    fontWeight: 500,
    color: '#1A1018',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 1.6,
    marginBottom: 16,
    fontFamily: 'sans-serif',
  },
  cardArrow: {
    textAlign: 'center' as const,
    fontSize: 14,
    color: '#B8966A',
    fontWeight: 500,
    margin: '16px 0',
  },
  cardAfter: {
    fontSize: 28,
    fontWeight: 500,
    color: '#3B6D11',
    marginBottom: 8,
  },
  cardResult: {
    fontSize: 13,
    color: '#3B6D11',
    fontWeight: 500,
    fontFamily: 'sans-serif',
  },
  section3: {
    padding: '80px 40px',
    background: '#F5F1EC',
  },
  section3Title: {
    textAlign: 'center' as const,
    fontSize: 32,
    fontWeight: 300,
    color: '#1A1018',
    letterSpacing: 4,
    marginBottom: 60,
  },
  featureContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    maxWidth: 1200,
    margin: '0 auto',
  },
  featureCard: {
    padding: '32px',
    background: '#fff',
    border: '1px solid #E8E8E8',
    borderRadius: 10,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1018',
    marginBottom: 12,
    fontFamily: 'sans-serif',
  },
  featureDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 1.8,
    fontFamily: 'sans-serif',
  },
  section4: {
    padding: '80px 40px',
    background: '#fff',
  },
  section4Title: {
    textAlign: 'center' as const,
    fontSize: 32,
    fontWeight: 300,
    color: '#1A1018',
    letterSpacing: 4,
    marginBottom: 60,
  },
  pricingContainer: {
    maxWidth: 1000,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  pricingCard: (isRecommended: boolean) => ({
    padding: '32px',
    border: isRecommended ? '2px solid #B8966A' : '1px solid #E8E8E8',
    background: isRecommended ? '#FAFBF8' : '#fff',
    borderRadius: 10,
    textAlign: 'center' as const,
  }),
  planName: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1A1018',
    marginBottom: 8,
    fontFamily: 'sans-serif',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 500,
    color: '#B8966A',
    marginBottom: 4,
  },
  planBadge: {
    fontSize: 12,
    color: '#B8966A',
    marginBottom: 20,
    fontFamily: 'sans-serif',
  },
  featureList: {
    textAlign: 'left' as const,
    fontSize: 13,
    color: '#666',
    lineHeight: 2,
    fontFamily: 'sans-serif',
  },
  pricingNote: {
    textAlign: 'center' as const,
    fontSize: 13,
    color: '#666',
    marginTop: 40,
    lineHeight: 1.8,
    fontFamily: 'sans-serif',
  },
  section5: {
    padding: '80px 40px',
    background: '#1A1018',
    textAlign: 'center' as const,
  },
  ctaButton: {
    padding: '18px 48px',
    background: '#B8966A',
    color: '#FAF6EE',
    textDecoration: 'none',
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: 'sans-serif',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 8,
    marginBottom: 24,
    display: 'inline-block',
  },
  ctaSubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.8,
    marginBottom: 16,
    fontFamily: 'sans-serif',
  },
  ctaFooter: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 24,
    fontFamily: 'sans-serif',
  },
}

export default function KireiturumiPage() {
  return (
    <main style={styles.main}>
      {/* Section 1: Hero */}
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

      {/* Section 2: Before/After */}
      <section style={styles.section2}>
        <h2 style={styles.section2Title}>導入による成果</h2>
        <div style={styles.cardContainer}>
          {/* Card 1 */}
          <div style={styles.card}>
            <div style={styles.cardLabel}>予約確定率</div>
            <div style={styles.cardBefore}>68%</div>
            <div style={styles.cardDescription}>
              ホットペッパー・LINE・電話が混在、<br />
              重複予約が月 12 件発生
            </div>
            <div style={styles.cardArrow}>↓ SALOMÉ 導入</div>
            <div style={styles.cardAfter}>92%</div>
            <div style={styles.cardDescription}>
              システムが自動で重複をブロック
            </div>
            <div style={styles.cardResult}>
              月 12 件の予約取りこぼしを防止
            </div>
          </div>

          {/* Card 2 */}
          <div style={styles.card}>
            <div style={styles.cardLabel}>顧客再来率</div>
            <div style={styles.cardBefore}>45%</div>
            <div style={styles.cardDescription}>
              LINEリマインドを手動で送信、<br />
              フォローが属人的
            </div>
            <div style={styles.cardArrow}>↓ SALOMÉ 導入</div>
            <div style={styles.cardAfter}>68%</div>
            <div style={styles.cardDescription}>
              来店後 24h に自動でフォロー送信
            </div>
            <div style={styles.cardResult}>
              新規顧客の定着率が 1.5 倍に
            </div>
          </div>

          {/* Card 3 */}
          <div style={styles.card}>
            <div style={styles.cardLabel}>月額売上</div>
            <div style={styles.cardBefore}>¥680,000</div>
            <div style={styles.cardDescription}>
              施術売上のみ
            </div>
            <div style={styles.cardArrow}>↓ SALOMÉ 導入</div>
            <div style={styles.cardAfter}>¥850,000</div>
            <div style={styles.cardDescription}>
              施術売上 + EC販売 ¥170k/月
            </div>
            <div style={styles.cardResult}>
              追加売上 ¥170k/月を実現
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Features */}
      <section style={styles.section3}>
        <h2 style={styles.section3Title}>SALOMÉ の機能</h2>
        <div style={styles.featureContainer}>
          {/* Feature 1 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📱</div>
            <h3 style={styles.featureTitle}>LINE予約</h3>
            <p style={styles.featureDesc}>
              顧客がLINEリッチメニューから予約。スタッフは自動で Supabase に同期。ホットペッパーとの重複をシステムが自動ブロック。
            </p>
          </div>

          {/* Feature 2 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📋</div>
            <h3 style={styles.featureTitle}>顧客カルテ</h3>
            <p style={styles.featureDesc}>
              施術メニュー・スタイル写真・次回希望日を記録。AIが顧客の好みを学習し、推奨メニューを提案。ポイント自動加算で顧客ロイヤリティ向上。
            </p>
          </div>

          {/* Feature 3 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🛍</div>
            <h3 style={styles.featureTitle}>ECストア</h3>
            <p style={styles.featureDesc}>
              自社商品とアフィリ商品を同一カタログで販売。配送代行も対応。顧客の来店後 LINE で自動推奨メール送信。
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Pricing */}
      <section style={styles.section4}>
        <h2 style={styles.section4Title}>料金プラン</h2>
        <div style={styles.pricingContainer}>
          {/* Basic */}
          <div style={styles.pricingCard(false)}>
            <div style={styles.planName}>Basic</div>
            <div style={styles.planPrice}>¥980/月</div>
            <div style={styles.featureList}>
              ✅ LINE予約<br />
              ✅ 重複ブロック<br />
              ❌ 顧客カルテ<br />
              ❌ AI推奨<br />
              ❌ ポイント管理<br />
              ❌ ECストア<br />
              ❌ 売上レポート<br />
              ❌ スタッフ管理
            </div>
          </div>

          {/* Small - Recommended */}
          <div style={styles.pricingCard(true)}>
            <div style={styles.planName}>⭐ Small</div>
            <div style={styles.planPrice}>¥2,480/月</div>
            <div style={styles.planBadge}>推奨プラン</div>
            <div style={styles.featureList}>
              ✅ LINE予約<br />
              ✅ 重複ブロック<br />
              ✅ 顧客カルテ<br />
              ✅ AI推奨<br />
              ✅ ポイント管理<br />
              ❌ ECストア<br />
              ❌ 売上レポート<br />
              ❌ スタッフ管理
            </div>
          </div>

          {/* Medium */}
          <div style={styles.pricingCard(false)}>
            <div style={styles.planName}>Medium</div>
            <div style={styles.planPrice}>¥3,980/月</div>
            <div style={styles.featureList}>
              ✅ LINE予約<br />
              ✅ 重複ブロック<br />
              ✅ 顧客カルテ<br />
              ✅ AI推奨<br />
              ✅ ポイント管理<br />
              ✅ ECストア<br />
              ✅ 売上レポート<br />
              ✅ スタッフ管理
            </div>
          </div>
        </div>
        <p style={styles.pricingNote}>
          30日間無料トライアル付き。<br />
          キレイ鶴見店の成果は Small プランで実現。<br />
          いつでも解約可能。
        </p>
      </section>

      {/* Section 5: CTA */}
      <section style={styles.section5}>
        <a href="/register" style={styles.ctaButton}>
          30日無料で始める
        </a>
        <p style={styles.ctaSubText}>
          クレジットカード登録不要。<br />
          30日後に自動で Small プランに移行します。
        </p>
        <p style={styles.ctaFooter}>
          ご質問は support@salonrink.com までお気軽に
        </p>
      </section>
    </main>
  )
}
