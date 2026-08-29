'use client'

import React, { useEffect, useState } from 'react'
import liff from '@line/liff'
import MiniappNav from '../MiniappNav'

const C = { rose: '#C24E40', gold: '#B08D5E', ink: '#2b2622', muted: '#6f655d', line: '#ece6df' }

export default function MyPage() {
  const [name, setName] = useState<string>('')
  const [linked, setLinked] = useState<boolean | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER
        if (!liffId) return
        await liff.init({ liffId })
        if (!liff.isLoggedIn()) { liff.login(); return }
        const profile = await liff.getProfile().catch(() => null)
        if (profile?.displayName) setName(profile.displayName)
        const token = liff.getIDToken()
        if (token) {
          const res = await fetch('/api/miniapp/me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: token }),
          })
          const data = await res.json()
          setLinked(!!data.linked)
        }
      } catch (e) {
        console.warn('[mypage] init:', e)
        setLinked(false)
      }
    })()
  }, [])

  const links = [
    { label: 'カルテ・施術履歴', href: '/miniapp/history', desc: 'これまでの施術記録' },
    { label: '予約する', href: '/miniapp/booking', desc: '次回のご予約' },
    { label: '購入履歴', href: '/miniapp/orders', desc: 'ご注文と発送状況' },
    { label: '製品一覧', href: '/miniapp/products', desc: 'おすすめ製品を見る' },
    { label: '髪質診断', href: '/tools/hair-check', desc: 'あなたに合うケアを診断' },
  ]

  return (
    <div style={wrap}>
      <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{name || 'ゲスト'} 様</div>
        {linked === true && <div style={{ fontSize: 12, color: '#3c7d4e', marginTop: 4 }}>連携済み</div>}
        {linked === false && (
          <a href="/miniapp/link" style={{ fontSize: 12, color: C.rose, marginTop: 4, display: 'inline-block' }}>未連携 ・ 連携する →</a>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map((l) => (
          <a key={l.href} href={l.href} style={rowLink}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{l.label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{l.desc}</div>
            </div>
            <span style={{ color: C.gold, fontSize: 18 }}>›</span>
          </a>
        ))}
      </div>

      <div style={{ height: 80 }} />
      <MiniappNav active="mypage" />
    </div>
  )
}

const wrap: React.CSSProperties = { maxWidth: 480, margin: '0 auto', padding: 16, background: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }
const rowLink: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 16px', textDecoration: 'none' }
