'use client'

import Image from 'next/image'
import PhoneMockup from './PhoneMockup'

export default function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '60px 20px',
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

      {/* コンテンツ: 2カラムレイアウト */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* 左カラム: テキスト + CTA (60%) */}
          <div style={{ textAlign: 'left' }}>
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
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 600,
                color: '#1a2c4f',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                marginBottom: '24px',
              }}
            >
              自分らしいサロン運営へ
            </h1>

            <p
              style={{
                fontSize: 'clamp(16px, 2vw, 18px)',
                color: '#5a6878',
                lineHeight: 1.7,
                marginBottom: '32px',
              }}
            >
              LINE予約・顧客カルテ・売上管理、全部ひとつで。
              <br />
              ホットペッパーの顧客データをそのまま活用できる唯一のSaaS。
            </p>

            {/* CTA ボタン */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <a
                href="/register"
                style={{
                  background: 'linear-gradient(135deg, #f5b8b8 0%, #f0a5a5 100%)',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245,184,184,0.3)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  display: 'inline-block',
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
                  padding: '14px 32px',
                  borderRadius: '999px',
                  border: '1.5px solid rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  fontSize: '15px',
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
          </div>

          {/* 右カラム: スマホモックアップ (40%) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <PhoneMockup />
          </div>
        </div>

        {/* モバイル対応: 1カラムに切り替え */}
        <style>{`
          @media (max-width: 768px) {
            div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
            h1 {
              font-size: clamp(24px, 6vw, 36px) !important;
            }
          }
        `}</style>
      </div>
    </section>
  )
}
