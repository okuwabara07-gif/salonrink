'use client'

import { useCallback, useEffect, useState } from 'react'
import liff from '@line/liff'
import { resolveLiffId } from './liffEnv'
import { fetchMycarte, type Mycarte } from './mycarteTypes'

export type LiffProfile = {
  userId: string
  displayName: string
  pictureUrl: string | null
}

export type MycarteStatus = 'loading' | 'ready' | 'outside' | 'error'

export type MycarteState = {
  status: MycarteStatus
  data: Mycarte | null
  profile: LiffProfile | null
  /** ユーザーに出してよい中立的なメッセージ。審査時にPCブラウザで開かれても弾かない文言にすること。 */
  message: string | null
  reload: () => void
}

const OUTSIDE_MESSAGE = 'この画面はLINEから開くと、あなたの記録が表示されます。'

/**
 * LIFF を初期化して line_user_id を取得し、get-mycarte を1回だけ叩く。
 * LINE 外（PCブラウザ・審査時の検証）では例外にせず status='outside' に落とし、
 * 画面側は「データが無い状態」として静かに描画する。
 */
export function useMycarte(): MycarteState {
  const [status, setStatus] = useState<MycarteStatus>('loading')
  const [data, setData] = useState<Mycarte | null>(null)
  const [profile, setProfile] = useState<LiffProfile | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setStatus('loading')
      setMessage(null)

      try {
        const liffId = resolveLiffId(window.location.search)
        await liff.init({ liffId })

        if (!liff.isLoggedIn()) {
          // LINE内なら即座に戻ってくる。ブラウザではログイン画面へ遷移する。
          liff.login({ redirectUri: window.location.href })
          return
        }

        const p = await liff.getProfile()
        if (cancelled) return
        const prof: LiffProfile = {
          userId: p.userId,
          displayName: p.displayName ?? '',
          pictureUrl: p.pictureUrl ?? null,
        }
        setProfile(prof)

        const carte = await fetchMycarte(prof.userId)
        if (cancelled) return
        setData(carte)
        setStatus('ready')
      } catch (e) {
        if (cancelled) return
        const reason = e instanceof Error ? e.message : String(e)
        if (reason === 'line_required') {
          setStatus('outside')
          setMessage(OUTSIDE_MESSAGE)
          return
        }
        // liff.init の失敗（LINE外・ID不一致など）はエラー画面にしない
        console.warn('[useMycarte]', reason)
        setStatus('outside')
        setMessage(OUTSIDE_MESSAGE)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [nonce])

  return { status, data, profile, message, reload }
}
