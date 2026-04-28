'use client'

import Image from 'next/image'

export default function FooterCTA() {
  return (
    <section style={{ position: 'relative', padding: '80px 20px', overflow: 'hidden' }}>
      {/* 背景画像 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image
          src="/images/lp/footer-cta.webp"
          alt=""
          fill
          style={{ objectFit: 'cover', opacity: 0.5 }}
          aria-hidden="true"
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255, 255, 255, 0.7)' }} />
      </div>

      {/* コンテンツ */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#d88896', marginBottom: '12px' }}>
          GET STARTED
        </p>
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: '#1a2c4f',
            marginBottom: '16px',
            lineHeight: 1.4,
          }}
        >
          サロン経営の新しい軸を、<br />今日から始める。
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: '#5a6878',
            marginBottom: '40px',
          }}
        >
          月額¥980〜・初期費用無料・最短当日からスタート
        </p>
        <a
          href="/register"
          style={{
            display: 'inline-block',
            padding: '16px 40px',
            borderRadius: '999px',
            fontWeight: 600,
            fontSize: '16px',
            textDecoration: 'none',
            color: '#ffffff',
            backgroundColor: '#1a2c4f',
            transition: 'transform 0.3s',
            boxShadow: '0 4px 12px rgba(26, 44, 79, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          無料で始める
        </a>
      </div>
    </section>
  )
}
