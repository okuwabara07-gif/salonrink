'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .hero-buttons-stack {
            flex-direction: row !important;
            gap: clamp(16px, 2vw, 24px) !important;
            align-items: center !important;
            max-width: 700px !important;
          }
          .hero-buttons-stack a {
            width: auto !important;
            flex: 0 1 auto !important;
            min-width: 180px !important;
          }
        }
      `}</style>

      <section
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 'clamp(80px, 12vw, 160px) clamp(20px, 5vw, 100px)',
          background: 'linear-gradient(135deg, #1A1612 0%, #2D2A28 50%, #4A4440 100%)',
          backgroundImage: 'url(/images/lp-redesign/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          overflow: 'hidden',
          minHeight: 'min(100vh, 700px)',
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
            background: 'linear-gradient(135deg, rgba(26, 22, 18, 0.15) 0%, rgba(45, 42, 40, 0.15) 100%)',
            zIndex: 1,
          }}
        />

        {/* コンテンツ */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            maxWidth: 700,
          }}
        >
          {/* キャッチコピー */}
          <h1
            style={{
              fontFamily: 'var(--font-noto-serif-jp)',
              fontSize: 'clamp(2.5rem, 7vw, 4rem)',
              fontWeight: 400,
              lineHeight: 1.3,
              marginBottom: 'clamp(24px, 3vw, 40px)',
              letterSpacing: 0.05,
              color: '#ffffff',
              textShadow: '0 4px 32px rgba(0,0,0,0.95), 0 2px 12px rgba(0,0,0,0.85), 0 0 6px rgba(0,0,0,0.7)',
            }}
          >
            美容師とお客様を、<br />一生でつなぐ。
          </h1>

          {/* サブタイトル */}
          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              fontWeight: 400,
              lineHeight: 1.6,
              marginBottom: 'clamp(12px, 2vw, 20px)',
              opacity: 0.95,
              color: '#ffffff',
              textShadow: '0 4px 24px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85)',
            }}
          >
            それが、SalonRink。
          </p>

          {/* 説明文 */}
          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(0.95rem, 1.8vw, 1.125rem)',
              fontWeight: 300,
              lineHeight: 1.8,
              marginBottom: 'clamp(20px, 3vw, 30px)',
              maxWidth: 700,
              opacity: 0.9,
              color: '#ffffff',
              textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.7)',
            }}
          >
            AIカルテを背に、信頼でつなぐ、<br />あなたのサロンの未来を支えます。
          </p>

          {/* 信頼指標 */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: 'clamp(40px, 5vw, 60px)',
              flexWrap: 'wrap',
              textShadow: '0 2px 12px rgba(0,0,0,0.9)',
            }}
          >
            <span>✓ 初期費用 0円</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>|</span>
            <span>✓ 最短 3分で登録</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>|</span>
            <span>✓ クレカ登録不要</span>
          </div>

          {/* CTA ボタン */}
          <div
            className="hero-buttons-stack"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(12px, 2vw, 20px)',
              alignItems: 'flex-start',
              width: '100%',
              maxWidth: 400,
            }}
          >
            {/* 主 CTA */}
            <Link
              href="/register"
              style={{
                display: 'inline-block',
                background: '#1A1410',
                color: '#fff',
                padding: 'clamp(14px, 2vw, 18px) clamp(32px, 5vw, 48px)',
                borderRadius: 8,
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.95rem, 1.5vw, 1.125rem)',
                fontWeight: 500,
                textDecoration: 'none',
                border: '2px solid #1A1410',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2D2510'
                e.currentTarget.style.borderColor = '#2D2510'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1A1410'
                e.currentTarget.style.borderColor = '#1A1410'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              14日間無料で試す
            </Link>

            {/* 副 CTA */}
            <Link
              href="#features"
              style={{
                display: 'inline-block',
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
                width: '100%',
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
    </>
  )
}
