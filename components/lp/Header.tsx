'use client'

import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      style={{
        background: 'linear-gradient(135deg, #9dbddb 0%, #7da5c7 100%)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
        <div
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '2px',
          }}
        >
          SalonRink
        </div>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            gap: '24px',
            color: '#ffffff',
            fontSize: '14px',
            alignItems: 'center',
          }}
          className="hidden md:flex"
        >
          <a href="#features" style={{ textDecoration: 'none', color: 'inherit' }}>
            機能
          </a>
          <a href="#pricing" style={{ textDecoration: 'none', color: 'inherit' }}>
            料金
          </a>
          <a href="#case-study" style={{ textDecoration: 'none', color: 'inherit' }}>
            導入事例
          </a>
          <a href="#faq" style={{ textDecoration: 'none', color: 'inherit' }}>
            FAQ
          </a>
          <a
            href="/login"
            style={{
              textDecoration: 'none',
              color: '#ffffff',
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
            }}
          >
            ログイン
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
          }}
          className="md:hidden flex"
        >
          <div style={{ width: 24, height: 2, background: '#ffffff' }} />
          <div style={{ width: 24, height: 2, background: '#ffffff' }} />
          <div style={{ width: 24, height: 2, background: '#ffffff' }} />
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '16px',
            color: '#ffffff',
            fontSize: '14px',
          }}
        >
          <a href="#features" style={{ textDecoration: 'none', color: 'inherit' }}>
            機能
          </a>
          <a href="#pricing" style={{ textDecoration: 'none', color: 'inherit' }}>
            料金
          </a>
          <a href="#case-study" style={{ textDecoration: 'none', color: 'inherit' }}>
            導入事例
          </a>
          <a href="#faq" style={{ textDecoration: 'none', color: 'inherit' }}>
            FAQ
          </a>
          <a
            href="/login"
            style={{
              textDecoration: 'none',
              color: '#ffffff',
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '999px',
              display: 'inline-block',
              width: 'fit-content',
            }}
          >
            ログイン
          </a>
        </nav>
      )}
    </header>
  )
}
