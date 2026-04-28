'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  current_period_end: string
  trial_ends_at: string | null
}

interface Salon {
  plan: string
}

const PLANS: Record<string, string> = {
  basic: 'フリーランス',
  small: 'スタンダード',
  medium: 'プロ',
  free: 'フリープラン',
}

const CANCELLATION_REASONS = [
  '料金が高い',
  '機能が合わなかった',
  '他のサービスに乗り換える',
  '一時的に利用しない',
  '操作が難しい',
  'その他',
]

export default function CancelPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [salon, setSalon] = useState<Salon | null>(null)
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get subscription info
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('current_period_end, trial_ends_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (subData) {
        setSubscription(subData as Subscription)
      }

      // Get salon info
      const { data: salonData } = await supabase
        .from('salons')
        .select('plan')
        .eq('owner_user_id', user.id)
        .maybeSingle()

      if (salonData) {
        setSalon(salonData as Salon)
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleCancel = async () => {
    setCanceling(true)
    setMessage(null)

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancellation_reason: selectedReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ ok: false, text: data.error || '解約処理に失敗しました' })
        setCanceling(false)
        return
      }

      router.push('/dashboard/more/plan/cancel/complete')
    } catch (error) {
      setMessage({ ok: false, text: 'エラーが発生しました' })
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#F8F4EF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ color: '#888' }}>読み込み中...</div>
      </main>
    )
  }

  const planName = salon ? PLANS[salon.plan] || 'フリープラン' : 'フリープラン'
  const endDate = subscription ? new Date(subscription.current_period_end).toLocaleDateString('ja-JP') : ''
  const isOnTrial = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) > new Date() : false

  return (
    <main style={{ minHeight: '100vh', background: '#F8F4EF', fontFamily: '"Hiragino Sans", "Yu Gothic", sans-serif', padding: '40px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 400, letterSpacing: 2, color: '#1A1018', marginBottom: 32, textAlign: 'center' }}>
          プラン解約
        </h1>

        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          marginBottom: 24,
        }}>
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #E0D8D0' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
              現在のプラン
            </p>
            <p style={{ fontSize: 20, fontWeight: 500, color: '#1A1018', margin: 0, marginBottom: 16 }}>
              {planName}
            </p>

            {isOnTrial && (
              <div style={{
                background: '#E3F2FD',
                borderRadius: 8,
                padding: 12,
                borderLeft: '4px solid #2196F3',
                marginBottom: 12,
              }}>
                <p style={{ fontSize: 12, color: '#1976D2', margin: 0 }}>
                  トライアル終了時に自動解約されます
                </p>
              </div>
            )}

            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
              {endDate} まで利用可能です
            </p>
          </div>

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

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1018', marginBottom: 16 }}>
              解約理由（任意）
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CANCELLATION_REASONS.map((reason) => (
                <label
                  key={reason}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: selectedReason === reason ? '2px solid #1A1018' : '1px solid #E0D8D0',
                    background: selectedReason === reason ? '#F5F1EC' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, color: '#1A1018' }}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleCancel}
            disabled={canceling}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: canceling ? '#E0D8D0' : '#A32D2D',
              color: canceling ? '#999' : '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: canceling ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: 12,
            }}
          >
            {canceling ? '処理中...' : '解約を確定する'}
          </button>

          <button
            onClick={() => router.push('/dashboard/more/plan')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: '1px solid #E0D8D0',
              background: '#fff',
              color: '#1A1018',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F5F1EC'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff'
            }}
          >
            やっぱりやめる
          </button>
        </div>
      </div>
    </main>
  )
}
