'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Addon {
  id: string
  addon_key: string
  enabled: boolean
  price: number
  label: string
  description: string
}

interface Subscription {
  stripe_subscription_id: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
}

const ADDONS_CONFIG: Addon[] = [
  { id: '1', addon_key: 'karte', enabled: true, price: 300, label: '顧客カルテ', description: '施術履歴・処方レシピ管理' },
  { id: '2', addon_key: 'ec_store', enabled: false, price: 300, label: '店販EC', description: 'オンラインショップ' },
  { id: '4', addon_key: 'points', enabled: false, price: 300, label: 'ポイントカード', description: 'デジタルポイント管理' },
  { id: '5', addon_key: 'blog', enabled: false, price: 200, label: 'ブログ発信', description: '施術ブログ自動配信' },
  { id: '6', addon_key: 'tax_report', enabled: false, price: 200, label: '売上確定申告', description: '決算書自動生成' },
  { id: '7', addon_key: 'multi_staff', enabled: false, price: 500, label: '複数スタッフ', description: 'スタッフ管理機能' },
  { id: '9', addon_key: 'beauty_column', enabled: false, price: 300, label: '美容コラム配信', description: '美容トレンド・施術コラム自動配信' },
]

const PLANS = [
  { id: 'basic', name: 'フリーランス', price: 980, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC || '', description: 'フリーランス向け' },
  { id: 'small', name: 'スタンダード', price: 2480, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SMALL || '', description: '小規模店舗向け' },
  { id: 'medium', name: 'プロ', price: 3980, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MEDIUM || '', description: 'HPB同期込み・中〜大規模向け' },
  { id: 'large', name: 'カスタム', price: 0, priceId: '', description: '大規模向け' },
]

const FREE_PLAN = { id: 'free', name: 'フリープラン', price: 0, priceId: '', description: '無料トライアル' }

export default function PlanPage() {
  const router = useRouter()
  const [salonId, setSalonId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [addons, setAddons] = useState<Addon[]>(ADDONS_CONFIG)
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

      // アドオン取得
      const { data: addonsData } = await supabase
        .from('salon_addons')
        .select('*')
        .eq('salon_id', salon.id)

      if (addonsData && addonsData.length > 0) {
        const updatedAddons = addons.map(addon => {
          const dbAddon = addonsData.find(a => a.addon_key === addon.addon_key)
          return dbAddon ? { ...addon, enabled: dbAddon.enabled } : addon
        })
        setAddons(updatedAddons)
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

  const handleAddonToggle = async (addonKey: string) => {
    if (!salonId) return

    setUpdating(true)
    setMessage(null)

    const addon = addons.find(a => a.addon_key === addonKey)
    if (!addon) return

    const supabase = await createClient()

    // salon_addons テーブルを更新
    const { error } = await supabase
      .from('salon_addons')
      .upsert(
        {
          salon_id: salonId,
          addon_key: addonKey,
          enabled: !addon.enabled,
          price: addon.price,
          enabled_at: !addon.enabled ? new Date().toISOString() : null,
          disabled_at: addon.enabled ? new Date().toISOString() : null,
        },
        { onConflict: 'salon_id,addon_key' }
      )

    setUpdating(false)

    if (error) {
      setMessage({ ok: false, text: `エラー: ${error.message}` })
    } else {
      // アドオンの状態を更新
      const updatedAddons = addons.map(a =>
        a.addon_key === addonKey ? { ...a, enabled: !a.enabled } : a
      )
      setAddons(updatedAddons)
      setMessage({ ok: true, text: 'アドオンを更新しました' })
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

  const enabledAddonsPrice = addons
    .filter(a => a.enabled)
    .reduce((sum, a) => sum + a.price, 0)

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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                  月額料金
                </p>
                <p style={{ fontSize: 24, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                  ¥{currentPlanData.price.toLocaleString()}
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>/月</span>
                </p>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                  アドオン合計
                </p>
                <p style={{ fontSize: 24, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                  ¥{enabledAddonsPrice.toLocaleString()}
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>/月</span>
                </p>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                  合計
                </p>
                <p style={{ fontSize: 24, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                  ¥{(currentPlanData.price + enabledAddonsPrice).toLocaleString()}
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>/月</span>
                </p>
              </div>
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
                  {plan.id === 'large' && <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>（要相談）</span>}
                </p>
                <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px 0' }}>
                  {plan.description}
                </p>
                <p style={{ fontSize: 18, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                  {plan.id === 'large' ? '要相談' : (plan.price === 0 ? '無料' : `¥${plan.price.toLocaleString()}/月`)}
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

      {/* セクション3：アドオン管理 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1A1018', marginBottom: 24 }}>
          アドオン管理
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E0D8D0' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  アドオン
                </th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  説明
                </th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  料金
                </th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  状態
                </th>
              </tr>
            </thead>
            <tbody>
              {addons.map((addon, i) => (
                <tr key={addon.id} style={{ borderBottom: i < addons.length - 1 ? '1px solid #F0EAE3' : 'none' }}>
                  <td style={{ padding: '12px', fontSize: 13, fontWeight: 500, color: '#1A1018' }}>
                    {addon.label}
                  </td>
                  <td style={{ padding: '12px', fontSize: 12, color: '#888' }}>
                    {addon.description}
                  </td>
                  <td style={{ padding: '12px', fontSize: 12, color: '#1A1018', textAlign: 'center' }}>
                    +¥{addon.price.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleAddonToggle(addon.addon_key)}
                      disabled={updating}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: addon.enabled ? '#2E7D32' : '#ddd',
                        color: addon.enabled ? '#fff' : '#666',
                        fontSize: 11,
                        fontWeight: 500,
                        cursor: updating ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {addon.enabled ? 'ON' : 'OFF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* セクション4：月額合計 */}
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

          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#1A1018' }}>
              <span>{currentPlanData.name}</span>
              <span>¥{currentPlanData.price.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#1A1018' }}>
              <span>アドオン ({addons.filter(a => a.enabled).length}件)</span>
              <span>¥{enabledAddonsPrice.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ borderTop: '2px solid #E0D8D0', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 600, color: '#1A1018' }}>
              <span>合計</span>
              <span>¥{(currentPlanData.price + enabledAddonsPrice).toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: '#888', marginLeft: 4 }}>/月</span></span>
            </div>
          </div>
        </div>
      )}

      {/* セクション5：支払い情報 */}
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
