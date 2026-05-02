'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Salon {
  id: string
  name: string
  owner_name: string
  plan: string
}

interface Customer {
  id: string
  name: string
  phone: string
  last_visit: string | null
  visit_count: number
}

export default function CustomersPage() {
  const [salon, setSalon] = useState<Salon | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

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

      // 顧客一覧取得
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, name, phone, last_visit, visit_count')
        .eq('salon_id', salonData.id)
        .order('last_visit', { ascending: false, nullsFirst: false })

      setCustomers(customersData || [])
      setLoading(false)
    }

    loadData()
  }, [])

  // タブフィルター判定
  const filteredByTab = customers.filter(c => {
    if (activeTab === 'all') return true
    if (activeTab === 'new') return c.visit_count === 1
    if (activeTab === 'repeat') return c.visit_count > 1
    // 一時無効化: tags column 追加後に復活
    // if (activeTab === 'vip') return c.tags?.includes('VIP')
    // if (activeTab === 'caution') return c.tags?.includes('要注意')
    return true
  })

  // 検索フィルター
  const filteredCustomers = filteredByTab.filter(c => {
    const searchLower = searchTerm.toLowerCase()
    return (
      c.name?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchTerm)
      // 一時無効化: tags column 追加後に復活
      // || c.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  })

  // 前回来店日を計算
  const getDaysAgo = (lastVisit: string | null): string => {
    if (!lastVisit) return '来店なし'
    const visitDate = new Date(lastVisit)
    const today = new Date()
    const diffMs = today.getTime() - visitDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '本日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    return `${Math.floor(diffDays / 30)}ヶ月前`
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>読み込み中...</p>
      </div>
    )
  }

  const tabs = [
    { id: 'all', label: 'すべて' },
    { id: 'new', label: '新規' },
    { id: 'repeat', label: '再来店' },
    { id: 'vip', label: 'VIP' },
    { id: 'caution', label: '要注意' },
  ]

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
        {/* 検索バー */}
        <div style={{ marginBottom: 'clamp(20px, 3vw, 24px)' }}>
          <input
            type="text"
            placeholder="🔍 名前・電話番号・タグで検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'clamp(12px, 2vw, 16px)',
              borderRadius: 12,
              border: 'none',
              background: '#fff',
              fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-noto-sans-jp)',
            }}
          />
        </div>

        {/* タブフィルター */}
        <div
          style={{
            display: 'flex',
            gap: 'clamp(8px, 1.5vw, 12px)',
            overflowX: 'auto',
            marginBottom: 'clamp(24px, 4vw, 32px)',
            paddingBottom: '8px',
            scrollBehavior: 'smooth',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)',
                borderRadius: 20,
                border: activeTab === tab.id ? 'none' : '1px solid var(--sr-border)',
                background: activeTab === tab.id ? 'var(--accent-gold)' : '#fff',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                fontSize: 'clamp(0.8rem, 1.4vw, 0.9rem)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-noto-sans-jp)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 顧客カードリスト */}
        {filteredCustomers.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(12px, 2vw, 16px)',
            }}
          >
            {filteredCustomers.map((customer) => (
              <Link
                key={customer.id}
                href={`/dashboard/customers/${customer.id}`}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 'clamp(16px, 2.5vw, 20px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  gap: 'clamp(12px, 2vw, 16px)',
                  alignItems: 'flex-start',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* アバター */}
                <div
                  style={{
                    flex: '0 0 clamp(48px, 10vw, 56px)',
                    width: 'clamp(48px, 10vw, 56px)',
                    height: 'clamp(48px, 10vw, 56px)',
                    borderRadius: '50%',
                    background: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
                  }}
                >
                  {customer.name?.charAt(0) || '—'}
                </div>

                {/* 情報 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-noto-serif-jp)',
                      fontSize: 'clamp(0.95rem, 1.8vw, 1.0625rem)',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      margin: 0,
                      marginBottom: '4px',
                    }}
                  >
                    {customer.name || '—'}様
                  </p>

                  <p
                    style={{
                      fontFamily: 'var(--font-noto-sans-jp)',
                      fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                      color: 'var(--text-secondary)',
                      margin: '4px 0 0 0',
                    }}
                  >
                    前回: {getDaysAgo(customer.last_visit)}
                  </p>

                  {/* メモ/タグ表示 */}
                  {customer.notes && (
                    <p
                      style={{
                        fontFamily: 'var(--font-noto-sans-jp)',
                        fontSize: 'clamp(0.75rem, 1.3vw, 0.8rem)',
                        color: 'var(--text-secondary)',
                        margin: '6px 0 0 0',
                        fontStyle: 'italic',
                      }}
                    >
                      メモ: {customer.notes}
                    </p>
                  )}

                  {customer.tags && customer.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {customer.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'var(--accent-gold)',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)',
                            fontWeight: 500,
                            fontFamily: 'var(--font-noto-sans-jp)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 'clamp(32px, 5vw, 40px)',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.85rem, 1.5vw, 0.9375rem)',
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              該当する顧客はいません
            </p>
          </div>
        )}
      </div>

      {/* フローティングボタン */}
      <Link
        href="/dashboard/customers/new"
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
