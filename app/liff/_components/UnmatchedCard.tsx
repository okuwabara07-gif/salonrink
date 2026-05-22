'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface UnmatchedCardProps {
  count: number
}

export function UnmatchedCard({ count }: UnmatchedCardProps) {
  const router = useRouter()

  return (
    <div
      className="bg-amber-soft rounded-xl px-3 pt-3 pb-2.5 min-h-[96px] flex flex-col justify-between cursor-pointer"
      style={{ border: '1px solid rgba(199,144,43,0.3)' }}
      onClick={() => router.push('/liff/menu?filter=unmatched')}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            <p className="text-[10px] font-medium uppercase text-amber" style={{ letterSpacing: '0.6px' }}>
              要対応
            </p>
          </div>
          <p className="font-mono text-[21px] font-semibold text-ink mt-1">{count}件</p>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-[10.5px] text-muted leading-[1.4]">
          HPBメニュー名が<br />
          未マッチ
        </p>
        <p className="text-[11px] text-amber font-semibold mt-1.5">メニュー画面で確認 →</p>
      </div>
    </div>
  )
}
