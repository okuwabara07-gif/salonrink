'use client'

import Header from '@/components/lp/Header'
import Footer from '@/components/lp/Footer'

export default function FeaturesPage() {
  const categories = [
    {
      name: 'AIカルテ',
      icon: '🤖',
      features: [
        {
          title: 'AIサマリー生成',
          description: '顧客情報を自動分析し、最適なサマリーを生成',
          icon: '💬',
        },
        {
          title: 'アレルギー警告',
          description: 'リスク情報を察知し、施術前に通知',
          icon: '⚠️',
        },
        {
          title: '次回提案',
          description: '最適な施術・ケアを AI が提案',
          icon: '✨',
        },
        {
          title: '失客予測',
          description: '来店パターンからリスクを分析',
          icon: '📍',
        },
      ],
      columns: 4,
    },
    {
      name: '予約管理',
      icon: '📅',
      features: [
        {
          title: '予約カレンダー',
          description: '予約を一元管理',
          icon: '📅',
        },
        {
          title: '自動リマインド',
          description: '前日・当日に顧客に自動通知',
          icon: '⏰',
        },
        {
          title: '予約統計',
          description: '売上・件数を分析',
          icon: '📊',
        },
      ],
      columns: 3,
    },
    {
      name: '顧客管理',
      icon: '👥',
      features: [
        {
          title: '顧客一覧',
          description: '顧客情報を一元管理',
          icon: '👥',
        },
        {
          title: '来店履歴',
          description: '過去の来店記録を確認',
          icon: '📋',
        },
        {
          title: 'タグ管理',
          description: '顧客を分類・整理',
          icon: '🏷️',
        },
      ],
      columns: 3,
    },
    {
      name: '同期・連携',
      icon: '🔗',
      features: [
        {
          title: 'LINE連携',
          description: '予約・カルテを自動同期',
          icon: '💚',
        },
        {
          title: '外部サービス連携',
          description: 'ホットペッパー・minimo 連携',
          icon: '🔗',
        },
      ],
      columns: 2,
    },
  ]

  return (
    <main style={{ background: 'var(--bg-main)' }}>
      <Header />

      {/* ページタイトル */}
      <section
        style={{
          background: 'var(--bg-card)',
          padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: 'var(--font-noto-serif-jp)',
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              fontWeight: 400,
              color: 'var(--text-primary)',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: 'clamp(12px, 2vw, 16px)',
              letterSpacing: 0.02,
            }}
          >
            SalonRink の全機能
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            あなたのサロンワークを、もっとスマートに。
          </p>
        </div>
      </section>

      {/* 機能カテゴリ */}
      <section
        style={{
          background: 'var(--bg-main)',
          padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {categories.map((category) => (
            <div key={category.name} style={{ marginBottom: 'clamp(80px, 12vw, 120px)' }}>
              {/* カテゴリタイトル + 機能数バッジ */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(16px, 3vw, 24px)',
                  marginBottom: 'clamp(40px, 6vw, 60px)',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                  }}
                >
                  {category.icon}
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-noto-serif-jp)',
                      fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                      margin: 0,
                      letterSpacing: 0.02,
                    }}
                  >
                    {category.name}
                  </h2>
                </div>
                <div
                  style={{
                    background: 'var(--accent-gold)',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                    fontWeight: 600,
                    marginLeft: 'auto',
                  }}
                >
                  {category.features.length}
                </div>
              </div>

              {/* 機能カードグリッド */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    category.columns === 4
                      ? 'repeat(auto-fit, minmax(240px, 1fr))'
                      : category.columns === 3
                        ? 'repeat(auto-fit, minmax(280px, 1fr))'
                        : 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 'clamp(20px, 3vw, 32px)',
                }}
              >
                {category.features.map((feature, index) => (
                  <div
                    key={`${category.name}-${index}`}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--sr-border)',
                      borderRadius: 12,
                      padding: 'clamp(20px, 3vw, 28px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* アイコン枠 */}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 'clamp(12px, 1.5vw, 16px)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1.75rem',
                        }}
                      >
                        {feature.icon}
                      </span>
                    </div>

                    {/* タイトル */}
                    <h3
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.95rem, 1.8vw, 1.0625rem)',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        marginTop: 0,
                        marginBottom: 'clamp(8px, 1.5vw, 12px)',
                        lineHeight: 1.3,
                      }}
                    >
                      {feature.title}
                    </h3>

                    {/* 説明文 */}
                    <p
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                        fontWeight: 400,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
