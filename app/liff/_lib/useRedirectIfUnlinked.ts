'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withLiffEnv } from './liffEnv'
import type { PassGet } from './passApi'

export function useRedirectIfUnlinked(data: PassGet | null) {
  const router = useRouter()
  useEffect(() => {
    if (data && !data.linked) {
      router.replace(withLiffEnv('/liff/pass/link', window.location.search))
    }
  }, [data, router])
}
