'use client'

/**
 * app/miniapp/link/page.tsx
 *
 * 顧客向けミニアプリの連携画面。
 * - LIFF 初期化(顧客チャネル: NEXT_PUBLIC_LIFF_ID_CUSTOMER)
 * - /api/miniapp/me で連携状態を確認
 * - 連携済み → ホーム(/miniapp)へ
 * - 未連携 → 電話番号入力フォーム → /api/miniapp/link
 *
 * 審査方針: 新規会員登録なし。LINEログイン＋電話番号照合のみ。
 */

import { useEffect, useState } from 'react'
import liff from '@line/liff'

type State = 'loading' | 'need_phone' | 'submitting' | 'error'

const C = {
  rose: '#C24E40',
  gold: '#B08D5E',
  ink: '#2b2622',
  bg: '#faf8f5',
  line: '#ece6df',
}

export default function MiniappLinkPage() {
  const [state, setState] = useState<State>('loading')
  const [phone, setPhone] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [idToken, setIdToken] = useState<string | null>(null)

  // 連携完了後の遷移。髪診断からの流入(?from=haircheck)で診断結果が残っていれば
  // 先にカルテ化してからホームへ。なければそのままホームへ。
  const finishAndGo = async (token: string) => {
    try {
      const params = new URLSearchParams(window.location.search)
      const fromHairCheck = params.get('from') === 'haircheck'
      const saved = sessionStorage.getItem('haircheck_result')
      if (fromHairCheck && saved) {
        const result = JSON.parse(saved)
        await fetch('/api/tools/hair-check/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token, result }),
        }).catch(() => null)
        sessionStorage.removeItem('haircheck_result')
      }
    } catch {
      // 後処理失敗でも遷移は止めない
    }
    window.location.replace('/miniapp')
  }

  useEffect(() => {
    const init = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER
        if (!liffId) throw new Error('LIFF ID が設定されていません')

        await liff.init({ liffId })
        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        const token = liff.getIDToken()
        if (!token) throw new Error('ログイン情報を取得できませんでした')
        setIdToken(token)

        const profile = await liff.getProfile().catch(() => null)

        // 連携状態を確認
        const res = await fetch('/api/miniapp/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        })
        const data = await res.json()

        if (data.linked) {
          // 連携済み → 診断結果があればカルテ化してホームへ
          await finishAndGo(token)
          return
        }

        // 未連携 → 電話番号入力へ。displayName を保持
        if (profile?.displayName) {
          sessionStorage.setItem('miniapp_display_name', profile.displayName)
        }
        setState('need_phone')
      } catch (err) {
        console.error('[miniapp/link] init error:', err)
        setErrorMsg(err instanceof Error ? err.message : '不明なエラーが発生しました')
        setState('error')
      }
    }
    init()
  }, [])

  const handleSubmit = async () => {
    if (!idToken) return
    if (phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('電話番号を正しく入力してください')
      return
    }
    setErrorMsg('')
    setState('submitting')
    try {
      const displayName = sessionStorage.getItem('miniapp_display_name') || undefined
      const res = await fetch('/api/miniapp/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, phone, displayName }),
      })
      const data = await res.json()

      if (data.linked) {
        await finishAndGo(idToken)
        return
      }
      setErrorMsg(data.error || '連携に失敗しました。電話番号をご確認ください。')
      setState('need_phone')
    } catch {
      setErrorMsg('通信エラーが発生しました')
      setState('need_phone')
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.2em', color: C.gold, fontWeight: 700 }}>
            SALONRINK
          </div>
          <h1 style={{ fontSize: 22, color: C.ink, marginTop: 8, fontWeight: 700 }}>
            キレイ鶴見店
          </h1>
        </div>

        {state === 'loading' && (
          <p style={{ textAlign: 'center', color: '#6f655d' }}>読み込み中...</p>
        )}

        {state === 'error' && (
          <div style={{ textAlign: 'center', color: C.rose }}>
            <p>{errorMsg}</p>
          </div>
        )}

        {(state === 'need_phone' || state === 'submitting') && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <p style={{ color: C.ink, fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
              はじめまして。ご来店時にご登録いただいたお電話番号で連携します。
            </p>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="電話番号(ハイフンなし)"
              disabled={state === 'submitting'}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                border: `1px solid ${C.line}`,
                borderRadius: 8,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {errorMsg && (
              <p style={{ color: C.rose, fontSize: 13, marginTop: 8 }}>{errorMsg}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={state === 'submitting'}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '14px',
                fontSize: 16,
                fontWeight: 700,
                color: '#fff',
                background: state === 'submitting' ? '#d8a89f' : C.rose,
                border: 'none',
                borderRadius: 8,
                cursor: state === 'submitting' ? 'default' : 'pointer',
              }}
            >
              {state === 'submitting' ? '連携中...' : '連携する'}
            </button>
            <p style={{ color: '#9a8f85', fontSize: 12, marginTop: 16, lineHeight: 1.7 }}>
              電話番号が見つからない場合は、店舗スタッフにお問い合わせください。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
