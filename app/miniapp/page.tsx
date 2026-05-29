'use client'

/**
 * app/miniapp/page.tsx
 *
 * 顧客向けミニアプリ ホーム。
 * - LIFF init → IDトークン取得
 * - /api/miniapp/kartes で自分のカルテ取得
 * - 未連携(linked:false) → /miniapp/link へ誘導
 * - 最新カルテのサマリ + 次回提案 + 予約CTA を表示
 *
 * オーナー専用情報(警告・接客台本)はAPI側で除外済みのため、ここには届かない。
 */

import { useEffect, useState } from 'react'
import MiniappNav from './MiniappNav'
import liff from '@line/liff'

type Summary = {
  summary?: string
  hair_condition_analysis?: string
  recommended_care?: string
} | null

type Reco = {
  next_visit_date?: string
  recommended_menu?: string
  reasoning?: string
  homecare_duration?: string
  additional_notes?: string
} | null

type Karte = {
  id: string
  visit_date: string
  summary: Summary
  next_recommendation: Reco
}

type State = 'loading' | 'ready' | 'unlinked' | 'empty' | 'error'

const C = {
  rose: '#C24E40',
  gold: '#B08D5E',
  ink: '#2b2622',
  muted: '#6f655d',
  bg: '#faf8f5',
  line: '#ece6df',
}

function formatDate(d: string): string {
  try {
    const dt = new Date(d)
    return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`
  } catch {
    return d
  }
}

export default function MiniappHomePage() {
  const [state, setState] = useState<State>('loading')
  const [latest, setLatest] = useState<Karte | null>(null)
  const [count, setCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

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

        const res = await fetch('/api/miniapp/kartes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        })
        const data = await res.json()

        if (data.linked === false) {
          window.location.replace('/miniapp/link')
          return
        }
        const kartes: Karte[] = data.kartes || []
        setCount(kartes.length)
        if (kartes.length === 0) {
          setState('empty')
          return
        }
        setLatest(kartes[0])
        setState('ready')
      } catch (err) {
        console.error('[miniapp/home] init error:', err)
        setErrorMsg(err instanceof Error ? err.message : '不明なエラーが発生しました')
        setState('error')
      }
    }
    init()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'sans-serif', paddingBottom: 80 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>
        {/* ヘッダー */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: C.gold, fontWeight: 700 }}>
            SALONRINK
          </div>
          <h1 style={{ fontSize: 20, color: C.ink, marginTop: 4, fontWeight: 700 }}>
            マイカルテ
          </h1>
        </div>

        {state === 'loading' && <p style={{ color: C.muted, textAlign: 'center', marginTop: 40 }}>読み込み中...</p>}

        {state === 'error' && (
          <p style={{ color: C.rose, textAlign: 'center', marginTop: 40 }}>{errorMsg}</p>
        )}

        {state === 'empty' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, textAlign: 'center', marginTop: 20 }}>
            <p style={{ color: C.ink, fontSize: 15, lineHeight: 1.9 }}>
              まだカルテがありません。<br />ご来店後にこちらで履歴を確認できます。
            </p>
            <button
              onClick={() => (window.location.href = '/miniapp/booking')}
              style={ctaStyle}
            >
              予約する
            </button>
          </div>
        )}

        {state === 'ready' && latest && (
          <>
            {/* 最新カルテ */}
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, marginBottom: 6 }}>
                最新のご来店 ・ {formatDate(latest.visit_date)}
              </div>
              {latest.summary?.summary && (
                <p style={{ color: C.ink, fontSize: 15, lineHeight: 1.9, margin: '8px 0' }}>
                  {latest.summary.summary}
                </p>
              )}
              {latest.summary?.recommended_care && (
                <div style={subBlock}>
                  <div style={subLabel}>おすすめのケア</div>
                  <p style={subText}>{latest.summary.recommended_care}</p>
                </div>
              )}
            </div>

            {/* 次回提案 */}
            {latest.next_recommendation && (
              <div style={{ ...cardStyle, borderLeft: `4px solid ${C.rose}` }}>
                <div style={{ fontSize: 13, color: C.rose, fontWeight: 700, marginBottom: 8 }}>
                  次回のご提案
                </div>
                {latest.next_recommendation.recommended_menu && (
                  <p style={{ color: C.ink, fontSize: 15, fontWeight: 600, margin: '4px 0' }}>
                    {latest.next_recommendation.recommended_menu}
                  </p>
                )}
                {latest.next_recommendation.next_visit_date && (
                  <p style={subText}>
                    おすすめ時期：{formatDate(latest.next_recommendation.next_visit_date)}頃
                  </p>
                )}
                {latest.next_recommendation.reasoning && (
                  <p style={{ ...subText, marginTop: 6 }}>{latest.next_recommendation.reasoning}</p>
                )}
              </div>
            )}

            <button
              onClick={() => (window.location.href = '/miniapp/booking')}
              style={ctaStyle}
            >
              この内容で予約する
            </button>

            <p style={{ textAlign: 'center', color: C.muted, fontSize: 13, marginTop: 16 }}>
              これまでのご来店：{count}回　
              <a href="/miniapp/history" style={{ color: C.rose, textDecoration: 'underline' }}>
                履歴をすべて見る
              </a>
            </p>
          </>
        )}
      </div>

      {/* 下部ナビ */}
      <MiniappNav active="home" />
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
}
const subBlock: React.CSSProperties = { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }
const subLabel: React.CSSProperties = { fontSize: 12, color: C.gold, fontWeight: 700, marginBottom: 4 }
const subText: React.CSSProperties = { color: C.muted, fontSize: 14, lineHeight: 1.8, margin: 0 }
const ctaStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 8,
  padding: '15px',
  fontSize: 16,
  fontWeight: 700,
  color: '#fff',
  background: C.rose,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
}
const navStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  background: '#fff',
  borderTop: `1px solid ${C.line}`,
  maxWidth: 480,
  margin: '0 auto',
}
const navItem: React.CSSProperties = {
  flex: 1,
  textAlign: 'center',
  padding: '14px 0',
  fontSize: 13,
  color: C.muted,
  textDecoration: 'none',
}
