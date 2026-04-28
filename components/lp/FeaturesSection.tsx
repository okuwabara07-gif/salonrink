'use client'

import Image from 'next/image'

export default function FeaturesSection() {
  const features = [
    { id: 1, title: '業界最安 ¥980〜', desc: '充実した機能を最安値で', color: '#ffe89a' },
    { id: 2, title: 'HPB自動同期', desc: '毎時0分に顧客データ自動更新', color: '#f0a878' },
    { id: 3, title: 'LINE予約・アプリ不要', desc: 'LINEミニアプリで簡単予約', color: '#7bca9c' },
    { id: 4, title: '前日リマインド自動', desc: '全プラン共通で来店率UP', color: '#ffd1dc' },
    { id: 5, title: '顧客カルテ管理', desc: '施術履歴・処方レシピ完全記録', color: '#9dbddb' },
    { id: 6, title: '店販EC', desc: 'LINE上での商品販売', image: '/images/lp/feature-06-ec.webp' },
    { id: 7, title: 'クーポン配信', desc: 'セグメント配信で効果最大化', color: '#f0a0a0' },
    { id: 8, title: 'ポイントカード', desc: 'デジタルポイントで再来店促進', color: '#ffe89a' },
    { id: 9, title: '動画付き商品紹介', desc: '【NEW】LINE上で動画配信可能', color: '#ffd1dc' },
  ]

  return (
    <section
      id="features"
      style={{
        background: '#ffffff',
        padding: '80px 20px',
      }}
    >
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
          9つの便利機能
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {features.map((feat) => (
            <div
              key={feat.id}
              style={{
                background: 'var(--sr-bg-card)',
                border: '1px solid var(--sr-border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                gap: '16px',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* 画像またはグラデーション */}
              {feat.image ? (
                <div
                  style={{
                    width: '80px',
                    minWidth: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={feat.image}
                    alt={feat.title}
                    width={80}
                    height={80}
                    loading="lazy"
                    style={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: '80px',
                    minWidth: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${feat.color}40 0%, ${feat.color}20 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    fontWeight: 700,
                    color: feat.color,
                  }}
                >
                  #{feat.id.toString().padStart(2, '0')}
                </div>
              )}

              <div>
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--sr-blue-pale-deepest)',
                    marginBottom: '6px',
                  }}
                >
                  {feat.title}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--sr-text-soft)',
                    margin: 0,
                  }}
                >
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
