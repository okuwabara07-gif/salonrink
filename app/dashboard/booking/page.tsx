'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ViewMode = 'day' | 'week' | 'month'

export default function BookingPage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [filterSource, setFilterSource] = useState<'all' | 'line' | 'hotpepper' | 'manual'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // サロン情報取得
      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle()

      if (!salon) {
        setLoading(false)
        return
      }

      setSalonId(salon.id)
      await fetchReservations(salon.id)
    }

    loadData()
  }, [])

  const fetchReservations = async (id: string) => {
    const supabase = await createClient()
    const now = new Date()
    let from = new Date()
    let to = new Date()

    if (viewMode === 'day') {
      to.setDate(to.getDate() + 1)
    } else if (viewMode === 'week') {
      from.setDate(from.getDate() - from.getDay())
      to.setDate(from.getDate() + 7)
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), 1)
      to = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }

    let query = supabase
      .from('reservations')
      .select('*')
      .eq('salon_id', id)
      .gte('scheduled_at', from.toISOString().split('T')[0])
      .lt('scheduled_at', to.toISOString().split('T')[0])

    if (filterSource !== 'all') {
      query = query.eq('source', filterSource)
    }

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }

    const { data } = await query.order('scheduled_at', { ascending: true })
    setReservations(data || [])
    setLoading(false)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    if (salonId) fetchReservations(salonId)
  }

  const handleFilterChange = () => {
    if (salonId) fetchReservations(salonId)
  }

  const getSourceBadge = (source?: string) => {
    const sources: Record<string, { emoji: string; label: string; color: string }> = {
      line: { emoji: '💬', label: 'LINE', color: '#00B900' },
      hotpepper: { emoji: '🔗', label: 'HPB', color: '#FF6B6B' },
      manual: { emoji: '✏️', label: '手動', color: '#666' },
    }
    const s = sources[source || 'manual']
    return s ? `${s.emoji} ${s.label}` : '手動'
  }

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      confirmed: '#2E7D32',
      completed: '#1976D2',
      cancelled: '#C62828',
    }
    return colors[status || 'confirmed'] || '#666'
  }

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      confirmed: '確定',
      completed: '完了',
      cancelled: 'キャンセル',
    }
    return labels[status || 'confirmed'] || '保留'
  }

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
        予約管理
      </h1>

      {/* ビューモード切り替え */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => handleViewModeChange(mode)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: viewMode === mode ? 'none' : '1px solid #E0D8D0',
              background: viewMode === mode ? '#1A1018' : '#fff',
              color: viewMode === mode ? '#FAF6EE' : '#1A1018',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {mode === 'day' ? '日' : mode === 'week' ? '週' : '月'}
          </button>
        ))}
      </div>

      {/* フィルタ */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            ソース
          </label>
          <select
            value={filterSource}
            onChange={(e) => {
              setFilterSource(e.target.value as any)
              handleFilterChange()
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #E0D8D0',
              fontSize: 12,
              fontFamily: 'inherit',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="all">全て</option>
            <option value="line">LINE</option>
            <option value="hotpepper">ホットペッパー</option>
            <option value="manual">手動</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            ステータス
          </label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any)
              handleFilterChange()
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #E0D8D0',
              fontSize: 12,
              fontFamily: 'inherit',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="all">全て</option>
            <option value="confirmed">確定</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>
      </div>

      {/* 予約一覧 */}
      {reservations.length > 0 ? (
        <div style={{
          display: 'grid',
          gap: 12,
        }}>
          {reservations.map(reservation => (
            <div
              key={reservation.id}
              onClick={() => setSelectedReservation(reservation)}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid #F0EAE3',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1018', margin: '0 0 4px 0' }}>
                    {new Date(reservation.scheduled_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 〜
                  </p>
                  <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                    {reservation.customer_name || 'ゲスト'}
                  </p>
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  background: getStatusColor(reservation.status) + '20',
                  color: getStatusColor(reservation.status),
                }}>
                  {getStatusLabel(reservation.status)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {reservation.menu && <p style={{ margin: 0 }}>{reservation.menu}</p>}
                  <p style={{ margin: '4px 0 0 0' }}>{getSourceBadge(reservation.source)}</p>
                </div>
                {reservation.price && (
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                    ¥{reservation.price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
            この期間の予約はありません
          </p>
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedReservation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setSelectedReservation(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              maxWidth: 500,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1A1018', marginBottom: 20 }}>
              予約詳細
            </h2>

            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
                  時間
                </p>
                <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                  {new Date(selectedReservation.scheduled_at).toLocaleDateString('ja-JP')} {new Date(selectedReservation.scheduled_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
                  顧客名
                </p>
                <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                  {selectedReservation.customer_name || '—'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
                  メニュー
                </p>
                <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                  {selectedReservation.menu || '—'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
                  ステータス
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  background: getStatusColor(selectedReservation.status) + '20',
                  color: getStatusColor(selectedReservation.status),
                }}>
                  {getStatusLabel(selectedReservation.status)}
                </span>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
                  ソース
                </p>
                <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                  {getSourceBadge(selectedReservation.source)}
                </p>
              </div>

              {selectedReservation.price && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
                    金額
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', margin: 0 }}>
                    ¥{selectedReservation.price.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedReservation(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: 'none',
                background: '#1A1018',
                color: '#FAF6EE',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
