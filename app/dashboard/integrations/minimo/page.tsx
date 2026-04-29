'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MinimoPage() {
  const [notificationEmail, setNotificationEmail] = useState('')
  const [notificationSent, setNotificationSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNotificationRequest = async () => {
    if (!notificationEmail) {
      alert('メールアドレスを入力してください')
      return
    }

    setLoading(true)
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('ログインが必要です')
        return
      }

      // 現在は UI のみ（実装は Phase 2）
      setNotificationSent(true)
      setTimeout(() => setNotificationSent(false), 3000)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link
          href="/dashboard/integrations"
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
            ミニモ連携
          </h1>
          <p style={{ fontSize: 13, color: '#888', margin: '8px 0 0 0' }}>
            近日提供予定
          </p>
        </div>
      </div>

      {/* ステータスカード */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 12,
          padding: 32,
          border: '2px solid #f59e0b',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ fontSize: 40 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#92400e', margin: '0 0 12px 0' }}>
              カミングスーン
            </h2>
            <p style={{ fontSize: 14, color: '#78350f', lineHeight: 1.7, margin: 0 }}>
              ミニモ公式API連携の申請を進めています。
              <br />
              実装完了後は、自動で利用可能になります。
            </p>
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbeb', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
              <strong>申請状況:</strong> 公式パートナー審査中（5月末-6月予定）
            </div>
          </div>
        </div>
      </div>

      {/* 機能予告セクション */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          border: '1px solid #E0D8D0',
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1018', margin: '0 0 24px 0' }}>
          実装予定の機能
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[
            { icon: '📅', title: 'ミニモ予約の自動取り込み', desc: 'ミニモからの予約を自動で反映' },
            { icon: '🔄', title: 'スケジュール自動同期', desc: '空き状況をリアルタイム更新' },
            { icon: '👥', title: '顧客情報自動連携', desc: 'ミニモの顧客データを統合' },
            { icon: '💰', title: '売上データ自動集計', desc: 'ミニモ経由の売上を自動計算' },
          ].map((feature, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 12 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{feature.icon}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1018', margin: '0 0 4px 0' }}>
                  {feature.title}
                </p>
                <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 対応サービス比較 */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          border: '1px solid #E0D8D0',
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1018', margin: '0 0 20px 0' }}>
          対応予約サイト一覧
        </h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { name: 'LINE公式アカウント', status: '✅ 対応済み', color: '#10b981' },
            { name: 'ホットペッパー', status: '✅ 対応済み', color: '#10b981' },
            { name: 'ミニモ', status: '🔔 カミングスーン', color: '#f59e0b' },
            { name: '楽天ビューティー', status: '📅 将来対応', color: '#6b7280' },
          ].map((service, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#f9f8f7',
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              <span style={{ fontWeight: 500, color: '#1A1018' }}>{service.name}</span>
              <span style={{ fontWeight: 600, color: service.color }}>{service.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 通知登録セクション */}
      <div
        style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: 12,
          padding: 32,
          border: '2px solid #3b82f6',
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e40af', margin: '0 0 16px 0' }}>
          リリース時に通知を受け取る
        </h2>
        <p style={{ fontSize: 13, color: '#1e3a8a', marginBottom: 20 }}>
          ミニモ連携の実装完了時に、メールでお知らせします。
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            placeholder="メールアドレスを入力"
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 14px',
              borderRadius: 6,
              border: '1px solid #93c5fd',
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleNotificationRequest}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: notificationSent ? '#10b981' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {notificationSent ? '✓ 完了' : loading ? '送信中...' : '通知を受け取る'}
          </button>
        </div>
      </div>

      {/* フッター */}
      <div
        style={{
          background: '#f9f8f7',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
          fontSize: 13,
          color: '#888',
        }}
      >
        <p style={{ margin: '0 0 12px 0' }}>
          詳細はサポートまでお問い合わせください。
        </p>
        <p style={{ margin: 0 }}>
          <a href="mailto:support@salonrink.com" style={{ color: '#B8966A', textDecoration: 'none' }}>
            support@salonrink.com
          </a>
        </p>
      </div>
    </main>
  )
}
