'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { MenuClient } from './_components/MenuClient'

// ========================================
// Type definitions
// ========================================

type AuthState = 'loading' | 'authed' | 'unauthed' | 'error'

interface AuthContextType {
  state: AuthState
  user: User | null
  error: string | null
}

// ========================================
// Main Page Component
// ========================================

export default function MenuPage() {
  const [authContext, setAuthContext] = useState<AuthContextType>({
    state: 'loading',
    user: null,
    error: null,
  })

  useEffect(() => {
    async function bootstrap() {
      try {
        // Step 1: LIFF SDK 初期化
        // Note: liff.login() は呼ばない（Magic Link Cookie 継承を優先）
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID_MENU

        if (!liffId) {
          setAuthContext({
            state: 'error',
            user: null,
            error: 'LIFF ID が設定されていません',
          })
          return
        }

        await liff.init({ liffId })

        // Step 2: Supabase 既存セッション確認 (Magic Link 経由の Cookie)
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          console.error('Auth error:', authError)
          setAuthContext({
            state: 'unauthed',
            user: null,
            error: 'セッションの確認に失敗しました',
          })
          return
        }

        if (!user) {
          setAuthContext({
            state: 'unauthed',
            user: null,
            error: null,
          })
          return
        }

        // セッション確立
        setAuthContext({
          state: 'authed',
          user,
          error: null,
        })
      } catch (err) {
        console.error('Bootstrap error:', err)
        setAuthContext({
          state: 'error',
          user: null,
          error: err instanceof Error ? err.message : '初期化に失敗しました',
        })
      }
    }

    bootstrap()
  }, [])

  // ========================================
  // Render: Loading state
  // ========================================

  if (authContext.state === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-warm">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-line border-t-accent rounded-full animate-spin mb-md" />
          <p className="text-body-sm text-ink-3">読み込み中…</p>
        </div>
      </div>
    )
  }

  // ========================================
  // Render: Error state
  // ========================================

  if (authContext.state === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-warm px-lg py-xl">
        <div className="text-center">
          <div className="text-4xl mb-lg">⚠️</div>
          <h1 className="text-heading-sm text-ink font-serif mb-sm">
            エラーが発生しました
          </h1>
          <p className="text-body-sm text-ink-3 mb-lg">
            {authContext.error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-lg py-md bg-accent text-white text-btn-sm font-500 rounded-md"
          >
            リロード
          </button>
        </div>
      </div>
    )
  }

  // ========================================
  // Render: Unauthenticated state
  // ========================================

  if (authContext.state === 'unauthed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-warm px-lg py-xl">
        <div className="max-w-sm w-full">
          {/* Header */}
          <div className="text-center mb-xl">
            <h1 className="text-heading-sm text-ink font-serif mb-md">
              ログインが必要です
            </h1>
            <p className="text-body-sm text-ink-3">
              salonrink.com で先にログインしてください
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-card rounded-md border border-line p-lg mb-lg">
            <p className="text-caption-md text-ink-3 mb-md">
              1. salonrink.com にアクセス
            </p>
            <p className="text-caption-md text-ink-3 mb-md">
              2. Magic Link でログイン
            </p>
            <p className="text-caption-md text-ink-3">
              3. LINE に戻ると自動的にログイン状態になります
            </p>
          </div>

          {/* CTA Button */}
          <a
            href="https://salonrink.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-lg py-md bg-accent text-white text-btn-md font-500 text-center rounded-md hover:bg-accent-hover transition"
          >
            salonrink.com でログイン
          </a>

          {/* Alternative: WebView fallback notice */}
          <p className="text-caption-sm text-ink-4 text-center mt-lg">
            外部ブラウザで開きます。ログイン後に LINE に戻ってください。
          </p>
        </div>
      </div>
    )
  }

  // ========================================
  // Render: Authenticated state
  // ========================================

  return (
    <div className="min-h-screen bg-bg-warm pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-paper border-b border-line px-lg py-md">
        <div className="flex items-center justify-between">
          <h1 className="text-title-md text-ink font-serif">メニュー編集</h1>
          <button
            onClick={() => window.history.back()}
            className="text-ink-3 hover:text-ink"
          >
            ← 戻る
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-lg py-md">
        <MenuClient user={authContext.user!} />
      </main>
    </div>
  )
}
