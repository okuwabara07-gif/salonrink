'use client'

import React, { useEffect, useState } from 'react'
import MiniappNav from '../MiniappNav'

type Product = {
  id: string
  name: string
  brand: string | null
  price: number
  volume: string | null
  image_url: string | null
  is_set: boolean
  fulfillment_type: 'inhouse' | 'affiliate'
  is_entry: boolean
}

const C = { rose: '#C24E40', gold: '#B08D5E', ink: '#2b2622', muted: '#6f655d', line: '#ece6df' }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/miniapp/products')
        const data = await res.json()
        if (data.error) { setState('error'); return }
        setProducts(data.products || [])
        setState('ready')
      } catch { setState('error') }
    })()
  }, [])

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 18, fontWeight: 800, color: C.ink, textAlign: 'center', margin: '8px 0 16px' }}>製品一覧</h1>

      {state === 'loading' && <p style={msg}>読み込み中...</p>}
      {state === 'error' && <p style={msg}>読み込みに失敗しました</p>}
      {state === 'ready' && products.length === 0 && <p style={msg}>製品がまだありません。</p>}

      {state === 'ready' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {products.map((p) => (
            <a key={p.id} href={`/miniapp/products/${p.id}`} style={cardLink}>
              <div style={{ width: '100%', height: 120, background: '#f3ece1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 }}>
                {p.image_url ? <img src={p.image_url} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span style={{ color: '#b8ab9b', fontSize: 12 }}>画像準備中</span>}
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
                {p.is_entry && <span style={tagEntry}>エントリー</span>}
                {p.is_set && <span style={tagSet}>セット</span>}
                <span style={p.fulfillment_type === 'affiliate' ? tagAff : tagSalon}>{p.fulfillment_type === 'affiliate' ? 'Amazon・楽天' : 'サロン発送'}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.4 }}>{p.name}</div>
              {p.brand && <div style={{ fontSize: 11, color: C.muted }}>{p.brand}</div>}
              <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 4 }}>¥{p.price.toLocaleString()}<span style={{ fontSize: 10, color: C.muted, marginLeft: 3, fontWeight: 400 }}>{p.fulfillment_type === 'affiliate' ? '参考' : '税込'}</span></div>
            </a>
          ))}
        </div>
      )}

      <div style={{ height: 80 }} />
      <MiniappNav active="products" />
    </div>
  )
}

const wrap: React.CSSProperties = { maxWidth: 480, margin: '0 auto', padding: 16, background: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }
const msg: React.CSSProperties = { textAlign: 'center', color: C.muted, marginTop: 40 }
const cardLink: React.CSSProperties = { border: `1px solid ${C.line}`, borderRadius: 12, padding: 10, textDecoration: 'none', display: 'block' }
const tagEntry: React.CSSProperties = { fontSize: 9, background: '#f3ece1', color: '#8a7a63', borderRadius: 999, padding: '1px 6px' }
const tagSet: React.CSSProperties = { fontSize: 9, background: '#fbeae7', color: C.rose, borderRadius: 999, padding: '1px 6px' }
const tagSalon: React.CSSProperties = { fontSize: 9, border: `1px solid ${C.rose}`, color: C.rose, borderRadius: 999, padding: '0 6px' }
const tagAff: React.CSSProperties = { fontSize: 9, background: '#eee', color: '#666', borderRadius: 999, padding: '1px 6px' }
