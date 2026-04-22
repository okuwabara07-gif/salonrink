'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CheckoutButton({
  plan,
  style,
}: {
  plan: 'basic' | 'small' | 'medium' | 'free'
  style?: React.CSSProperties
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        alert(data.error || 'エラーが発生しました')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('処理中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const isFreeplan = plan === 'free'
  const buttonText = isFreeplan
    ? (loading ? '処理中...' : '永久無料プランで始める →')
    : (loading ? '処理中...' : '14日間無料で始める →')

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: 'block',
        padding: '12px 20px',
        background: loading ? '#ccc' : isFreeplan ? '#4CAF50' : '#1A1018',
        color: '#FAF6EE',
        textAlign: 'center',
        fontSize: 13,
        fontFamily: 'sans-serif',
        borderRadius: 6,
        letterSpacing: 1,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        width: '100%',
        ...style,
      }}
    >
      {buttonText}
    </button>
  )
}
