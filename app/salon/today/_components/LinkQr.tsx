'use client'

import { useCallback, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/client'

const MINIAPP_URL = 'https://miniapp.line.me/2010387325-N1TlMFzx'
const TOKEN_TTL_MS = 30 * 60 * 1000

type Issued = { qr: string; expiresAt: number }

function readIssue(data: unknown): { token: string; expiresAt: number | null } | null {
  const v = Array.isArray(data) ? data[0] : data
  if (typeof v === 'string' && v) return { token: v, expiresAt: null }
  if (v && typeof v === 'object') {
    const o = v as { token?: unknown; expires_at?: unknown }
    if (typeof o.token === 'string' && o.token) {
      const t = typeof o.expires_at === 'string' ? Date.parse(o.expires_at) : NaN
      return { token: o.token, expiresAt: Number.isNaN(t) ? null : t }
    }
  }
  return null
}

async function issue(customerId: string): Promise<Issued | { error: string }> {
  // TODO: 引数名 p_customer_id は pass_today の命名（p_salon_id）に合わせた推定
  const { data, error } = await createClient().rpc('pass_link_issue', { p_customer_id: customerId })
  if (error) return { error: error.message }
  const r = readIssue(data)
  if (!r) return { error: 'トークンを受け取れませんでした' }
  const url = `${MINIAPP_URL}?t=${encodeURIComponent(r.token)}`
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 448, errorCorrectionLevel: 'M' })
  return { qr, expiresAt: r.expiresAt ?? Date.now() + TOKEN_TTL_MS }
}

export default function LinkQr({
  customerId,
  name,
  balance,
}: {
  customerId: string
  name: string
  balance: number
}) {
  const [issued, setIssued] = useState<Issued | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [now, setNow] = useState(() => Date.now())
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    issue(customerId).then((r) => {
      if (cancelled) return
      if ('error' in r) setError(r.error)
      else setIssued(r)
      setBusy(false)
    })
    return () => {
      cancelled = true
    }
  }, [customerId, nonce])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [])

  const reissue = useCallback(() => {
    setBusy(true)
    setError(null)
    setIssued(null)
    setNow(Date.now())
    setNonce((n) => n + 1)
  }, [])

  const remainMin = issued ? Math.max(0, Math.ceil((issued.expiresAt - now) / 60000)) : 0
  const expired = issued != null && remainMin === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'stretch' }}>
      <div
        style={{
          alignSelf: 'center',
          width: '260px',
          height: '260px',
          borderRadius: '20px',
          background: '#fff',
          padding: '18px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 12px rgba(40,70,120,.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7A8494',
          fontSize: '13px',
          textAlign: 'center',
        }}
      >
        {busy && '発行中…'}
        {!busy && error && `QRを発行できませんでした（${error}）`}
        {!busy && issued && !expired && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={issued.qr} alt="LINE会員登録用QR" style={{ width: '100%', height: '100%' }} />
        )}
        {!busy && expired && 'QRの有効期限が切れました'}
      </div>
      <span style={{ textAlign: 'center', fontSize: '15px', fontWeight: 900, lineHeight: 1.6 }}>
        LINEで読み取ると
        <br />
        会員証が作られます
      </span>
      <span style={{ textAlign: 'center', fontSize: '12px', color: '#98948A' }}>
        このQRは{name}専用です
        {issued && !expired && ` · QRは30分で失効します（残り${remainMin}分）`}
      </span>
      {(expired || error) && (
        <button
          type="button"
          onClick={reissue}
          style={{
            alignSelf: 'center',
            minHeight: '44px',
            padding: '0 20px',
            borderRadius: '12px',
            border: 'none',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            background: 'linear-gradient(180deg,#4A90E2,#2F6FC4)',
            cursor: 'pointer',
          }}
        >
          QRを発行し直す
        </button>
      )}
      <div
        style={{
          borderRadius: '16px',
          padding: '12px 14px',
          boxShadow: 'inset 0 0 0 1px #DDE5EF',
          fontSize: '12.5px',
          lineHeight: 1.7,
          color: '#56605A',
        }}
      >
        ポイントは未連携の間も貯まっています（現在 {balance}P）。連携するとLINEに表示されます。
      </div>
    </div>
  )
}
