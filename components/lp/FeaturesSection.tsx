'use client'

import Image from 'next/image'

export default function FeaturesSection() {
  const features = [
    { id: 1, title: 'LINE Bot 自動応答', desc: '24時間お客様の問い合わせに即時対応。営業時間外でも予約を取りこぼしません。', image: '/images/lp/feature-01-line-bot.svg', isSvg: true },
    { id: 2, title: '予約管理', desc: 'ペールトーンの手帳のように、すべての予約をひと目で。直感的な操作で予定変更も簡単。', image: '/images/lp/feature-02-reservation.webp' },
    { id: 3, title: 'LINE通知連携', desc: 'お客様にLINEで自動通知。予約確認・前日リマインドで、無断キャンセルを大幅削減。', image: '/images/lp/feature-03-line.webp' },
    { id: 4, title: '顧客管理', desc: 'お客様一人ひとりの好みや履歴を記録。常連様にパーソナライズされた提案ができる。', image: '/images/lp/feature-04-customer.webp' },
    { id: 5, title: '電子カルテ', desc: '施術履歴・カラーレシピをデジタル化。スタッフ間の引継ぎもスムーズに。', image: '/images/lp/feature-05-karte.webp' },
    { id: 6, title: 'EC連携', desc: 'サロン専用ECで物販収益も自動化。BeautyPassとも連携して動画ECにも対応。', image: '/images/lp/feature-06-ec.webp' },
    { id: 7, title: 'マーケティング分析', desc: 'タブレットでも直感的に。来店傾向・売上推移を可視化して、次の打ち手を見える化。', image: '/images/lp/feature-07-marketing.webp' },
    { id: 8, title: 'PC・スマホ両対応', desc: 'どのデバイスからでも、サロンの状況をリアルタイムで把握。', image: '/images/lp/feature-08-pc-dashboard.webp' },
    { id: 9, title: 'システム連携', desc: 'Stripe・GA4・Resend・LINE──既存の業務ツールとシームレスに繋がる。', image: '/images/lp/feature-09-integration.webp' },
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
