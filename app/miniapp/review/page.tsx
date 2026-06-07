'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import liff from '@line/liff'

const C = { rose: '#C9A961', gold: '#C9A961', ink: '#2b2622', muted: '#6f655d', line: '#ece6df' }

function ReviewForm() {
  const sp = useSearchParams()
  const productId = sp.get('product_id') || ''
  const orderId = sp.get('order_id') || ''
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER
        if (!liffId) return
        await liff.init({ liffId })
        if (!liff.isLoggedIn()) { liff.login(); return }
        const t = liff.getIDToken()
        if (t) setToken(t)
      } catch (e) {
        console.warn('[review] liff init:', e)
      }
    })()
  }, [])

  async function submit() {
    if (rating < 1) { setErrorMsg('評価を選択してください'); return }
    if (!text.trim()) { setErrorMsg('口コミ本文を入力してください'); return }
    setSubmitting(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/miniapp/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: token, product_id: productId, order_id: orderId, rating, body: text }),
      })
      const data = await res.json()
      if (data.ok) { setDone(true); return }
      setErrorMsg(data.error || '投稿に失敗しました')
    } catch {
      setErrorMsg('エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={wrap}>
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <div style={{ fontSize: 40 }}>✓</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginTop: 12 }}>投稿ありがとうございます</p>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.7 }}>確認後に公開されます。<br />ご協力ありがとうございました。</p>
          <a href="/miniapp/orders" style={{ ...submitBtn, display: 'inline-block', marginTop: 24, textDecoration: 'none', width: 'auto', padding: '12px 32px' }}>購入履歴に戻る</a>
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 18, fontWeight: 800, color: C.ink, textAlign: 'center', margin: '8px 0 20px' }}>口コミを投稿</h1>

      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>星評価<span style={{ color: C.rose, marginLeft: 6 }}>(必須)</span></div>
      <div style={{ display: 'flex', gap: 6, margin: '10px 0 20px' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 32, color: n <= rating ? C.gold : '#dcd3c7', padding: 0 }}>★</button>
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>口コミ本文<span style={{ color: C.rose, marginLeft: 6 }}>(必須)</span></div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 500))}
        placeholder="使用感や香り、効果など、感想をお聞かせください。"
        style={{ width: '100%', minHeight: 120, marginTop: 8, padding: 12, border: `1px solid ${C.line}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
      />
      <div style={{ textAlign: 'right', fontSize: 11, color: C.muted, marginTop: 4 }}>{text.length}/500</div>

      <p style={{ fontSize: 11, color: '#9a8f85', marginTop: 12, lineHeight: 1.7 }}>
        ※個人情報や誇張・中傷は掲載されません<br />
        ※投稿は運営による確認後に公開されます
      </p>

      {errorMsg && <p style={{ color: C.rose, fontSize: 13, marginTop: 10 }}>{errorMsg}</p>}

      <button onClick={submit} disabled={submitting} style={{ ...submitBtn, opacity: submitting ? 0.6 : 1, marginTop: 16 }}>
        {submitting ? '送信中...' : '投稿する'}
      </button>
      <div style={{ height: 40 }} />
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div style={wrap}><p style={{ textAlign: 'center', color: C.muted, marginTop: 40 }}>読み込み中...</p></div>}>
      <ReviewForm />
    </Suspense>
  )
}

const wrap: React.CSSProperties = { maxWidth: 480, margin: '0 auto', padding: 16, background: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }
const submitBtn: React.CSSProperties = { width: '100%', background: C.rose, color: '#fff', border: 'none', borderRadius: 12, padding: 15, fontSize: 15, fontWeight: 700, cursor: 'pointer' }
