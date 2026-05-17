'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PLANS as CANON } from '@/lib/plans'

interface Subscription {
  stripe_subscription_id: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
}

// Phase2 canonical: lib/plans.ts を単一ソースに参照。large は廃止 (LP3プラン)。
const PLANS = [
  { id: CANON.FREELANCE.stripeId, name: CANON.FREELANCE.displayName, price: CANON.FREELANCE.price, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC || '', description: CANON.FREELANCE.description },
  { id: CANON.STANDARD.stripeId, name: CANON.STANDARD.displayName, price: CANON.STANDARD.price, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SMALL || '', description: CANON.STANDARD.description },
  { id: CANON.PRO.stripeId, name: CANON.PRO.displayName, price: CANON.PRO.price, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MEDIUM || '', description: CANON.PRO.description },
]

const FREE_PLAN = { id: CANON.FREE.stripeId, name: CANON.FREE.displayName, price: CANON.FREE.price, priceId: '', description: CANON.FREE.description }

export default function PlanPage() {
  const router = useRouter()
  const [salonId, setSalonId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // サロン情報取得
      const { data: salon } = await supabase
        .from('salons')
        .select('id, plan')
        .eq('owner_user_id', user.id)
        .maybeSingle()

      if (!salon) {
        setLoading(false)
        return
      }

      setSalonId(salon.id)
      setCurrentPlan(salon.plan || 'free')
      setSelectedPlan(salon.plan || 'free')

      // サブスクリプション情報取得
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id, status, current_period_end, cancel_at_period_end')
        .eq('user_id', user.id)
        .maybeSingle()

      if (subData) {
        setSubscription(subData as Subscription)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const handlePlanChange = async () => {
    if (selectedPlan === currentPlan) {
      setMessage({ ok: false, text: '同じプランが選択されています' })
      return
    }

    const selectedPlanData = PLANS.find(p => p.id === selectedPlan)
    if (!selectedPlanData) {
      setMessage({ ok: false, text: 'プランが見つかりません' })
      return
    }

    if (!selectedPlanData.priceId && selectedPlan !== 'free') {
      setMessage({ ok: false, text: 'このプランは現在利用できません' })
      return
    }

    if (selectedPlan === 'free') {
      // フリープランへの切り替え
      setMessage({ ok: true, text: 'フリープランにダウングレードします。サポートにお問い合わせください。' })
      return
    }

    // Stripe Checkout へリダイレクト
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ ok: false, text: data.error || 'プラン変更に失敗しました' })
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setMessage({ ok: false, text: 'エラーが発生しました' })
    }
  }

  const handleOpenPortal = async () => {
    if (!userId) {
      setMessage({ ok: false, text: 'ユーザー情報が見つかりません' })
      return
    }

    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (response.status === 404) {
        setMessage({ ok: false, text: 'サブスクリプション情報が見つかりません。プランを契約してください。' })
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      setMessage({ ok: false, text: 'Portalを開けませんでした' })
    }
  }

  const handleReactivateClick = async () => {
    setUpdating(true)
    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ ok: false, text: data.error || 'サブスクリプションの再開に失敗しました' })
      } else {
        setMessage({ ok: true, text: 'サブスクリプションを再開しました' })
        setSubscription(sub => sub ? { ...sub, cancel_at_period_end: false } : null)
      }
    } catch (error) {
      setMessage({ ok: false, text: 'エラーが発生しました' })
    } finally {
      setUpdating(false)
    }
  }

  const currentPlanData = currentPlan === 'free' ? FREE_PLAN : PLANS.find(p => p.id === currentPlan)

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <main style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', marginBottom: 32 }}>
        プラン管理
      </h1>

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

      {/* セクション1：現在のプラン */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1A1018', marginBottom: 24 }}>
          現在のプラン
        </h2>

        {currentPlanData && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                プラン名
              </p>
              <p style={{ fontSize: 20, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                {currentPlanData.name}
              </p>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                月額料金
              </p>
              <p style={{ fontSize: 24, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                ¥{currentPlanData.price.toLocaleString()}
                <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>/月</span>
              </p>
            </div>

            {subscription && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #E0D8D0' }}>
                {subscription.cancel_at_period_end ? (
                  <>
                    <div style={{
                      background: '#FFF3CD',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                      borderLeft: '4px solid #FFC107',
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#856404', margin: 0, marginBottom: 4 }}>
                        解約予定
                      </p>
                      <p style={{ fontSize: 12, color: '#856404', margin: 0 }}>
                        {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')} をもってサービスを終了します
                      </p>
                    </div>

                    <button
                      onClick={handleReactivateClick}
                      disabled={updating}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 10,
                        border: 'none',
                        background: updating ? '#E0D8D0' : '#2E7D32',
                        color: updating ? '#999' : '#fff',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: updating ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {updating ? '処理中...' : 'サブスクリプションを再開'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push('/dashboard/more/plan/cancel')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 10,
                      border: '1px solid #A32D2D',
                      background: 'transparent',
                      color: '#A32D2D',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#A32D2D'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#A32D2D'
                    }}
                  >
                    プランを解約する
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* セクション2：プラン変更 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1A1018', marginBottom: 24 }}>
          プラン変更
        </h2>

        <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
          {PLANS.map(plan => (
            <label
              key={plan.id}
              style={{
                padding: 16,
                borderRadius: 12,
                border: selectedPlan === plan.id ? '2px solid #1A1018' : '1px solid #E0D8D0',
                background: selectedPlan === plan.id ? '#F5F1EC' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                gap: 12,
                alignItems: 'start',
              }}
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selectedPlan === plan.id}
                onChange={(e) => setSelectedPlan(e.target.value)}
                style={{ marginTop: 4, cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1018', margin: '0 0 4px 0' }}>
                  {plan.name}
                </p>
                <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px 0' }}>
                  {plan.description}
                </p>
                <p style={{ fontSize: 18, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                  {`¥${plan.price.toLocaleString()}/月`}
                </p>
              </div>
              {plan.id === currentPlan && (
                <span style={{
                  background: '#2E7D32',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                }}>
                  現在
                </span>
              )}
            </label>
          ))}
        </div>

        <button
          onClick={handlePlanChange}
          disabled={updating || selectedPlan === currentPlan}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 10,
            border: 'none',
            background: (updating || selectedPlan === currentPlan) ? '#E0D8D0' : '#1A1018',
            color: (updating || selectedPlan === currentPlan) ? '#999' : '#FAF6EE',
            fontSize: 14,
            fontWeight: 500,
            cursor: (updating || selectedPlan === currentPlan) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {updating ? '処理中...' : 'プランを変更する'}
        </button>
      </div>

      {/* セクション3：月額合計 */}
      {currentPlanData && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1A1018', marginBottom: 24 }}>
            月額合計
          </h2>

          <div style={{ borderTop: '2px solid #E0D8D0', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 600, color: '#1A1018' }}>
              <span>合計</span>
              <span>¥{currentPlanData.price.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: '#888', marginLeft: 4 }}>/月</span></span>
            </div>
          </div>
        </div>
      )}

      {/* セクション4：支払い情報 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1A1018', marginBottom: 24 }}>
          支払い情報
        </h2>

        <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          支払い方法やサブスクリプション情報は Stripe Customer Portal で管理できます。
        </p>

        <button
          onClick={handleOpenPortal}
          style={{
            padding: '14px 24px',
            borderRadius: 10,
            border: '1px solid #B8966A',
            background: 'transparent',
            color: '#B8966A',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#B8966A'
            e.currentTarget.style.color = '#FAF6EE'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#B8966A'
          }}
        >
          Customer Portal を開く →
        </button>
      </div>
    </main>
  )
}
