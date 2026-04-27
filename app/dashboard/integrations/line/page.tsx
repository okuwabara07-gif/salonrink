'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LinePage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [lineAccount, setLineAccount] = useState<any>(null)
  const [linkedCount, setLinkedCount] = useState(0)
  const [recentLinks, setRecentLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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

      // LINE連携情報取得
      const { data: lineData } = await supabase
        .from('line_accounts')
        .select('*')
        .eq('salon_id', salon.id)
        .maybeSingle()

      setLineAccount(lineData)

      // 紐付き顧客数
      const { count } = await supabase
        .from('line_customer_links')
        .select('id', { count: 'exact' })
        .eq('salon_id', salon.id)

      setLinkedCount(count || 0)

      // 直近紐付き一覧（3件）
      const { data: links } = await supabase
        .from('line_customer_links')
        .select('id, line_user_id, customer_id, linked_at, customers(name)')
        .eq('salon_id', salon.id)
        .order('linked_at', { ascending: false })
        .limit(3)

      setRecentLinks(links || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const handleCopyCode = () => {
    if (lineAccount?.salon_code) {
      navigator.clipboard.writeText(lineAccount.salon_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <main style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', marginBottom: 32 }}>
        LINE連携
      </h1>

      {/* 連携状態 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 20 }}>
          連携状態
        </h2>

        {lineAccount ? (
          <>
            <div style={{ display: 'grid', gap: 20 }}>
              {/* サロンコード */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                  サロンコード
                </p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <code style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#1A1018',
                    background: '#F5F1EC',
                    padding: '12px 16px',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    flex: 1,
                  }}>
                    {lineAccount.salon_code}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      padding: '10px 16px',
                      fontSize: 12,
                      border: '1px solid #B8966A',
                      background: 'transparent',
                      color: '#B8966A',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#B8966A'
                      e.currentTarget.style.color = '#FAF6EE'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#B8966A'
                    }}
                  >
                    {copied ? 'コピーしました' : 'コピー'}
                  </button>
                </div>
              </div>

              {/* 状態 */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                  状態
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  background: lineAccount.active ? '#E8F5E9' : '#F3E5F5',
                  color: lineAccount.active ? '#2E7D32' : '#6A1B9A',
                }}>
                  {lineAccount.active ? '✓ 有効' : '無効'}
                </span>
              </div>

              {/* 連携日時 */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
                  連携日時
                </p>
                <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                  {new Date(lineAccount.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            padding: 20,
            background: '#FFF3E0',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: '#E65100', margin: 0 }}>
              LINE連携がまだ設定されていません
            </p>
          </div>
        )}
      </div>

      {/* 紐付き顧客情報 */}
      {lineAccount && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 20 }}>
            紐付き顧客
          </h2>

          {/* 統計 */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
              紐付き顧客数
            </p>
            <p style={{ fontSize: 28, fontWeight: 300, color: '#1A1018', margin: 0 }}>
              {linkedCount}
            </p>
          </div>

          {/* 直近紐付き一覧 */}
          {recentLinks.length > 0 ? (
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                直近紐付き（3件）
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {recentLinks.map((link, i) => (
                  <li
                    key={link.id}
                    style={{
                      padding: '12px 0',
                      borderBottom: i < recentLinks.length - 1 ? '1px solid #F0EAE3' : 'none',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ color: '#1A1018', fontWeight: 500, marginBottom: 4 }}>
                      {(link.customers as any)?.name || 'ユーザー'}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {new Date(link.linked_at).toLocaleDateString('ja-JP')}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '20px' }}>
              紐付き顧客はまだいません
            </p>
          )}
        </div>
      )}
    </main>
  )
}
