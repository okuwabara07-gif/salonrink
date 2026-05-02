'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AIWarningsSection, AISummarySection, CommunicationScriptSection, NextRecommendationSection } from '@/components/dashboard/AISection'

interface Salon {
  id: string
  name: string
  owner_name: string
  plan: string
}

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params?.customerId as string
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'recipe' | 'photos' | 'notes' | 'ai'>('info')
  const [customer, setCustomer] = useState<any>(null)
  const [salon, setSalon] = useState<Salon | null>(null)
  const [kartes, setKartes] = useState<any[]>([])
  const [latestRecipe, setLatestRecipe] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [notesEditMode, setNotesEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [salonId, setSalonId] = useState<string>('')
  const [latestKarte, setLatestKarte] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!customerId) return

      const supabase = await createClient()

      // ユーザー認証チェック
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // サロン情報取得
      const { data: salonData } = await supabase
        .from('salons')
        .select('id, name, owner_name, plan')
        .eq('owner_user_id', user.id)
        .maybeSingle()

      if (salonData) {
        setSalon(salonData)
      }

      // 顧客情報取得
      const { data: customerData } = await supabase
        .from('customers')
        .select('id, salon_id, name, line_id, phone, last_visit, visit_count, created_at, line_user_id, line_display_name, photos')
        .eq('id', customerId)
        .maybeSingle()

      setCustomer(customerData)

      if (customerData) {
        // サロンID取得 (顧客テーブルから)
        if (customerData.salon_id) {
          setSalonId(customerData.salon_id)
        }

        // カルテ一覧取得
        const { data: kartesData } = await supabase
          .from('kartes')
          .select('*')
          .eq('customer_id', customerId)
          .order('visit_date', { ascending: false })

        setKartes(kartesData || [])

        // 最新カルテ取得 (AI表示用)
        if (kartesData && kartesData.length > 0) {
          setLatestKarte(kartesData[0])
        }

        // 最新処方取得
        const { data: recipeData } = await supabase
          .from('karte_recipes')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (recipeData && recipeData.length > 0) {
          setLatestRecipe(recipeData[0])
        }

        // 写真取得（直近3回分）
        const { data: photosData } = await supabase
          .from('karte_photos')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(6)

        setPhotos(photosData || [])

        // メモ取得（一時無効化: notes column 追加後に復活）
        // setNotes(customerData?.notes || '')
      }

      setLoading(false)
    }

    loadData()
  }, [customerId])

  useEffect(() => {
    if (!customerId || !salonId) return

    const setupRealtime = async () => {
      const supabase = await createClient()

      const channel = supabase
        .channel(`kartes:${customerId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'kartes',
            filter: `customer_id=eq.${customerId}`,
          },
          (payload: any) => {
            const updatedKarte = payload.new
            setLatestKarte((prev: any) => {
              if (prev && updatedKarte.id === prev.id) {
                return updatedKarte as typeof prev
              }
              return prev
            })
          }
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }

    let unsubscribe: (() => void) | null = null

    setupRealtime().then((cleanup) => {
      unsubscribe = cleanup
    })

    return () => {
      unsubscribe?.()
    }
  }, [customerId, salonId])

  const handleSaveNotes = async () => {
    if (!customerId) return

    setSaving(true)
    const supabase = await createClient()

    const { error } = await supabase
      .from('customers')
      .update({ notes })
      .eq('id', customerId)

    setSaving(false)
    if (!error) {
      setNotesEditMode(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>読み込み中...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 20 }}>顧客が見つかりません</p>
        <Link
          href="/dashboard/customers"
          style={{
            padding: '10px 20px',
            background: 'var(--accent-gold)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 8,
            display: 'inline-block',
          }}
        >
          顧客一覧に戻る
        </Link>
      </div>
    )
  }

  return (
    <main style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* ヘッダー - ダッシュボード同じ */}
      <div
        style={{
          background: '#fff',
          padding: 'clamp(20px, 4vw, 28px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--sr-border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          gap: 'clamp(12px, 2vw, 16px)',
        }}
      >
        <Link
          href="/dashboard/customers"
          style={{
            fontSize: '1.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            cursor: 'pointer',
            flex: '0 0 24px',
          }}
        >
          ←
        </Link>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(0.95rem, 1.8vw, 1rem)',
              color: 'var(--text-primary)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            顧客詳細
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(12px, 2vw, 16px)', alignItems: 'center' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            🔔
          </button>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {salon?.owner_name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ padding: 'clamp(20px, 4vw, 28px)', maxWidth: '1200px', margin: '0 auto' }}>
        {/* 顧客プロフィール */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 32px)' }}>
          <div
            style={{
              width: 'clamp(80px, 15vw, 120px)',
              height: 'clamp(80px, 15vw, 120px)',
              borderRadius: '50%',
              background: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              margin: '0 auto clamp(16px, 2vw, 20px)',
            }}
          >
            {customer.name?.charAt(0) || '—'}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-noto-serif-jp)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 500,
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: '8px',
            }}
          >
            {customer.name || '—'}様
          </h1>

          {/* 一時無効化: tags column 追加後に復活
          {customer.tags && customer.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
              {customer.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--accent-gold)',
                    color: '#fff',
                    padding: 'clamp(4px, 1vw, 6px) clamp(10px, 2vw, 14px)',
                    borderRadius: 12,
                    fontSize: 'clamp(0.75rem, 1.3vw, 0.875rem)',
                    fontWeight: 500,
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          */}
        </div>

        {/* タブナビゲーション */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '2px solid var(--sr-border)',
            marginBottom: 'clamp(24px, 4vw, 32px)',
            overflowX: 'auto',
            paddingBottom: '0',
          }}
        >
          {(['info', 'history', 'recipe', 'photos', 'notes', 'ai'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: 'clamp(12px, 2vw, 16px) clamp(12px, 2vw, 18px)',
                fontSize: 'clamp(0.8rem, 1.4vw, 0.9rem)',
                fontWeight: 500,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab ? '3px solid var(--accent-gold)' : 'none',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-noto-sans-jp)',
                whiteSpace: 'nowrap',
              }}
            >
              {tab === 'info' && '基本情報'}
              {tab === 'history' && '履歴'}
              {tab === 'recipe' && '処方'}
              {tab === 'photos' && '写真'}
              {tab === 'notes' && 'メモ'}
              {tab === 'ai' && 'AI'}
            </button>
          ))}
        </div>

        {/* 基本情報タブ */}
        {activeTab === 'info' && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(20px, 3vw, 28px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(20px, 3vw, 24px)',
            }}
          >
            {customer.phone && (
              <div>
                <p
                  style={{
                    fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    margin: '0 0 8px 0',
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  電話番号
                </p>
                <p
                  style={{
                    fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {customer.phone}
                </p>
              </div>
            )}

            {customer.email && (
              <div>
                <p
                  style={{
                    fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    margin: '0 0 8px 0',
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  メール
                </p>
                <p
                  style={{
                    fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {customer.email}
                </p>
              </div>
            )}

            {customer.birth_date && (
              <div>
                <p
                  style={{
                    fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    margin: '0 0 8px 0',
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  誕生日
                </p>
                <p
                  style={{
                    fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {new Date(customer.birth_date).toLocaleDateString('ja-JP')}
                </p>
              </div>
            )}

            {customer.first_visit && (
              <div>
                <p
                  style={{
                    fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    margin: '0 0 8px 0',
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  初回来店日
                </p>
                <p
                  style={{
                    fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {new Date(customer.first_visit).toLocaleDateString('ja-JP')}
                </p>
              </div>
            )}

            {customer.allergies && (
              <div
                style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  borderLeft: '4px solid var(--accent-gold)',
                  padding: 'clamp(12px, 2vw, 16px)',
                  borderRadius: 8,
                }}
              >
                <p
                  style={{
                    fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                    fontWeight: 600,
                    color: 'var(--accent-gold)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    margin: '0 0 8px 0',
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  ⚠️ アレルギー情報
                </p>
                <p
                  style={{
                    fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                    color: 'var(--text-primary)',
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {customer.allergies}
                </p>
              </div>
            )}

            <div>
              <p
                style={{
                  fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  margin: '0 0 8px 0',
                  fontFamily: 'var(--font-noto-sans-jp)',
                }}
              >
                来店回数
              </p>
              <p
                style={{
                  fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {customer.visit_count || 0}回
              </p>
            </div>

            <div>
              <p
                style={{
                  fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  margin: '0 0 8px 0',
                  fontFamily: 'var(--font-noto-sans-jp)',
                }}
              >
                総売上
              </p>
              {/* 一時無効化: total_spent column 追加後に復活
              <p
                style={{
                  fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                ¥{(customer.total_spent || 0).toLocaleString()}
              </p>
              */}
            </div>
          </div>
        )}

        {/* 施術履歴タブ */}
        {activeTab === 'history' && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(16px, 2.5vw, 20px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              overflowX: 'auto',
            }}
          >
            {kartes.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sr-border)' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: 'clamp(10px, 2vw, 14px)',
                        fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontFamily: 'var(--font-noto-sans-jp)',
                      }}
                    >
                      日付
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: 'clamp(10px, 2vw, 14px)',
                        fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontFamily: 'var(--font-noto-sans-jp)',
                      }}
                    >
                      メニュー
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: 'clamp(10px, 2vw, 14px)',
                        fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontFamily: 'var(--font-noto-sans-jp)',
                      }}
                    >
                      スタッフ
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: 'clamp(10px, 2vw, 14px)',
                        fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontFamily: 'var(--font-noto-sans-jp)',
                      }}
                    >
                      金額
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kartes.map((karte, i) => (
                    <tr
                      key={karte.id}
                      style={{
                        borderBottom: i < kartes.length - 1 ? '1px solid var(--sr-border)' : 'none',
                      }}
                    >
                      <td
                        style={{
                          padding: 'clamp(10px, 2vw, 14px)',
                          fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {new Date(karte.visit_date).toLocaleDateString('ja-JP')}
                      </td>
                      <td
                        style={{
                          padding: 'clamp(10px, 2vw, 14px)',
                          fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {karte.menu_name || '—'}
                      </td>
                      <td
                        style={{
                          padding: 'clamp(10px, 2vw, 14px)',
                          fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {karte.staff_name || '—'}
                      </td>
                      <td
                        style={{
                          padding: 'clamp(10px, 2vw, 14px)',
                          fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                          color: 'var(--text-primary)',
                          textAlign: 'right',
                        }}
                      >
                        ¥{(karte.total_price || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p
                style={{
                  fontSize: 'clamp(0.85rem, 1.5vw, 0.9375rem)',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  padding: 'clamp(20px, 3vw, 24px)',
                  margin: 0,
                  fontFamily: 'var(--font-noto-sans-jp)',
                }}
              >
                施術履歴がありません
              </p>
            )}
          </div>
        )}

        {/* 処方レシピタブ */}
        {activeTab === 'recipe' && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(20px, 3vw, 28px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            {latestRecipe ? (
              <div>
                <p
                  style={{
                    fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    margin: '0 0 16px 0',
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  最新処方
                </p>
                <pre
                  style={{
                    background: 'rgba(212, 175, 55, 0.08)',
                    borderRadius: 8,
                    padding: 'clamp(12px, 2vw, 16px)',
                    overflow: 'auto',
                    fontSize: 'clamp(0.75rem, 1.3vw, 0.825rem)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    margin: '0 0 16px 0',
                  }}
                >
                  {JSON.stringify(latestRecipe.recipe_data, null, 2)}
                </pre>
                {latestRecipe.notes && (
                  <div>
                    <p
                      style={{
                        fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        margin: '0 0 8px 0',
                        fontFamily: 'var(--font-noto-sans-jp)',
                      }}
                    >
                      メモ
                    </p>
                    <p
                      style={{
                        fontSize: 'clamp(0.85rem, 1.5vw, 0.9375rem)',
                        color: 'var(--text-primary)',
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {latestRecipe.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p
                style={{
                  fontSize: 'clamp(0.85rem, 1.5vw, 0.9375rem)',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  padding: 'clamp(20px, 3vw, 24px)',
                  margin: 0,
                  fontFamily: 'var(--font-noto-sans-jp)',
                }}
              >
                処方レシピがまだ登録されていません
              </p>
            )}
          </div>
        )}

        {/* 写真タブ */}
        {activeTab === 'photos' && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(20px, 3vw, 28px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            {photos.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px, 30%, 200px), 1fr))',
                  gap: 'clamp(12px, 2vw, 16px)',
                }}
              >
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      background: 'rgba(212, 175, 55, 0.08)',
                      borderRadius: 8,
                      padding: 8,
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {photo.public_url ? (
                      <img
                        src={photo.public_url}
                        alt={photo.photo_type}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>画像なし</p>
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: photo.photo_type === 'before' ? '#2196F3' : '#4CAF50',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)',
                        fontWeight: 500,
                      }}
                    >
                      {photo.photo_type === 'before' ? 'Before' : 'After'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  fontSize: 'clamp(0.85rem, 1.5vw, 0.9375rem)',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  padding: 'clamp(20px, 3vw, 24px)',
                  margin: 0,
                  fontFamily: 'var(--font-noto-sans-jp)',
                }}
              >
                写真がまだアップロードされていません
              </p>
            )}
          </div>
        )}

        {/* メモタブ */}
        {activeTab === 'notes' && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(20px, 3vw, 28px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            {notesEditMode ? (
              <>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 'clamp(200px, 40vh, 300px)',
                    padding: 'clamp(12px, 2vw, 16px)',
                    borderRadius: 8,
                    border: '1px solid var(--sr-border)',
                    fontSize: 'clamp(0.85rem, 1.5vw, 0.9375rem)',
                    fontFamily: 'var(--font-noto-sans-jp)',
                    boxSizing: 'border-box',
                    marginBottom: 'clamp(12px, 2vw, 16px)',
                  }}
                />
                <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: 'clamp(10px, 2vw, 14px)',
                      borderRadius: 8,
                      border: 'none',
                      background: saving ? 'var(--sr-border)' : 'var(--accent-gold)',
                      color: saving ? 'var(--text-secondary)' : '#fff',
                      fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                      fontWeight: 500,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-noto-sans-jp)',
                    }}
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={() => setNotesEditMode(false)}
                    style={{
                      flex: 1,
                      padding: 'clamp(10px, 2vw, 14px)',
                      borderRadius: 8,
                      border: '1px solid var(--sr-border)',
                      background: '#fff',
                      color: 'var(--text-primary)',
                      fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-noto-sans-jp)',
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    minHeight: 'clamp(150px, 30vh, 200px)',
                    padding: 'clamp(12px, 2vw, 16px)',
                    background: 'rgba(212, 175, 55, 0.08)',
                    borderRadius: 8,
                    marginBottom: 'clamp(12px, 2vw, 16px)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  <p
                    style={{
                      fontSize: 'clamp(0.85rem, 1.5vw, 0.9375rem)',
                      color: notes ? 'var(--text-primary)' : 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {notes || 'メモはまだありません'}
                  </p>
                </div>
                <button
                  onClick={() => setNotesEditMode(true)}
                  style={{
                    padding: 'clamp(10px, 2vw, 14px) clamp(16px, 3vw, 20px)',
                    borderRadius: 8,
                    border: '1px solid var(--accent-gold)',
                    background: 'transparent',
                    color: 'var(--accent-gold)',
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  編集
                </button>
              </>
            )}
          </div>
        )}

        {/* AI機能タブ */}
        {activeTab === 'ai' && (
          <div>
            {latestKarte ? (
              <div>
                <AIWarningsSection
                  karte={latestKarte}
                  customerId={customerId}
                  salonId={salonId}
                  karteId={latestKarte.id}
                  onRefresh={() => window.location.reload()}
                />
                <AISummarySection
                  karte={latestKarte}
                  customerId={customerId}
                  salonId={salonId}
                  karteId={latestKarte.id}
                  onRefresh={() => window.location.reload()}
                />
                <CommunicationScriptSection
                  karte={latestKarte}
                  customerId={customerId}
                  salonId={salonId}
                  karteId={latestKarte.id}
                  onRefresh={() => window.location.reload()}
                />
                <NextRecommendationSection
                  karte={latestKarte}
                  customerId={customerId}
                  salonId={salonId}
                  karteId={latestKarte.id}
                  onRefresh={() => window.location.reload()}
                />
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 'clamp(32px, 5vw, 40px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: 'clamp(0.85rem, 1.5vw, 0.9375rem)',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  カルテを先に作成してください
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* フローティングボタン - 履歴タブで表示 */}
      {activeTab === 'history' && (
        <Link
          href={`/dashboard/customers/${customerId}/karte/new`}
          style={{
            position: 'fixed',
            bottom: 'clamp(100px, 12vh, 120px)',
            right: 'clamp(16px, 3vw, 24px)',
            width: 'clamp(56px, 12vw, 64px)',
            height: 'clamp(56px, 12vw, 64px)',
            borderRadius: '50%',
            background: 'var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: '#fff',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
            transition: 'all 0.2s ease',
            zIndex: 15,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(212, 175, 55, 0.4)'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 175, 55, 0.3)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          +
        </Link>
      )}

      {/* ボトムナビゲーション */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid var(--sr-border)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '12px 0',
          zIndex: 20,
        }}
      >
        {[
          { icon: '🏠', label: 'ホーム', href: '/dashboard' },
          { icon: '📅', label: '予約', href: '/dashboard/booking' },
          { icon: '📋', label: 'カルテ', href: '/dashboard/customers' },
          { icon: '📊', label: '分析', href: '/dashboard' },
          { icon: '⚙️', label: '設定', href: '/dashboard/more/settings' },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontSize: 'clamp(0.7rem, 1.2vw, 0.8rem)',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-gold)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}
