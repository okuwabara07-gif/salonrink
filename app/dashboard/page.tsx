'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TodayWarnings from '@/components/dashboard/TodayWarnings'
import LostCustomersList from '@/components/dashboard/LostCustomersList'

export default function DashboardPage() {
  const [salon, setSalon] = useState<any>(null)
  const [stats, setStats] = useState({
    todayCount: 0,
    weekCount: 0,
    newCustomers: 0,
    reservations: [] as any[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // サロン情報取得
      const { data: salonData } = await supabase
        .from('salons')
        .select('id, name, owner_name, plan')
        .eq('owner_user_id', user.id)
        .maybeSingle()

      if (!salonData) {
        setLoading(false)
        return
      }

      setSalon(salonData)

      // 本日の予約数
      const today = new Date().toISOString().split('T')[0]
      const { data: todayReservations } = await supabase
        .from('reservations')
        .select('id')
        .eq('salon_id', salonData.id)
        .gte('scheduled_at', today)
        .lt('scheduled_at', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0])

      // 今週の予約数
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const { data: weekReservations } = await supabase
        .from('reservations')
        .select('id')
        .eq('salon_id', salonData.id)
        .gte('scheduled_at', weekStart.toISOString().split('T')[0])
        .lt('scheduled_at', weekEnd.toISOString().split('T')[0])

      // 新規顧客数（本日）
      const { data: newCustomers } = await supabase
        .from('customers')
        .select('id')
        .eq('salon_id', salonData.id)
        .gte('created_at', today)

      // 本日の予約一覧（最大10件）
      const { data: reservations } = await supabase
        .from('reservations')
        .select('id, customer_name, scheduled_at, menu, status, price')
        .eq('salon_id', salonData.id)
        .gte('scheduled_at', today)
        .lt('scheduled_at', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0])
        .order('scheduled_at', { ascending: true })
        .limit(10)

      setStats({
        todayCount: todayReservations?.length || 0,
        weekCount: weekReservations?.length || 0,
        newCustomers: newCustomers?.length || 0,
        reservations: reservations || [],
      })

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <main style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', margin: 0 }}>
          ダッシュボード
        </h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
          {salon?.name || 'サロン名'} へようこそ
        </p>
      </div>

      {/* 統計カード */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 40,
      }}>
        {/* 本日予約数 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px 0' }}>
            本日予約数
          </p>
          <p style={{ fontSize: 32, fontWeight: 300, color: '#1A1018', margin: 0 }}>
            {stats.todayCount}
          </p>
        </div>

        {/* 今週予約数 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px 0' }}>
            今週予約数
          </p>
          <p style={{ fontSize: 32, fontWeight: 300, color: '#1A1018', margin: 0 }}>
            {stats.weekCount}
          </p>
        </div>

        {/* 新規顧客数 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px 0' }}>
            新規顧客数（本日）
          </p>
          <p style={{ fontSize: 32, fontWeight: 300, color: '#1A1018', margin: 0 }}>
            {stats.newCustomers}
          </p>
        </div>

        {/* プラン */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px 0' }}>
            現在のプラン
          </p>
          <p style={{ fontSize: 18, fontWeight: 300, color: '#1A1018', margin: 0 }}>
            {salon?.plan === 'free' ? 'フリー' : salon?.plan || '—'}
          </p>
        </div>
      </div>

      {/* 今日の注意 */}
      {salon && <TodayWarnings salonId={salon.id} />}

      {/* 本日の予約一覧 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1A1018', marginBottom: 20 }}>
          本日の予約
        </h2>

        {stats.reservations.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E0D8D0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    時間
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    顧客名
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    メニュー
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    ステータス
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px', fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    金額
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.reservations.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < stats.reservations.length - 1 ? '1px solid #F0EAE3' : 'none' }}>
                    <td style={{ padding: '12px', fontSize: 13, color: '#1A1018' }}>
                      {new Date(r.scheduled_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#1A1018' }}>
                      {r.customer_name || '—'}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#1A1018' }}>
                      {r.menu || '—'}
                    </td>
                    <td style={{ padding: '12px', fontSize: 13 }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 500,
                        background: r.status === 'confirmed' ? '#E8F5E9' : r.status === 'cancelled' ? '#FFEBEE' : '#FFF3E0',
                        color: r.status === 'confirmed' ? '#2E7D32' : r.status === 'cancelled' ? '#C62828' : '#E65100',
                      }}>
                        {r.status === 'confirmed' ? '確定' : r.status === 'cancelled' ? 'キャンセル' : '保留'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#1A1018', textAlign: 'right' }}>
                      ¥{r.price?.toLocaleString() || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '20px' }}>
            本日の予約はありません
          </p>
        )}
      </div>

      {/* 失客リスト */}
      {salon && <LostCustomersList salonId={salon.id} />}
    </main>
  )
}
