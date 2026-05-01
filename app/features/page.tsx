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
          title: 'アレルギー注意',
          description: '大切なケア情報を、施術前にお知らせ',
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
          title: 'ホットペッパー連携',
          description: '予約・顧客情報を自動同期',
          icon: '🔗',
        },
        {
          title: 'ミニモ連携',
          description: '今後対応予定',
          icon: '🌸',
          badge: 'COMING SOON',
          opacity: 0.85,
        },
      ],
      columns: 3,
    },
  ]

  const iconMap: Record<string, React.ReactNode> = {
    '🤖': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="9" x2="9" y2="9.01" /><line x1="15" y1="9" x2="15" y2="9.01" /><path d="M9 15a3 3 0 0 0 6 0" /></svg>,
    '💬': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    '⚠️': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    '✨': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    '📍': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    '📅': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    '⏰': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><circle cx="12" cy="13" r="9" /><polyline points="12 9 12 13 16 15" /><path d="M9 2h6" /></svg>,
    '📊': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 8v12" /><path d="M9 12v8" /><path d="M5 18v2" /></svg>,
    '👥': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    '📋': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><line x1="9" y1="11" x2="15" y2="11" /><line x1="9" y1="16" x2="15" y2="16" /></svg>,
    '🏷️': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
    '💚': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', fill: '#C9A961'}}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    '🔗': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    '🌸': <svg viewBox="0 0 24 24" style={{width: '1.75rem', height: '1.75rem', stroke: '#C9A961', strokeWidth: 1.5, fill: 'none'}}><circle cx="12" cy="12" r="3" /><path d="M12 2v4" /><path d="M12 16v4" /><path d="M20 12h-4" /><path d="M4 12h4" /><path d="M17.66 6.34l-2.83 2.83" /><path d="M9.17 14.83l-2.83 2.83" /><path d="M17.66 17.66l-2.83-2.83" /><path d="M9.17 9.17l-2.83-2.83" /></svg>,
  }

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
                  {iconMap[category.icon] || category.icon}
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
                      position: 'relative',
                      opacity: feature.opacity || 1,
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
                    {/* Badge */}
                    {feature.badge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#FAF0E0',
                          color: '#C9A961',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)',
                          fontWeight: 600,
                          fontFamily: 'var(--font-noto-sans-jp)',
                        }}
                      >
                        {feature.badge}
                      </div>
                    )}

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
                        {iconMap[feature.icon] || feature.icon}
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
