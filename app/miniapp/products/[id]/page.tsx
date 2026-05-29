'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Product = {
  id: string
  name: string
  brand: string | null
  price: number
  volume: string | null
  image_url: string | null
  effect_text: string | null
  usage_text: string | null
  is_set: boolean
  set_items: string[]
  stock: number
  fulfillment_type: 'inhouse' | 'affiliate'
  ec_url: string | null
}
type Review = { id: string; rating: number; body: string | null; created_at: string }

const C = { rose: '#C24E40', gold: '#B08D5E', ink: '#2b2622', muted: '#6f655d', bg: '#faf8f5', line: '#ece6df' }

export default function ProductDetailPage() {
  const params = useParams()
  const id = String(params?.id || '')
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [avg, setAvg] = useState<number | null>(null)
  const [count, setCount] = useState(0)
  const [qty, setQty] = useState(1)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/miniapp/products/${id}`)
        const data = await res.json()
        if (data.error) { setState('error'); return }
        setProduct(data.product)
        setReviews(data.reviews || [])
        setAvg(data.review_avg)
        setCount(data.review_count || 0)
        setState('ready')
      } catch { setState('error') }
    })()
  }, [id])

  if (state === 'loading') return <div style={wrap}><p style={{ textAlign: 'center', color: C.muted, marginTop: 40 }}>読み込み中...</p></div>
  if (state === 'error' || !product) return <div style={wrap}><p style={{ textAlign: 'center', color: C.muted, marginTop: 40 }}>製品が見つかりませんでした。</p></div>

  const isAff = product.fulfillment_type === 'affiliate'

  return (
    <div style={wrap}>
      <div style={{ width: '100%', height: 240, background: '#f3ece1', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
          : <span style={{ color: '#b8ab9b', fontSize: 13 }}>画像準備中</span>}
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 800, color: C.ink, margin: '16px 0 2px' }}>{product.name}</h1>
      {product.brand && <div style={{ fontSize: 13, color: C.muted }}>{product.brand}</div>}
      <div style={{ display: 'inline-block', fontSize: 11, marginTop: 8, ...(isAff ? affBadge : salonBadge) }}>
        {isAff ? 'Amazon・楽天' : 'サロン発送'}
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, marginTop: 12 }}>
        ¥{product.price.toLocaleString()}<span style={{ fontSize: 12, color: C.muted, marginLeft: 4, fontWeight: 400 }}>{isAff ? '参考価格' : '税込'}</span>
      </div>
      {product.volume && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{product.volume}</div>}

      <div style={divider} />

      {product.effect_text && (<><div style={subLabel}>効果・効能(薬機法準拠)</div><p style={subText}>{product.effect_text}</p></>)}
      {product.usage_text && (<><div style={{ ...subLabel, marginTop: 14 }}>使い方</div><p style={subText}>{product.usage_text}</p></>)}
      {product.is_set && product.set_items?.length > 0 && (<><div style={{ ...subLabel, marginTop: 14 }}>セット内容</div><p style={subText}>{product.set_items.join(' / ')}</p></>)}

      <div style={divider} />

      <div style={subLabel}>口コミ({count}件){avg != null && <span style={{ color: C.gold, marginLeft: 8 }}>★ {avg}</span>}</div>
      {reviews.length === 0 && <p style={{ ...subText, fontSize: 13 }}>まだ口コミはありません。</p>}
      {reviews.map((r) => (
        <div key={r.id} style={{ borderTop: `1px solid ${C.line}`, padding: '10px 0' }}>
          <div style={{ color: C.gold, fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
          {r.body && <p style={{ ...subText, fontSize: 13, marginTop: 4 }}>{r.body}</p>}
        </div>
      ))}

      <div style={{ height: 24 }} />

      {isAff ? (
        <a href={product.ec_url || '#'} target="_blank" rel="noopener noreferrer" style={{ ...affBtn, textDecoration: 'none' }}>
          外部サイトで見る ↗
        </a>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={subLabel}>数量</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${C.line}`, borderRadius: 999, padding: '6px 14px' }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={stepper}>−</button>
              <span style={{ minWidth: 20, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} style={stepper}>＋</button>
            </div>
          </div>
          <button disabled style={{ ...buyBtn, opacity: 0.5 }}>購入手続きへ(準備中)</button>
          <p style={{ fontSize: 11, color: '#9a8f85', marginTop: 10, textAlign: 'center' }}>※購入機能は近日公開予定です。</p>
        </>
      )}
      <div style={{ height: 40 }} />
    </div>
  )
}

const wrap: React.CSSProperties = { maxWidth: 420, margin: '0 auto', padding: 16, background: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }
const divider: React.CSSProperties = { borderTop: `1px solid ${C.line}`, margin: '16px 0' }
const subLabel: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: C.ink }
const subText: React.CSSProperties = { fontSize: 14, color: C.muted, lineHeight: 1.7, margin: '4px 0 0' }
const salonBadge: React.CSSProperties = { border: `1px solid ${C.rose}`, color: C.rose, borderRadius: 999, padding: '2px 10px' }
const affBadge: React.CSSProperties = { background: '#eee', color: '#666', borderRadius: 999, padding: '2px 10px' }
const buyBtn: React.CSSProperties = { width: '100%', background: C.rose, color: '#fff', border: 'none', borderRadius: 12, padding: 15, fontSize: 15, fontWeight: 700 }
const affBtn: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'center', border: `1px solid ${C.rose}`, color: C.rose, borderRadius: 12, padding: 15, fontSize: 15, fontWeight: 700, boxSizing: 'border-box' }
const stepper: React.CSSProperties = { border: 'none', background: 'none', fontSize: 18, color: C.ink, cursor: 'pointer', width: 24 }
