'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TodayWarnings from '@/components/dashboard/TodayWarnings'
import LostCustomersList from '@/components/dashboard/LostCustomersList'
import Link from 'next/link'

interface Salon {
  id: string
  name: string
  owner_name: string
  plan: string
}

interface Reservation {
  id: string
  customer_name: string
  scheduled_at: string
  menu: string
  status: string
  price: number
}

interface Stats {
  todayCount: number
  weekCount: number
  newCustomers: number
  reservations: Reservation[]
}

export default function DashboardPage() {
  const [salon, setSalon] = useState<Salon | null>(null)
  const [stats, setStats] = useState<Stats>({
    todayCount: 0,
    weekCount: 0,
    newCustomers: 0,
    reservations: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).toISOString()
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      let todayResvCount = 0
      let weekResvCount = 0
      let todayResvDetails: any[] = []
      try {
        const r1 = await supabase
          .from('reservations')
          .select('id')
          .eq('salon_id', salonData.id)
          .gte('datetime', todayStart)
          .lt('datetime', todayEnd)
        todayResvCount = r1.data?.length || 0
      } catch (e) { console.warn('resv today fetch failed:', e) }
      try {
        const r2 = await supabase
          .from('reservations')
          .select('id')
          .eq('salon_id', salonData.id)
          .gte('datetime', weekStart.toISOString())
          .lt('datetime', weekEnd.toISOString())
        weekResvCount = r2.data?.length || 0
      } catch (e) { console.warn('resv week fetch failed:', e) }
      try {
        const r3 = await supabase
          .from('reservations')
          .select('id, customer_name, datetime, menu, status, price')
          .eq('salon_id', salonData.id)
          .gte('datetime', todayStart)
          .lt('datetime', todayEnd)
          .order('datetime', { ascending: true })
          .limit(50)
        todayResvDetails = (r3.data || []).map((r: any) => ({
          id: 'resv_' + r.id,
          customer_name: r.customer_name,
          scheduled_at: r.datetime,
          menu: r.menu,
          status: r.status,
          price: r.price || 0,
        }))
      } catch (e) { console.warn('resv detail fetch failed:', e) }

      let todayHpbCount = 0
      let weekHpbCount = 0
      let todayHpbDetails: any[] = []
      try {
        const h1 = await supabase
          .from('hpb_reservations')
          .select('id')
          .eq('salon_id', salonData.id)
          .gte('start_time', todayStart)
          .lt('start_time', todayEnd)
        todayHpbCount = h1.data?.length || 0
      } catch (e) { console.warn('hpb today fetch failed:', e) }
      try {
        const h2 = await supabase
          .from('hpb_reservations')
          .select('id')
          .eq('salon_id', salonData.id)
          .gte('start_time', weekStart.toISOString())
          .lt('start_time', weekEnd.toISOString())
        weekHpbCount = h2.data?.length || 0
      } catch (e) { console.warn('hpb week fetch failed:', e) }
      try {
        const h3 = await supabase
          .from('hpb_reservations')
          .select('id, customer_name, start_time, menu_name, status')
          .eq('salon_id', salonData.id)
          .gte('start_time', todayStart)
          .lt('start_time', todayEnd)
          .order('start_time', { ascending: true })
          .limit(50)
        todayHpbDetails = (h3.data || []).map((r: any) => ({
          id: 'hpb_' + r.id,
          customer_name: r.customer_name,
          scheduled_at: r.start_time,
          menu: r.menu_name || '',
          status: r.status,
          price: 0,
        }))
      } catch (e) { console.warn('hpb detail fetch failed:', e) }

      const { data: newCustomers } = await supabase
        .from('customers')
        .select('id')
        .eq('salon_id', salonData.id)
        .gte('created_at', todayStart)

      const allReservations = [...todayResvDetails, ...todayHpbDetails]
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 20)

      setStats({
        todayCount: todayResvCount + todayHpbCount,
        weekCount: weekResvCount + weekHpbCount,
        newCustomers: newCustomers?.length || 0,
        reservations: allReservations,
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
    <main style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* ヘッダー - リデザイン版 */}
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
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(0.95rem, 1.8vw, 1rem)',
              color: 'var(--text-primary)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            おはようございます、{salon?.owner_name || 'ユーザー'}さん
          </p>
          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(0.75rem, 1.3vw, 0.8rem)',
              color: 'var(--text-secondary)',
              margin: '4px 0 0 0',
            }}
          >
            プラン {salon?.plan?.toUpperCase() || '—'}
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
        {/* KPI カード - リデザイン版 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 30%, 280px), 1fr))',
            gap: 'clamp(12px, 2vw, 16px)',
            marginBottom: 'clamp(24px, 4vw, 32px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(16px, 2.5vw, 20px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontWeight: 600,
                margin: 0,
                marginBottom: '8px',
                letterSpacing: 0.5,
              }}
            >
              本日の予約数
            </p>
            <p
              style={{
                fontFamily: 'var(--font-noto-serif-jp)',
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 300,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {stats.todayCount}件
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(16px, 2.5vw, 20px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontWeight: 600,
                margin: 0,
                marginBottom: '8px',
                letterSpacing: 0.5,
              }}
            >
              今週の予約数
            </p>
            <p
              style={{
                fontFamily: 'var(--font-noto-serif-jp)',
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 300,
                color: 'var(--accent-gold)',
                margin: 0,
              }}
            >
              {stats.weekCount}件
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(16px, 2.5vw, 20px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontWeight: 600,
                margin: 0,
                marginBottom: '8px',
                letterSpacing: 0.5,
              }}
            >
              新規顧客数
            </p>
            <p
              style={{
                fontFamily: 'var(--font-noto-serif-jp)',
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 300,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {stats.newCustomers}名
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(16px, 2.5vw, 20px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontWeight: 600,
                margin: 0,
                marginBottom: '8px',
                letterSpacing: 0.5,
              }}
            >
              本日の売上見込み
            </p>
            <p
              style={{
                fontFamily: 'var(--font-noto-serif-jp)',
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 300,
                color: 'var(--accent-gold)',
                margin: 0,
              }}
            >
              ¥{stats.reservations.reduce((sum, r) => sum + (r.price || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 本日の予約一覧 - リデザイン版 */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 'clamp(16px, 3vw, 20px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            marginBottom: 'clamp(24px, 4vw, 32px)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 clamp(12px, 2vw, 16px) 0',
            }}
          >
            本日の予約一覧
          </h2>

          {stats.reservations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 12px)' }}>
              {stats.reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  style={{
                    padding: 'clamp(12px, 2vw, 16px)',
                    borderBottom: '1px solid var(--sr-border)',
                    display: 'flex',
                    gap: 'clamp(12px, 2vw, 16px)',
                  }}
                >
                  <div
                    style={{
                      flex: '0 0 60px',
                      fontFamily: 'var(--font-noto-sans-jp)',
                      fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {new Date(reservation.scheduled_at).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                      {reservation.customer_name || '—'}様
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                        color: 'var(--text-secondary)',
                        margin: '4px 0 0 0',
                      }}
                    >
                      {reservation.menu || '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.85rem, 1.5vw, 0.9375rem)',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                padding: 'clamp(16px, 2vw, 20px)',
              }}
            >
              本日の予約はありません
            </p>
          )}
        </div>

        {/* 既存コンポーネント - 配置保持 */}
        {salon && <TodayWarnings salonId={salon.id} />}

        {salon && <LostCustomersList salonId={salon.id} />}
      </div>
    </main>
  )
}
