'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'

/**
 * 事前カウンセリング LIFF ページ（最小実装）
 *
 * 責務:
 * - LIFF SDK 初期化
 * - LINE ログイン状態確認 + 自動ログイン誘導
 * - ユーザー情報取得（userId, displayName）
 * - 取得情報を表示
 *
 * 将来実装（Commit 46 以降）:
 * - Supabase 連携
 * - フォーム UI
 * - AI 解析エンドポイント呼び出し
 */

export default function PreCounselingPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        // Step 1: LIFF ID 取得
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID_PRE_COUNSELING

        if (!liffId) {
          setError('LIFF configuration missing')
          setLoading(false)
          return
        }

        // Step 2: LIFF SDK 初期化
        await liff.init({ liffId })

        // Step 3: ログイン状態確認
        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        // Step 4: ユーザー情報取得
        const profile = await liff.getProfile()

        if (profile) {
          setUserId(profile.userId)
          setDisplayName(profile.displayName)
        }

        setLoading(false)
      } catch (err) {
        console.error('LIFF initialization error:', err)
        setError('Failed to initialize LIFF')
        setLoading(false)
      }
    }

    initializeLiff()
  }, [])

  // ローディング状態
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>読み込み中...</p>
      </div>
    )
  }

  // エラー状態
  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <p>エラー: {error}</p>
      </div>
    )
  }

  // 成功状態
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>事前カウンセリング</h1>

      {userId && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <p>
            <strong>LINE User ID:</strong> {userId}
          </p>
        </div>
      )}

      {displayName && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <p>
            <strong>Display Name:</strong> {displayName}
          </p>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '12px', color: '#666' }}>
        <p>✅ LIFF 初期化完了</p>
        <p>✅ ユーザー情報取得完了</p>
        <p style={{ marginTop: '10px', fontStyle: 'italic' }}>次ステップ: フォーム UI 実装（Commit 46 予定）</p>
      </div>
    </div>
  )
}
