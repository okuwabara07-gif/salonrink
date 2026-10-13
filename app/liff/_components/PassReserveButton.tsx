'use client'

import type { CSSProperties, MouseEvent } from 'react'
import PassNavLink from './PassNavLink'
import { liff } from '../_lib/liffLite'
import type { PassLinked } from '../_lib/passApi'

const reserveButton: CSSProperties = {
  background: 'transparent',
  color: '#1B1815',
  border: '1.5px solid #1B1815',
  borderRadius: '99px',
  minHeight: '52px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 700,
  textDecoration: 'none',
}

/**
 * HPB の予約ページを外部ブラウザで開く。reserve_url が無ければ何も出さない。
 * LINE 内は liff.openWindow、それ以外は通常のリンクとして動く。
 */
export default function PassReserveButton({
  data,
  style,
}: {
  data: Pick<PassLinked, 'reserve_url' | 'has_pending_bonus' | 'next_reservation_at'>
  style?: CSSProperties
}) {
  const url = data.reserve_url
  if (!url || !/^https?:\/\//.test(url)) return null

  const booked = data.has_pending_bonus || !!data.next_reservation_at

  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    try {
      if (!liff.isInClient()) return
      liff.openWindow({ url, external: true })
      e.preventDefault()
    } catch {
      // liff が使えないときは <a> の通常の遷移に任せる
    }
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={open} style={{ ...reserveButton, ...style }}>
      {booked ? 'ご予約を確認・変更' : '予約する'}
    </a>
  )
}

/** 予約先の登録・変更画面へのリンク。reserve_url が無いときは登録、あるときは変更の文言 */
export function PassReserveEditLink({ data }: { data: Pick<PassLinked, 'reserve_url'> }) {
  return (
    <PassNavLink
      href="/liff/pass/reserve"
      style={{
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        color: '#5F584E',
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
      }}
    >
      {data.reserve_url ? '予約先を変更' : 'いつものサロンの予約先を登録'}
    </PassNavLink>
  )
}
