'use client'

import React, { useEffect, useState } from 'react'
import liff from '@line/liff'
import MiniappNav from '../MiniappNav'

type OrderItem = { product_id: string; name: string; price: number; qty: number }
type Order = {
  id: string
  items: OrderItem[]
  subtotal: number
  shipping_fee: number
  total: number
  payment_status: string
  fulfillment_status: string
  created_at: string
}

const C = { rose: '#C24E40', gold: '#B08D5E', ink: '#2b2622', muted: '#6f655d', bg: '#faf8f5', line: '#ece6df' }

const FULFILL_LABEL: Record<string, { text: string; bg: string; color: string }> = {
  unshipped: { text: '発送待ち', bg: '#fbeee2', color: '#b5701f' },
  shipped: { text: '発送済み', bg: '#e6f3e9', color: '#3c7d4e' },
  cancelled: { text: 'キャンセル', bg: '#eee', color: '#777' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER
        if (!liffId) throw new Error('設定エラー')
        await liff.init({ liffId })
        if (!liff.isLoggedIn()) { liff.login(); return }
        const token = liff.getIDToken()
        if (!token) throw new Error('ログイン情報を取得できませんでした')
        const res = await fetch('/api/miniapp/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: token }),
        })
        const data = await res.json()
        if (data.error) { setErrorMsg(data.error); setState('error'); return }
        setOrders(data.orders || [])
        setState('ready')
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : 'エラーが発生しました')
        setState('error')
      }
    })()
  }, [])

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 18, fontWeight: 800, color: C.ink, textAlign: 'center', margin: '8px 0 16px' }}>購入履歴</h1>
      {state === 'loading' && <p style={msg}>読み込み中...</p>}
      {state === 'error' && <p style={msg}>{errorMsg || '読み込みに失敗しました'}</p>}
      {state === 'ready' && orders.length === 0 && <p style={msg}>まだ購入履歴がありません。</p>}
      {state === 'ready' && orders.map((o) => {
        const f = FULFILL_LABEL[o.fulfillment_status] || FULFILL_LABEL.unshipped
        const date = new Date(o.created_at).toLocaleDateString('ja-JP')
        return (
          <div key={o.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.muted }}>注文日: {date}</span>
              <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 999, background: f.bg, color: f.color }}>{f.text}</span>
            </div>
            {o.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.ink, padding: '2px 0' }}>
                <span>{it.name} × {it.qty}</span><span>¥{(it.price * it.qty).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.muted, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.line}` }}>
              <span>送料</span><span>{o.shipping_fee === 0 ? '無料' : `¥${o.shipping_fee.toLocaleString()}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 4 }}>
              <span>合計</span><span>¥{o.total.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {o.items[0] && <a href={`/miniapp/products/${o.items[0].product_id}`} style={lineBtn}>再購入</a>}
              {o.items[0] && <a href={`/miniapp/review?product_id=${o.items[0].product_id}&order_id=${o.id}`} style={lineBtn}>口コミを書く</a>}
            </div>
          </div>
        )
      })}
      <div style={{ height: 80 }} />
      <MiniappNav active="history" />
    </div>
  )
}

const wrap: React.CSSProperties = { maxWidth: 480, margin: '0 auto', padding: 16, background: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }
const msg: React.CSSProperties = { textAlign: 'center', color: C.muted, marginTop: 40 }
const card: React.CSSProperties = { border: `1px solid ${C.line}`, borderRadius: 12, padding: 14, marginBottom: 12 }
const lineBtn: React.CSSProperties = { flex: 1, textAlign: 'center', border: `1px solid ${C.rose}`, color: C.rose, borderRadius: 8, padding: '8px 0', fontSize: 13, textDecoration: 'none' }
