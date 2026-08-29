'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function LiffAutoLogin() {
  const router = useRouter()

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_OWNER_LIFF_ID
    if (!liffId) {
      console.log('[LiffAutoLogin] LIFF ID not configured, skipping auto-login')
      return
    }

    const initLiff = async () => {
      try {
        const liff = (await import('@line/liff')).default
        await liff.init({ liffId })

        if (!liff.isInClient()) {
          console.log('[LiffAutoLogin] Not in LIFF client, skipping auto-login')
          return
        }

        const idToken = liff.getIDToken()
        if (!idToken) {
          console.warn('[LiffAutoLogin] Failed to get ID token')
          return
        }

        const res = await fetch('/api/owner-liff-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })

        if (!res.ok) {
          console.warn('[LiffAutoLogin] Auth failed:', res.status)
          return
        }

        router.refresh()
      } catch (err) {
        console.error('[LiffAutoLogin] Error:', err)
      }
    }

    initLiff()
  }, [router])

  return null
}
