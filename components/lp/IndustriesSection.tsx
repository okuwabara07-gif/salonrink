'use client'

import Image from 'next/image'

// SVGアイコンコンポーネント
function ScissorsIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path
        d="M10 15c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm20-6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 8l-7 6 8 8-8 8 7 6 15-14z"
        fill="currentColor"
      />
    </svg>
  )
}

function BarberPoleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="8" y="6" width="24" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="6" x2="12" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="16" y1="6" x2="16" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="20" y1="6" x2="20" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="24" y1="6" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="28" y1="6" x2="28" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path
        d="M20 5L25.5 18.5H40L30 27L35.5 40.5L20 32L4.5 40.5L10 27L0 18.5H14.5L20 5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function FaceIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="2" />
      <circle cx="15" cy="17" r="2" fill="currentColor" />
      <circle cx="25" cy="17" r="2" fill="currentColor" />
      <path d="M15 25Q20 28 25 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path
        d="M20 12C10 12 3 20 3 20C3 20 10 28 20 28C30 28 37 20 37 20C37 20 30 12 20 12ZM20 25C17.24 25 15 22.76 15 20C15 17.24 17.24 15 20 15C22.76 15 25 17.24 25 20C25 22.76 22.76 25 20 25Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CircleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <line x1="20" y1="8" x2="20" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusCircleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2" />
      <line x1="20" y1="14" x2="20" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function IndustriesSection() {
  const industries = [
    {
      name: '美容室',
      image: '/images/lp/industry-hair.webp',
      Icon: ScissorsIcon,
    },
    {
      name: '理容室',
      image: '/images/lp/industry-barber.webp',
      Icon: BarberPoleIcon,
    },
    {
      name: 'ネイルサロン',
      image: '/images/lp/industry-nail.webp',
      Icon: StarIcon,
    },
    {
      name: 'エステ',
      image: '/images/lp/industry-esthetic.webp',
      Icon: FaceIcon,
    },
    {
      name: 'アイラッシュ',
      image: '/images/lp/industry-eyelash.webp',
      Icon: EyeIcon,
    },
    {
      name: '脱毛サロン',
      image: '/images/lp/industry-clinic.webp',
      Icon: CircleIcon,
    },
    {
      name: '整体・リラク',
      image: '/images/lp/industry-wellness.webp',
      Icon: CrossIcon,
    },
    {
      name: 'その他サービス',
      image: '/images/lp/industry-other.webp',
      Icon: PlusCircleIcon,
    },
  ]

  return (
    <section
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
            marginBottom: '16px',
          }}
        >
          対応している業種
        </h2>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--sr-text-soft)',
            marginBottom: '60px',
            fontSize: '16px',
          }}
        >
          美容系・健康系・リラクゼーション系、多様な業種に対応
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '20px',
          }}
        >
          {industries.map((ind, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1/1',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {/* 背景画像 */}
              <Image
                src={ind.image}
                alt={ind.name}
                fill
                loading="lazy"
                style={{
                  objectFit: 'cover',
                }}
              />

              {/* 下部30%の文字帯 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '30%',
                  background: 'linear-gradient(to bottom, rgba(157, 189, 219, 0.95) 0%, rgba(157, 189, 219, 1) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  zIndex: 2,
                  padding: '16px',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    color: 'var(--sr-blue-pale)',
                    fontSize: '20px',
                  }}
                >
                  <ind.Icon />
                </div>
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {ind.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
