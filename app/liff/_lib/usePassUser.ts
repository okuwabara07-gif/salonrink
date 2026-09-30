'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { resolveLiffId } from './liffEnv'

export type PassUserState =
  | { status: 'loading'; userId: null }
  | { status: 'ready'; userId: string }
  | { status: 'outside'; userId: null }

export const PASS_OUTSIDE_MESSAGE = 'この画面はLINEから開くと、会員証が表示されます。'

/** useMycarte と同じ手順で LIFF を初期化し、line_user_id だけを返す */
export function usePassUser(): PassUserState {
  const [state, setState] = useState<PassUserState>({ status: 'loading', userId: null })

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        await liff.init({ liffId: resolveLiffId(window.location.search) })
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href })
          return
        }
        const p = await liff.getProfile()
        if (!cancelled) setState({ status: 'ready', userId: p.userId })
      } catch (e) {
        console.warn('[usePassUser]', e instanceof Error ? e.message : e)
        if (!cancelled) setState({ status: 'outside', userId: null })
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
