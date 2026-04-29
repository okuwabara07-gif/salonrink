'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Warning {
  customerId: string
  customerName: string
  reservationTime: string
  riskLevel: string
  warnings: string[]
  scalpConcerns: string[]
}

interface Props {
  salonId: string
}

export default function TodayWarnings({ salonId }: Props) {
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWarnings() {
      if (!salonId) {
        setLoading(false)
        return
      }

      const supabase = await createClient()
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

      // 本日の予約取得
      const { data: reservations } = await supabase
        .from('reservations')
        .select('id, start_time, customer_id, customers(id, name)')
        .eq('salon_id', salonId)
        .gte('start_time', today)
        .lt('start_time', tomorrow)
        .order('start_time')

      if (!reservations || reservations.length === 0) {
        setLoading(false)
        return
      }

      // 各予約顧客の最新カルテから警告取得
      const customerIds = reservations.map(r => r.customer_id).filter(Boolean)

      const { data: kartesData } = await supabase
        .from('kartes')
        .select('customer_id, ai_warnings')
        .in('customer_id', customerIds)
        .order('visit_date', { ascending: false })

      // customer_id ごとに最新カルテをマップ
      const latestKarteByCustomer: Record<string, any> = {}
      kartesData?.forEach(k => {
        if (!latestKarteByCustomer[k.customer_id]) {
          latestKarteByCustomer[k.customer_id] = k
        }
      })

      // リスクある予約のみ抽出
      const riskyReservations: Warning[] = []
      reservations.forEach(r => {
        const karte = latestKarteByCustomer[r.customer_id]
        const warnings = karte?.ai_warnings
        if (!warnings) return

        const riskLevel = warnings.risk_level
        if (!['critical', 'high', 'medium', 'warning'].includes(riskLevel)) return

        const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers
        if (!customer) return

        riskyReservations.push({
          customerId: customer.id,
          customerName: customer.name || '',
          reservationTime: new Date(r.start_time).toTimeString().slice(0, 5),
          riskLevel,
          warnings: [
            ...(warnings.allergy_warnings || []),
            ...(warnings.damage_alerts || []),
          ].slice(0, 3),
          scalpConcerns: warnings.scalp_concerns || [],
        })
      })

      setWarnings(riskyReservations)
      setLoading(false)
    }

    loadWarnings()
  }, [salonId])

  if (loading) return null
  if (warnings.length === 0) return null  // 警告なし → 非表示

  return (
    <section style={{
      background: '#fff5f5',
      border: '2px solid #fecaca',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#991b1b', margin: 0 }}>
          今日の注意 ({warnings.length}名)
        </h2>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {warnings.map(w => (
          <Link
            key={w.customerId}
            href={`/dashboard/customers/${w.customerId}`}
            style={{
              display: 'block',
              background: '#fff',
              borderRadius: 10,
              padding: 16,
              borderLeft: `4px solid ${
                w.riskLevel === 'critical' ? '#dc2626' :
                w.riskLevel === 'high' ? '#ef4444' :
                '#f59e0b'
              }`,
              textDecoration: 'none',
              color: '#1A1018',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{
                background: w.riskLevel === 'critical' ? '#dc2626' :
                           w.riskLevel === 'high' ? '#ef4444' : '#f59e0b',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
              }}>
                {w.riskLevel.toUpperCase()}
              </span>
              <span style={{ fontWeight: 500 }}>
                {w.reservationTime} {w.customerName} 様
              </span>
            </div>

            {w.warnings.length > 0 && (
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, fontSize: 13, color: '#666' }}>
                {w.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
