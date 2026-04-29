'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function KartePage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

      // 顧客一覧取得
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, name, phone, last_visit, visit_count')
        .eq('salon_id', salon.id)
        .order('last_visit', { ascending: false, nullsFirst: false })

      setCustomers(customersData || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const filteredCustomers = customers.filter(c => {
    const searchLower = searchTerm.toLowerCase()
    return (
      c.name?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchTerm)
    )
  })

  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIdx, startIdx + itemsPerPage)
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <main style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', margin: 0 }}>
          カルテ
        </h1>
        <Link
          href="/dashboard/karte/new"
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            background: '#1A1018',
            color: '#FAF6EE',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
            display: 'inline-block',
          }}
        >
          + 新規顧客
        </Link>
      </div>

      {/* 検索 */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="顧客名または電話番号で検索..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 8,
            border: '1px solid #E0D8D0',
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* 顧客一覧 */}
      {paginatedCustomers.length > 0 ? (
        <div style={{
          display: 'grid',
          gap: 12,
        }}>
          {paginatedCustomers.map(customer => (
            <Link
              key={customer.id}
              href={`/dashboard/karte/${customer.id}`}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                border: '1px solid #F0EAE3',
                display: 'block',
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
                    {customer.name}
                  </p>
                  {customer.age && (
                    <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                      {customer.age}歳
                    </p>
                  )}
                </div>
                {customer.phone && (
                  <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                    {customer.phone}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>
                    最終来店
                  </p>
                  <p style={{ fontSize: 12, color: '#1A1018', margin: 0 }}>
                    {customer.last_visit
                      ? new Date(customer.last_visit).toLocaleDateString('ja-JP')
                      : '—'}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>
                    来店回数
                  </p>
                  <p style={{ fontSize: 12, color: '#1A1018', margin: 0 }}>
                    {customer.visit_count || 0}回
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>
                    総売上
                  </p>
                  <p style={{ fontSize: 12, color: '#1A1018', margin: 0 }}>
                    ¥{(customer.total_spent || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
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
            顧客がまだいません
          </p>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginTop: 32,
        }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: currentPage === page ? 'none' : '1px solid #E0D8D0',
                background: currentPage === page ? '#1A1018' : '#fff',
                color: currentPage === page ? '#FAF6EE' : '#1A1018',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </main>
  )
}
