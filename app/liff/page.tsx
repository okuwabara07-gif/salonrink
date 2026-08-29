'use client'

/**
 * app/liff/page.tsx
 *
 * LIFF ダッシュボード（ルートページ）
 * - LIFF 初期化 + Supabase getUser
 * - 4状態UI: loading / authed / unauthed / error
 * - authed なら DashboardClient コンポーネントをレンダリング
 */

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { DashboardClient } from './_components/DashboardClient'

type PageState = 'loading' | 'authed' | 'unauthed' | 'error'

export default function LiffDashboardPage() {
  const [state, setState] = useState<PageState>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Step 1: LIFF 初期化
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID_MENU

        if (!liffId) {
          throw new Error('LIFF ID が設定されていません')
        }

        await liff.init({ liffId })

        // Step 2: Supabase セッション確認
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          throw new Error(authError.message)
        }

        if (!authUser) {
          setState('unauthed')
          return
        }

        setUser(authUser)
        setState('authed')
      } catch (err) {
        console.error('[LiffDashboardPage] init error:', err)
        setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
        setState('error')
      }
    }

    initAuth()
  }, [])

  if (state === 'loading') {
    return (
      <div className="srk-page flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-accent border-t-accent-soft rounded-full" />
          </div>
          <p className="mt-4 text-ink-3">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (state === 'unauthed') {
    return (
      <div className="srk-page flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-serif mb-2">認証が必要です</h2>
          <p className="text-sm text-ink-3 mb-6">
            LINE で友だち登録後、ログインしてください。
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-accent text-white rounded-lg text-sm font-medium"
          >
            ログイン
          </a>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="srk-page flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-serif mb-2 text-danger">エラーが発生しました</h2>
          <p className="text-sm text-ink-3 mb-2">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-2 bg-accent text-white rounded-lg text-sm font-medium"
            type="button"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="srk-page pb-24">
      {user && <DashboardClient user={user} />}
    </div>
  )
}
