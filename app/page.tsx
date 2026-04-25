'use client'

import { useState } from 'react'
import { CheckoutButton } from '@/app/pricing/checkout-button'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #F2EAD8 0%, #FAF6EE 50%, #F2EAD8 100%)',
      fontFamily: 'Georgia, serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(184,150,106,.2)',
        position: 'relative',
      }}>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 300, letterSpacing: 6, color: '#1A1018' }}>
            Salon<span style={{ color: '#9B8AAB' }}>Rink</span>
          </div>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
          }}
          className="mobile-menu-btn"
        >
          <div style={{ width: 24, height: 2, background: '#1A1018' }} />
          <div style={{ width: 24, height: 2, background: '#1A1018' }} />
          <div style={{ width: 24, height: 2, background: '#1A1018' }} />
        </button>

        {/* Desktop Nav */}
        <nav style={{
          display: 'flex',
          gap: 20,
          fontSize: 13,
          color: '#7A6E64',
          fontFamily: 'sans-serif',
          alignItems: 'center',
        }}
        className="desktop-nav"
        >
          <a href="#features" style={{ textDecoration: 'none', color: 'inherit' }}>機能</a>
          <a href="/pricing" style={{ textDecoration: 'none', color: 'inherit' }}>料金</a>
          <a href="/case-studies/kirei-tsurumi" style={{ textDecoration: 'none', color: 'inherit' }}>導入事例</a>
          <a href="/faq" style={{ textDecoration: 'none', color: 'inherit' }}>FAQ</a>
          <a href="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>お問い合わせ</a>
          <a href="/login" style={{ textDecoration: 'none', color: '#B8966A', fontWeight: 600, paddingLeft: 12, borderLeft: '1px solid rgba(184,150,106,.2)' }}>ログイン</a>
        </nav>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#FAF6EE',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid rgba(184,150,106,.2)',
            fontSize: 13,
            fontFamily: 'sans-serif',
            zIndex: 100,
          }}
          className="mobile-nav"
          >
            <a href="#features" style={{ textDecoration: 'none', color: '#7A6E64' }} onClick={() => setMenuOpen(false)}>機能</a>
            <a href="/pricing" style={{ textDecoration: 'none', color: '#7A6E64' }} onClick={() => setMenuOpen(false)}>料金</a>
            <a href="/case-studies/kirei-tsurumi" style={{ textDecoration: 'none', color: '#7A6E64' }} onClick={() => setMenuOpen(false)}>導入事例</a>
            <a href="/faq" style={{ textDecoration: 'none', color: '#7A6E64' }} onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="/contact" style={{ textDecoration: 'none', color: '#7A6E64' }} onClick={() => setMenuOpen(false)}>お問い合わせ</a>
            <a href="/login" style={{ textDecoration: 'none', color: '#B8966A', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>ログイン</a>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(40px, 10vw, 80px) clamp(20px, 5vw, 40px)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 'clamp(10px, 2.5vw, 12px)',
          letterSpacing: 4,
          color: '#B8966A',
          marginBottom: 'clamp(16px, 4vw, 24px)',
          fontFamily: 'sans-serif',
          textTransform: 'uppercase',
        }}>
          Beauty × Technology
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 7vw, 48px)',
          fontWeight: 300,
          color: '#1A1018',
          letterSpacing: 2,
          lineHeight: 1.2,
          marginBottom: 'clamp(16px, 4vw, 24px)',
        }}>
          美容室経営、<br />
          もうこれ1つで完結。
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 4vw, 18px)',
          color: '#7A6E64',
          lineHeight: 1.8,
          marginBottom: 'clamp(24px, 6vw, 48px)',
          maxWidth: 600,
          fontFamily: 'sans-serif',
        }}>
          LINE予約・顧客管理・売上分析・スタッフ管理を一元化。<br />
          フリーランス美容師から多店舗チェーンまで対応。<br />
          月額 <strong style={{ color: '#1A1018' }}>¥980</strong> から。
        </p>
        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
          <a href="/register" style={{
            padding: 'clamp(12px, 3vw, 16px) clamp(24px, 8vw, 40px)',
            background: '#7A3550',
            color: '#FAF6EE',
            textDecoration: 'none',
            fontSize: 'clamp(12px, 3vw, 14px)',
            letterSpacing: 1,
            fontFamily: 'sans-serif',
            width: '100%',
            maxWidth: 300,
            textAlign: 'center',
          }}>
            14日間無料で試す
          </a>
          <a href="/pricing" style={{
            padding: 'clamp(12px, 3vw, 16px) clamp(24px, 8vw, 40px)',
            border: '1px solid #B8966A',
            color: '#7A6E64',
            textDecoration: 'none',
            fontSize: 'clamp(12px, 3vw, 14px)',
            letterSpacing: 1,
            fontFamily: 'sans-serif',
            width: '100%',
            maxWidth: 300,
            textAlign: 'center',
          }}>
            料金プランを見る
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        padding: 'clamp(40px, 10vw, 80px) clamp(20px, 5vw, 40px)',
        background: '#1A1018',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: 'clamp(24px, 6vw, 32px)',
          fontWeight: 300,
          color: '#FAF6EE',
          letterSpacing: 3,
          marginBottom: 'clamp(40px, 8vw, 60px)',
        }}>
          できること
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'clamp(16px, 4vw, 24px)',
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          {[
            { slug: 'line-reservation', icon: '📅', title: 'LINE予約', desc: 'リッチメニューからワンタップで予約。ホットペッパーとの重複もブロック。' },
            { slug: 'customer-record', icon: '📋', title: '顧客カルテ', desc: '施術履歴・AIレコメンド・ポイント管理を一元化。' },
            { slug: 'ec-store', icon: '🛍', title: 'ECストア', desc: '自社商品とアフィリを同時展開。配送も自動管理。' },
            { slug: 'review-monetization', icon: '⭐', title: '口コミ収益化', desc: '口コミページにAdSense・アフィリを自動表示。' },
            { slug: 'line-automation', icon: '💬', title: 'LINE自動化', desc: 'リマインド・失客防止・来店後フォローを自動送信。' },
            { slug: 'ai-accounting', icon: '📊', title: 'AI仕訳', desc: 'フリーランス向け売上自動集計・確定申告対応。' },
          ].map((f) => (
            <a key={f.title} href={`/features/${f.slug}`} style={{
              display: 'block',
              padding: 'clamp(20px, 5vw, 32px)',
              border: '1px solid rgba(184,150,106,.2)',
              background: 'rgba(255,255,255,.03)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 'clamp(24px, 6vw, 32px)', marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{
                fontSize: 'clamp(14px, 4vw, 18px)',
                color: '#FAF6EE',
                marginBottom: 10,
                fontWeight: 400,
                letterSpacing: 1,
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: '#A89E94',
                lineHeight: 1.7,
                fontFamily: 'sans-serif',
                marginBottom: 10,
              }}>
                {f.desc}
              </p>
              <span style={{
                fontSize: 12,
                color: '#B8966A',
                fontFamily: 'sans-serif',
                letterSpacing: 1,
              }}>
                詳しく見る →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{
        padding: 'clamp(40px, 10vw, 80px) clamp(20px, 5vw, 40px)',
        background: '#FAF6EE',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: 'clamp(24px, 6vw, 32px)',
          fontWeight: 300,
          color: '#1A1018',
          letterSpacing: 3,
          marginBottom: 'clamp(40px, 8vw, 60px)',
        }}>
          料金プラン
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'clamp(16px, 4vw, 24px)',
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          {[
            { id: 'basic', name: 'ベーシック', price: '¥980', unit: '/月', desc: '予約同期・リマインド自動送信', color: '#8B7BAA' },
            { id: 'small', name: 'スモール', price: '¥2,480', unit: '/月', desc: '＋顧客カルテ・失客アラート', color: '#B8966A', featured: true },
            { id: 'medium', name: 'ミディアム', price: '¥3,980', unit: '/月', desc: '＋売上レポート・スタッフ管理', color: '#7A3550' },
          ].map((p) => (
            <div key={p.name} style={{
              padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 24px)',
              border: `1px solid ${p.featured ? '#7A3550' : '#DDD8D0'}`,
              background: p.featured ? '#F5E8EE' : '#fff',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                color: p.color,
                letterSpacing: 1,
                marginBottom: 8,
                fontFamily: 'sans-serif',
              }}>
                {p.name}
              </div>
              <div style={{
                fontSize: 'clamp(28px, 7vw, 36px)',
                color: '#1A1018',
                marginBottom: 4,
              }}>
                {p.price}
              </div>
              <div style={{
                fontSize: 'clamp(10px, 2.5vw, 12px)',
                color: '#A89E94',
                marginBottom: 12,
                fontFamily: 'sans-serif',
              }}>
                {p.unit}
              </div>
              <div style={{
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                color: '#7A6E64',
                fontFamily: 'sans-serif',
                marginBottom: 12,
              }}>
                {p.desc}
              </div>
              <CheckoutButton plan={p.id as 'basic' | 'small' | 'medium'} style={{}} />
            </div>
          ))}
        </div>
        <p style={{
          textAlign: 'center',
          marginTop: 'clamp(24px, 6vw, 40px)',
          fontSize: 'clamp(12px, 3vw, 14px)',
          color: '#A89E94',
          fontFamily: 'sans-serif',
        }}>
          すべてのプランに30日間無料トライアル付き
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        padding: 'clamp(24px, 6vw, 40px) clamp(20px, 5vw, 40px)',
        background: '#1A1018',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: 16, lineHeight: 1 }}>
          <div style={{
            fontSize: 'clamp(18px, 5vw, 22px)',
            fontWeight: 300,
            letterSpacing: 6,
            color: '#FAF6EE',
          }}>
            Salon<span style={{ color: '#9B8AAB' }}>Rink</span>
          </div>
        </div>
        <nav style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 16,
          fontSize: 'clamp(10px, 2.5vw, 12px)',
          fontFamily: 'sans-serif',
        }}>
          <a href="/company" style={{ color: '#B8966A', textDecoration: 'none' }}>会社概要</a>
          <a href="/pricing" style={{ color: '#B8966A', textDecoration: 'none' }}>料金</a>
          <a href="/faq" style={{ color: '#B8966A', textDecoration: 'none' }}>FAQ</a>
          <a href="/case-studies/kirei-tsurumi" style={{ color: '#B8966A', textDecoration: 'none' }}>導入事例</a>
          <a href="/tokusho" style={{ color: '#B8966A', textDecoration: 'none' }}>特商法</a>
          <a href="/privacy" style={{ color: '#B8966A', textDecoration: 'none' }}>プライバシー</a>
          <a href="/agency" style={{ color: '#B8966A', textDecoration: 'none' }}>代理店向け</a>
          <a href="/contact" style={{ color: '#B8966A', textDecoration: 'none' }}>お問い合わせ</a>
        </nav>
        <p style={{
          fontSize: 'clamp(10px, 2.5vw, 12px)',
          color: '#7A6E64',
          fontFamily: 'sans-serif',
          letterSpacing: 1,
        }}>
          © 2026 AOKAE合同会社
        </p>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .desktop-nav {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
