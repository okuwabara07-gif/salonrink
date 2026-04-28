'use client'

import Image from 'next/image'

export default function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 背景画像 */}
      <Image
        src="/images/lp/hero-salon.webp"
        alt="明るい美容室の内観"
        fill
        priority
        style={{
          objectFit: 'cover',
        }}
      />

      {/* 濃いペールトーン白オーバーレイ */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1,
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* バッジ */}
        <div
          style={{
            display: 'inline-block',
            background: 'var(--sr-pink-pale)',
            color: 'var(--sr-pink-text)',
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          ✓ 美容師監修・実装サロンで検証済み
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 8vw, 56px)',
            fontWeight: 600,
            color: 'var(--sr-blue-pale-deepest)',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
            fontFeatureSettings: '"palt" 1',
          }}
        >
          HPBはそのまま、<br />
          自分らしいサロン運営へ
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            color: 'var(--sr-text-soft)',
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
          }}
        >
          LINE予約・顧客カルテ・売上管理、全部ひとつで。
          <br />
          ホットペッパーの顧客データをそのまま活用できる唯一のSaaS。
        </p>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '60px',
          }}
        >
          <a
            href="/register"
            style={{
              background: 'linear-gradient(135deg, #f5b8b8 0%, #f0a5a5 100%)',
              color: '#ffffff',
              padding: '16px 40px',
              borderRadius: '999px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245,184,184,0.3)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245,184,184,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,184,184,0.3)'
            }}
          >
            無料で始める（14日間）
          </a>
          <button
            style={{
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(8px)',
              color: '#1a2c4f',
              padding: '16px 40px',
              borderRadius: '999px',
              border: '1.5px solid rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
            }}
          >
            デモを見る
          </button>
        </div>

        {/* SalonRinkダッシュボード画像 */}
        <div
          style={{
            maxWidth: '400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Image
            src="/images/lp/hero-mockup.svg"
            alt="SalonRink スマホダッシュボード - 予約・売上・顧客管理を一画面で"
            width={320}
            height={640}
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '100%',
            }}
            unoptimized
            priority
          />
        </div>
      </div>
    </section>
  )
}
