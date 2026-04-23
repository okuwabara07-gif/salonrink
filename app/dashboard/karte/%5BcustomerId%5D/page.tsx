'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params?.customerId as string
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'recipe' | 'photos' | 'notes'>('info')
  const [customer, setCustomer] = useState<any>(null)
  const [kartes, setKartes] = useState<any[]>([])
  const [latestRecipe, setLatestRecipe] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [notesEditMode, setNotesEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!customerId) return

      const supabase = await createClient()

      // 顧客情報取得
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .maybeSingle()

      setCustomer(customerData)

      if (customerData) {
        // カルテ一覧取得
        const { data: kartesData } = await supabase
          .from('kartes')
          .select('*')
          .eq('customer_id', customerId)
          .order('visit_date', { ascending: false })

        setKartes(kartesData || [])

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

        // メモ取得
        setNotes(customerData?.notes || '')
      }

      setLoading(false)
    }

    loadData()
  }, [customerId])

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
        <p style={{ fontSize: 16, color: '#1A1018', marginBottom: 20 }}>顧客が見つかりません</p>
        <Link
          href="/dashboard/karte"
          style={{
            padding: '10px 20px',
            background: '#1A1018',
            color: '#FAF6EE',
            textDecoration: 'none',
            borderRadius: 8,
            display: 'inline-block',
          }}
        >
          カルテ一覧に戻る
        </Link>
      </div>
    )
  }

  return (
    <main style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link
          href="/dashboard/karte"
          style={{
            fontSize: 20,
            color: '#888',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          ←
        </Link>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', margin: 0 }}>
            {customer.name}
          </h1>
          {customer.age && (
            <p style={{ fontSize: 12, color: '#888', margin: '8px 0 0 0' }}>
              {customer.age}歳 {customer.gender && `• ${customer.gender}`}
            </p>
          )}
        </div>
      </div>

      {/* タブ */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid #E0D8D0',
        marginBottom: 32,
      }}>
        {(['info', 'history', 'recipe', 'photos', 'notes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px',
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === tab ? '#1A1018' : '#888',
              borderBottom: activeTab === tab ? '2px solid #1A1018' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {tab === 'info' && '基本情報'}
            {tab === 'history' && '施術履歴'}
            {tab === 'recipe' && '処方レシピ'}
            {tab === 'photos' && '写真'}
            {tab === 'notes' && 'メモ'}
          </button>
        ))}
      </div>

      {/* 基本情報タブ */}
      {activeTab === 'info' && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'grid', gap: 20 }}>
            {customer.phone && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                  電話番号
                </p>
                <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                  {customer.phone}
                </p>
              </div>
            )}

            {customer.email && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                  メール
                </p>
                <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                  {customer.email}
                </p>
              </div>
            )}

            {customer.allergies && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                  アレルギー情報
                </p>
                <p style={{ fontSize: 13, color: '#A32D2D', margin: 0 }}>
                  ⚠️ {customer.allergies}
                </p>
              </div>
            )}

            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                来店回数
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                {customer.visit_count || 0}回
              </p>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                総売上
              </p>
              <p style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                ¥{(customer.total_spent || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 施術履歴タブ */}
      {activeTab === 'history' && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          overflowX: 'auto',
        }}>
          {kartes.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E0D8D0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    日付
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    メニュー
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    スタッフ
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    金額
                  </th>
                </tr>
              </thead>
              <tbody>
                {kartes.map((karte, i) => (
                  <tr key={karte.id} style={{ borderBottom: i < kartes.length - 1 ? '1px solid #F0EAE3' : 'none' }}>
                    <td style={{ padding: '12px', fontSize: 13, color: '#1A1018' }}>
                      {new Date(karte.visit_date).toLocaleDateString('ja-JP')}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#1A1018' }}>
                      {karte.menu_name || '—'}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#1A1018' }}>
                      {karte.staff_name || '—'}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#1A1018', textAlign: 'right' }}>
                      ¥{(karte.total_price || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '20px', margin: 0 }}>
              施術履歴がありません
            </p>
          )}
        </div>
      )}

      {/* 処方レシピタブ */}
      {activeTab === 'recipe' && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          {latestRecipe ? (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px 0' }}>
                最新処方
              </p>
              <pre style={{
                background: '#F5F1EC',
                borderRadius: 8,
                padding: 16,
                overflow: 'auto',
                fontSize: 12,
                color: '#1A1018',
                fontFamily: 'monospace',
              }}>
                {JSON.stringify(latestRecipe.recipe_data, null, 2)}
              </pre>
              {latestRecipe.notes && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                    メモ
                  </p>
                  <p style={{ fontSize: 13, color: '#1A1018', margin: 0, lineHeight: 1.6 }}>
                    {latestRecipe.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '20px', margin: 0 }}>
              処方レシピがまだ登録されていません
            </p>
          )}
        </div>
      )}

      {/* 写真タブ */}
      {activeTab === 'photos' && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          {photos.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}>
              {photos.map(photo => (
                <div
                  key={photo.id}
                  style={{
                    background: '#F5F1EC',
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
                    <p style={{ color: '#888', margin: 0 }}>画像なし</p>
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
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {photo.photo_type === 'before' ? 'Before' : 'After'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '20px', margin: 0 }}>
              写真がまだアップロードされていません
            </p>
          )}
        </div>
      )}

      {/* メモタブ */}
      {activeTab === 'notes' && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          {notesEditMode ? (
            <>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: 300,
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #E0D8D0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  marginBottom: 16,
                }}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    background: saving ? '#E0D8D0' : '#1A1018',
                    color: saving ? '#999' : '#FAF6EE',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => setNotesEditMode(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid #E0D8D0',
                    background: '#fff',
                    color: '#1A1018',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  キャンセル
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{
                minHeight: 300,
                padding: 16,
                background: '#F5F1EC',
                borderRadius: 8,
                marginBottom: 16,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {notes || <span style={{ color: '#888' }}>メモはまだありません</span>}
              </div>
              <button
                onClick={() => setNotesEditMode(true)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: '1px solid #B8966A',
                  background: 'transparent',
                  color: '#B8966A',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                編集
              </button>
            </>
          )}
        </div>
      )}
    </main>
  )
}
