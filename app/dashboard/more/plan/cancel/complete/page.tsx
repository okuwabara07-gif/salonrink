'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  current_period_end: string
  cancel_at_period_end: boolean
}

export default function CompletePage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [reactivating, setReactivating] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('current_period_end, cancel_at_period_end')
        .eq('user_id', user.id)
        .maybeSingle()

      if (subData) {
        setSubscription(subData as Subscription)
      } else {
        router.push('/dashboard/more/plan')
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleReactivate = async () => {
    setReactivating(true)
    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ ok: false, text: data.error || '再開処理に失敗しました' })
      } else {
        setMessage({ ok: true, text: 'サブスクリプションを再開しました' })
        setTimeout(() => {
          router.push('/dashboard/more/plan')
        }, 1500)
      }
    } catch (error) {
      setMessage({ ok: false, text: 'エラーが発生しました' })
    } finally {
      setReactivating(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#F8F4EF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ color: '#888' }}>読み込み中...</div>
      </main>
    )
  }

  if (!subscription) {
    return (
      <main style={{ minHeight: '100vh', background: '#F8F4EF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ color: '#888' }}>サブスクリプション情報が見つかりません</div>
      </main>
    )
  }

  const endDate = new Date(subscription.current_period_end).toLocaleDateString('ja-JP')

  return (
    <main style={{ minHeight: '100vh', background: '#F8F4EF', fontFamily: '"Hiragino Sans", "Yu Gothic", sans-serif', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 40,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#E8F5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 28,
          }}>
            ✓
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#1A1018', margin: '0 0 16px 0' }}>
            解約が確定しました
          </h1>

          <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px 0', lineHeight: 1.8 }}>
            このサービスは <br />
            <span style={{ fontWeight: 500, color: '#1A1018' }}>{endDate}</span>
            <br />
            までご利用いただけます
          </p>

          {message && (
            <div style={{
              background: message.ok ? '#E8F5E9' : '#FFEBEE',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              color: message.ok ? '#2E7D32' : '#C62828',
              fontSize: 13,
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
            <button
              onClick={handleReactivate}
              disabled={reactivating}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 10,
                border: '1px solid #B8966A',
                background: '#fff',
                color: '#B8966A',
                fontSize: 14,
                fontWeight: 500,
                cursor: reactivating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: reactivating ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!reactivating) {
                  e.currentTarget.style.background = '#B8966A'
                  e.currentTarget.style.color = '#FAF6EE'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.color = '#B8966A'
              }}
            >
              {reactivating ? '処理中...' : '解約を取り消す'}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 10,
                border: 'none',
                background: '#1A1018',
                color: '#FAF6EE',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              ダッシュボードに戻る
            </button>
          </div>

          <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
            何かご不明な点があればお気軽にお問い合わせください
          </p>
        </div>
      </div>
    </main>
  )
}
