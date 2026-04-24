'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SyncStatus {
  id: string
  salon_id: string
  status: 'healthy' | 'unhealthy' | 'maintenance'
  maintenance_mode: boolean
  last_sync_at: string | null
  last_error: string | null
  updated_at: string
}

interface SyncLog {
  id: string
  salon_id: string
  status: 'success' | 'error'
  message: string | null
  created_at: string
}

export default function SyncStatusPage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [toggling, setToggling] = useState(false)
  const [countdown, setCountdown] = useState(60)

  const loadData = async (supabase: any, salonId: string) => {
    try {
      const { data: status, error: statusError } = await supabase
        .from('sync_status')
        .select('*')
        .eq('salon_id', salonId)
        .maybeSingle()

      if (!statusError) {
        setSyncStatus(status)
      }

      const { data: logs, error: logsError } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!logsError) {
        setSyncLogs(logs || [])
      }
    } catch (err) {
      console.error('Error loading sync data:', err)
    }
  }

  useEffect(() => {
    async function init() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
      await loadData(supabase, salon.id)
      setLoading(false)
    }

    init()
  }, [])

  useEffect(() => {
    if (!salonId) return

    const interval = setInterval(async () => {
      const supabase = await createClient()
      await loadData(supabase, salonId)
      setCountdown(60)
    }, 60000)

    return () => clearInterval(interval)
  }, [salonId])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 60))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleMaintenanceToggle = async () => {
    if (!salonId || !syncStatus) return

    setToggling(true)
    const supabase = await createClient()

    const { error } = await supabase
      .from('sync_status')
      .update({
        maintenance_mode: !syncStatus.maintenance_mode,
        updated_at: new Date().toISOString(),
      })
      .eq('salon_id', salonId)

    if (!error) {
      setSyncStatus(prev => prev ? { ...prev, maintenance_mode: !prev.maintenance_mode } : null)
    }

    setToggling(false)
  }

  if (loading) {
    return (
      <main style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
        <p style={{ color: '#666' }}>読み込み中...</p>
      </main>
    )
  }

  if (!syncStatus) {
    return (
      <main style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: 4,
          color: '#1A1018',
          marginBottom: 32,
        }}>
          同期状態
        </h1>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          textAlign: 'center',
          color: '#999',
        }}>
          <p>同期設定がまだ初期化されていません。</p>
          <p><a href="/dashboard/hpb-setup" style={{ color: '#B8966A', textDecoration: 'none' }}>HPB設定</a>から設定してください。</p>
        </div>
      </main>
    )
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#3B6D11'
      case 'unhealthy':
        return '#A32D2D'
      case 'maintenance':
        return '#B8966A'
      default:
        return '#999'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy':
        return '正常'
      case 'unhealthy':
        return 'エラー'
      case 'maintenance':
        return 'メンテナンス'
      default:
        return 'Unknown'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP')
  }

  return (
    <main style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 400,
        letterSpacing: 4,
        color: '#1A1018',
        marginBottom: 32,
      }}>
        同期状態
      </h1>

      {/* ステータスカード */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        marginBottom: 24,
      }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#999',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            ステータス
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: getStatusBadgeColor(syncStatus.status),
            }} />
            <span style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#1A1018',
            }}>
              {getStatusLabel(syncStatus.status)}
            </span>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #E8DCD0',
          paddingTop: 20,
          marginBottom: 20,
        }}>
          <p style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#999',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            最終同期
          </p>
          <p style={{ fontSize: 14, color: '#1A1018', margin: 0 }}>
            {formatDate(syncStatus.last_sync_at)}
          </p>
        </div>

        {syncStatus.last_error && (
          <div style={{
            background: '#FAF1F1',
            border: '1px solid #E8D8D8',
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            fontSize: 12,
            color: '#A32D2D',
          }}>
            <p style={{ margin: 0, fontWeight: 500, marginBottom: 4 }}>エラー内容</p>
            <p style={{ margin: 0 }}>{syncStatus.last_error}</p>
          </div>
        )}

        <div style={{ borderTop: '1px solid #E8DCD0', paddingTop: 20 }}>
          <p style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#999',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            メンテナンスモード
          </p>
          <button
            onClick={handleMaintenanceToggle}
            disabled={toggling}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: `1px solid ${syncStatus.maintenance_mode ? '#B8966A' : '#B8966A'}`,
              background: syncStatus.maintenance_mode ? '#FAF6EE' : 'transparent',
              color: '#B8966A',
              fontSize: 13,
              fontWeight: 500,
              cursor: toggling ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: toggling ? 0.6 : 1,
            }}
          >
            {syncStatus.maintenance_mode ? 'オン (クリックで解除)' : 'オフ (クリックで有効)'}
          </button>
        </div>
      </div>

      {/* ログテーブル */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        marginBottom: 24,
      }}>
        <h2 style={{
          fontSize: 16,
          fontWeight: 500,
          color: '#1A1018',
          marginBottom: 20,
          marginTop: 0,
        }}>
          同期ログ
        </h2>

        {syncLogs.length === 0 ? (
          <p style={{ color: '#999', fontSize: 13, margin: 0 }}>
            ログがまだありません
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E8DCD0' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 0',
                    fontWeight: 500,
                    color: '#666',
                  }}>
                    時刻
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 0',
                    fontWeight: 500,
                    color: '#666',
                  }}>
                    ステータス
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 0',
                    fontWeight: 500,
                    color: '#666',
                  }}>
                    メッセージ
                  </th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log, i) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: i !== syncLogs.length - 1 ? '1px solid #F0EBE5' : 'none',
                    }}
                  >
                    <td style={{ padding: '12px 0', color: '#666' }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 500,
                        background: log.status === 'success' ? '#E8F4E1' : '#FAF1F1',
                        color: log.status === 'success' ? '#3B6D11' : '#A32D2D',
                      }}>
                        {log.status === 'success' ? '成功' : 'エラー'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', color: '#666', wordBreak: 'break-word' }}>
                      {log.message || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{
          fontSize: 11,
          color: '#999',
          margin: '16px 0 0 0',
          textAlign: 'right',
        }}>
          次の更新まであと {countdown} 秒
        </p>
      </div>
    </main>
  )
}
