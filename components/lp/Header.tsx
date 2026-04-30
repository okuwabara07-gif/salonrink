'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      style={{
        background: 'transparent',
        padding: 'clamp(16px, 3vw, 24px) clamp(20px, 5vw, 60px)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
              fontWeight: 400,
              color: '#ffffff',
              fontFamily: 'var(--font-noto-serif-jp)',
              letterSpacing: 0.05,
            }}
          >
            SalonRink
          </div>
        </Link>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: 0,
          }}
          aria-label="Menu"
        >
          <div style={{ width: 24, height: 2, background: '#ffffff' }} />
          <div style={{ width: 24, height: 2, background: '#ffffff' }} />
          <div style={{ width: 24, height: 2, background: '#ffffff' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(12px, 2vw, 16px)',
            marginTop: 'clamp(16px, 2vw, 20px)',
            paddingTop: 'clamp(16px, 2vw, 20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            fontSize: 'clamp(0.95rem, 1.8vw, 1rem)',
          }}
        >
          <a
            href="#features"
            style={{
              textDecoration: 'none',
              color: '#ffffff',
              opacity: 0.9,
            }}
            onClick={() => setMenuOpen(false)}
          >
            機能
          </a>
          <a
            href="#pricing"
            style={{
              textDecoration: 'none',
              color: '#ffffff',
              opacity: 0.9,
            }}
            onClick={() => setMenuOpen(false)}
          >
            料金
          </a>
          <a
            href="#case-study"
            style={{
              textDecoration: 'none',
              color: '#ffffff',
              opacity: 0.9,
            }}
            onClick={() => setMenuOpen(false)}
          >
            導入事例
          </a>
          <a
            href="/login"
            style={{
              textDecoration: 'none',
              color: '#ffffff',
              opacity: 0.9,
            }}
            onClick={() => setMenuOpen(false)}
          >
            ログイン
          </a>
          <Link
            href="/register"
            style={{
              textDecoration: 'none',
              background: '#1A1018',
              color: '#ffffff',
              padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)',
              borderRadius: 8,
              fontWeight: 500,
              textAlign: 'center',
              display: 'block',
              marginTop: 'clamp(8px, 1vw, 12px)',
            }}
            onClick={() => setMenuOpen(false)}
          >
            14日間無料で試す
          </Link>
        </nav>
      )}
    </header>
  )
}
