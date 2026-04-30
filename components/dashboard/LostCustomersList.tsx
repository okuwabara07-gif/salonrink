'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LostCustomer {
  id: string
  name: string
  daysSinceLastVisit: number
  recommendedMenu: string | null
  reasoning: string | null
}

interface Props {
  salonId: string
}

export default function LostCustomersList({ salonId }: Props) {
  const [customers, setCustomers] = useState<LostCustomer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLostCustomers() {
      if (!salonId) {
        setLoading(false)
        return
      }

      const supabase = await createClient()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

      // 30日以上来店していないリピーター顧客
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, name, last_visit, visit_count')
        .eq('salon_id', salonId)
        .gte('visit_count', 1)
        .lt('last_visit', thirtyDaysAgo)
        .order('last_visit', { ascending: true })
        .limit(10)

      if (!customersData || customersData.length === 0) {
        setLoading(false)
        return
      }

      // 各顧客の最新カルテから AI 次回提案を取得
      const customerIds = customersData.map(c => c.id)

      const { data: kartesData } = await supabase
        .from('kartes')
        .select('customer_id, ai_next_recommendation')
        .in('customer_id', customerIds)
        .order('visit_date', { ascending: false })

      // customer_id ごとに最新カルテをマップ
      const latestKarteByCustomer: Record<string, any> = {}
      kartesData?.forEach(k => {
        if (!latestKarteByCustomer[k.customer_id]) {
          latestKarteByCustomer[k.customer_id] = k
        }
      })

      const today = Date.now()
      const lostCustomers: LostCustomer[] = customersData.map(c => {
        const lastVisit = c.last_visit ? new Date(c.last_visit).getTime() : today
        const daysSince = Math.floor((today - lastVisit) / 86400000)
        const karte = latestKarteByCustomer[c.id]
        const recommendation = karte?.ai_next_recommendation

        return {
          id: c.id,
          name: c.name || '',
          daysSinceLastVisit: daysSince,
          recommendedMenu: recommendation?.recommended_menu || null,
          reasoning: recommendation?.reasoning || null,
        }
      })

      setCustomers(lostCustomers)
      setLoading(false)
    }

    loadLostCustomers()
  }, [salonId])

  if (loading) return null
  if (customers.length === 0) return null

  return (
    <section style={{
      background: '#eff6ff',
      border: '2px solid #bfdbfe',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>✨</span>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e3a8a', margin: 0 }}>
          失客リスト ({customers.length}名)
        </h2>
      </div>

      <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px 0' }}>
        30日以上来店していないお客様。AIによる次回提案でフォローしましょう。
      </p>

      <div style={{ display: 'grid', gap: 10 }}>
        {customers.map(c => (
          <Link
            key={c.id}
            href={`/dashboard/customers/${c.id}`}
            style={{
              display: 'block',
              background: '#fff',
              borderRadius: 10,
              padding: 14,
              borderLeft: '4px solid #3b82f6',
              textDecoration: 'none',
              color: '#1A1018',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>
                {c.name} 様
              </span>
              <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', marginLeft: 8 }}>
                {c.daysSinceLastVisit}日前
              </span>
            </div>

            {c.recommendedMenu ? (
              <div style={{ fontSize: 12, color: '#555' }}>
                <span style={{ color: '#3b82f6', fontWeight: 500 }}>AI提案:</span>{' '}
                {c.recommendedMenu}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#999' }}>
                AI提案を生成するにはカルテを開いてください
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
