import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '決済完了 | SalonRink - LINE予約自動化SaaS',
  description: 'SalonRink のサブスクリプション契約が完了しました。',
  robots: { index: false, follow: false },
}

export default function SuccessPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F8F4EF',
        fontFamily: 'Georgia, serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 16,
          padding: '40px 32px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 48,
            marginBottom: 24,
            lineHeight: 1,
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: '#1A1018',
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          ご契約ありがとうございます
        </h1>

        <p
          style={{
            fontSize: 13,
            color: '#888',
            lineHeight: 1.8,
            marginBottom: 32,
          }}
        >
          SalonRink のサブスクリプションが確定しました。
          <br />
          14日間の無料トライアル期間をお楽しみください。
        </p>

        <a
          href="https://lin.ee/545fncvi"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '14px',
            borderRadius: 10,
            border: 'none',
            background: '#06C755',
            color: '#fff',
            fontSize: 14,
            textDecoration: 'none',
            fontFamily: 'sans-serif',
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          LINE公式アカウントと連携する →
        </a>

        <Link
          href="/dashboard"
          style={{
            display: 'block',
            padding: '14px',
            borderRadius: 10,
            border: 'none',
            background: '#1A1018',
            color: '#FAF6EE',
            fontSize: 14,
            textDecoration: 'none',
            fontFamily: 'sans-serif',
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          ダッシュボードへ
        </Link>

        <Link
          href="/"
          style={{
            display: 'block',
            padding: '12px',
            fontSize: 13,
            color: '#B8966A',
            textDecoration: 'none',
          }}
        >
          トップページに戻る
        </Link>
      </div>
    </main>
  )
}
