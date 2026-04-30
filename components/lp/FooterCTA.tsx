'use client'

import Link from 'next/link'

export default function FooterCTA() {
  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
        color: '#fff',
        backgroundImage: 'url(/images/lp-redesign/cta-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}
    >
      {/* グラデーションオーバーレイ */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(26, 22, 18, 0.7) 0%, rgba(45, 42, 40, 0.75) 100%)',
          zIndex: 1,
        }}
      />
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {/* メインキャッチコピー */}
        <h2
          style={{
            fontFamily: 'var(--font-noto-serif-jp)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 400,
            color: '#fff',
            textAlign: 'center',
            marginBottom: 'clamp(12px, 2vw, 16px)',
            lineHeight: 1.3,
            letterSpacing: 0.02,
          }}
        >
          美容師とお客様を、<br />一生でつなぐ。
        </h2>

        {/* サブキャッチコピー 1 */}
        <p
          style={{
            fontFamily: 'var(--font-noto-sans-jp)',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            fontWeight: 400,
            color: '#fff',
            marginBottom: 'clamp(8px, 1vw, 12px)',
            opacity: 0.95,
          }}
        >
          それが、SalonRink。
        </p>

        {/* サブキャッチコピー 2 */}
        <p
          style={{
            fontFamily: 'var(--font-noto-sans-jp)',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.125rem)',
            fontWeight: 300,
            color: '#fff',
            marginBottom: 'clamp(40px, 5vw, 60px)',
            lineHeight: 1.8,
            opacity: 0.85,
            maxWidth: 700,
            margin: '0 auto',
          }}
        >
          AI が、あなたのサロンの可能性を広げてくれます。
        </p>

        {/* CTA ボタン */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(12px, 2vw, 20px)',
            alignItems: 'center',
            maxWidth: 320,
            margin: '0 auto',
          }}
        >
          {/* 主 CTA */}
          <Link
            href="/register"
            style={{
              display: 'block',
              width: '100%',
              background: '#1A1018',
              color: '#fff',
              padding: 'clamp(14px, 2vw, 18px) clamp(32px, 5vw, 48px)',
              borderRadius: 8,
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(0.95rem, 1.5vw, 1.125rem)',
              fontWeight: 500,
              textDecoration: 'none',
              border: '2px solid #1A1018',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2D2A28'
              e.currentTarget.style.borderColor = '#2D2A28'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1A1018'
              e.currentTarget.style.borderColor = '#1A1018'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            14日間無料で始める
          </Link>

          {/* 副 CTA */}
          <Link
            href="#features"
            style={{
              display: 'block',
              width: '100%',
              background: 'transparent',
              color: '#fff',
              padding: 'clamp(14px, 2vw, 18px) clamp(32px, 5vw, 48px)',
              borderRadius: 8,
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(0.95rem, 1.5vw, 1.125rem)',
              fontWeight: 500,
              textDecoration: 'none',
              border: '2px solid #fff',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            デモを見る
          </Link>
        </div>
      </div>
    </section>
  )
}
