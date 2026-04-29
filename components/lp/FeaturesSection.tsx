'use client'

import Image from 'next/image'

export default function FeaturesSection() {
  const features = [
    { id: 1, title: 'AIカルテ', desc: '美容師のメモを Claude Haiku が構造化。顧客を完璧に記憶。', image: '/images/lp/feature-05-karte.webp', badge: 'NEW' },
    { id: 2, title: 'AI接客スクリプト', desc: '顧客別の説明文を自動生成。あなたらしい接客をAIが支える。', image: '/images/lp/feature-04-customer.webp', badge: 'NEW' },
    { id: 3, title: 'AIアレルギー警告', desc: '施術前の自動アラート。失敗のリスクを事前に防止。', image: '/images/lp/feature-01-line-bot.svg', isSvg: true, badge: 'NEW' },
    { id: 4, title: 'LINE公式アカウント連携', desc: '予約・チャット・配信を統合。顧客とのコミュニケーションを一元化。', image: '/images/lp/feature-03-line.webp' },
    { id: 5, title: 'LINE通知', desc: 'リマインダー・提案を自動送信。無断キャンセルを大幅削減。', image: '/images/lp/feature-02-reservation.webp' },
    { id: 6, title: '写真6枚×1年保存', desc: 'ビフォーアフターを安心管理。スタッフ間の引継ぎもスムーズ。', image: '/images/lp/feature-06-ec.webp' },
    { id: 7, title: 'HPB連携(オプション)', desc: 'ホットペッパー予約を自動同期。二重管理から解放。', image: '/images/lp/feature-07-marketing.webp' },
    { id: 8, title: '売上分析ダッシュボード', desc: 'スマホで売上をいつでも確認。経営判断を素早く。', image: '/images/lp/feature-08-pc-dashboard.webp' },
    { id: 9, title: 'PC・スマホ両対応', desc: 'どこでも使える、レスポンシブUI。外出先でもサロン状況を把握。', image: '/images/lp/feature-09-integration.webp' },
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
          AI で進化する、9つの機能
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
              {/* 画像表示(SVGはunoptimized) */}
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
                  {...(feat.isSvg ? { unoptimized: true } : {})}
                />
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--sr-blue-pale-deepest)',
                      margin: 0,
                    }}
                  >
                    {feat.title}
                  </h3>
                  {feat.badge && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#ffffff',
                        background: '#d88896',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {feat.badge}
                    </span>
                  )}
                </div>
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
