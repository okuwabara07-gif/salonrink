'use client'

/**
 * app/miniapp/history/page.tsx
 *
 * 施術・カラー履歴の一覧。
 * - /api/miniapp/kartes で全カルテ取得(時系列)
 * - 行タップで /api/miniapp/kartes/[id] を取得し詳細(写真込み)を展開
 *
 * オーナー専用情報はAPI側で除外済み。
 */

import { useEffect, useState } from 'react'
import liff from '@line/liff'

type Karte = {
  id: string
  visit_date: string
  summary: {
    summary?: string
    hair_condition_analysis?: string
    recommended_care?: string
  } | null
  next_recommendation: {
    next_visit_date?: string
    recommended_menu?: string
    reasoning?: string
    homecare_duration?: string
    additional_notes?: string
  } | null
  thumbnail: string | null
}

type Detail = {
  id: string
  visit_date: string
  summary: Karte['summary']
  next_recommendation: Karte['next_recommendation']
  photos: { type: string; url: string }[]
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

export default function MiniappHistoryPage() {
  const [state, setState] = useState<State>('loading')
  const [kartes, setKartes] = useState<Karte[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [idToken, setIdToken] = useState<string | null>(null)
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
        setIdToken(token)

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
        const list: Karte[] = data.kartes || []
        setKartes(list)
        setState(list.length === 0 ? 'empty' : 'ready')
      } catch (err) {
        console.error('[miniapp/history] init error:', err)
        setErrorMsg(err instanceof Error ? err.message : '不明なエラーが発生しました')
        setState('error')
      }
    }
    init()
  }, [])

  const toggle = async (id: string) => {
    if (openId === id) {
      setOpenId(null)
      setDetail(null)
      return
    }
    setOpenId(id)
    setDetail(null)
    if (!idToken) return
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/miniapp/kartes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json()
      if (data.karte) setDetail(data.karte)
    } catch {
      // 詳細取得失敗時はサマリのみ表示
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'sans-serif', paddingBottom: 80 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: C.gold, fontWeight: 700 }}>
            SALONRINK
          </div>
          <h1 style={{ fontSize: 20, color: C.ink, marginTop: 4, fontWeight: 700 }}>来店履歴</h1>
        </div>

        {state === 'loading' && <p style={{ color: C.muted, textAlign: 'center', marginTop: 40 }}>読み込み中...</p>}
        {state === 'error' && <p style={{ color: C.rose, textAlign: 'center', marginTop: 40 }}>{errorMsg}</p>}
        {state === 'empty' && (
          <p style={{ color: C.muted, textAlign: 'center', marginTop: 40, lineHeight: 1.9 }}>
            まだ履歴がありません。<br />ご来店後にこちらに記録されます。
          </p>
        )}

        {state === 'ready' &&
          kartes.map((k) => {
            const open = openId === k.id
            return (
              <div key={k.id} style={cardStyle}>
                <button onClick={() => toggle(k.id)} style={rowBtn}>
                  {k.thumbnail ? (
                    <img src={k.thumbnail} alt="" style={thumb} />
                  ) : (
                    <div style={{ ...thumb, background: C.line }} />
                  )}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>
                      {formatDate(k.visit_date)}
                    </div>
                    {k.summary?.summary && (
                      <div style={{ fontSize: 13, color: C.muted, marginTop: 2, lineHeight: 1.6 }}>
                        {k.summary.summary.length > 40
                          ? k.summary.summary.slice(0, 40) + '…'
                          : k.summary.summary}
                      </div>
                    )}
                  </div>
                  <span style={{ color: C.gold, fontSize: 18 }}>{open ? '−' : '+'}</span>
                </button>

                {open && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
                    {detailLoading && <p style={subText}>読み込み中...</p>}
                    {detail && detail.id === k.id && (
                      <>
                        {detail.photos.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            {detail.photos.map((p, i) => (
                              <div key={i} style={{ flex: 1 }}>
                                <div style={subLabel}>{p.type === 'before' ? '施術前' : '施術後'}</div>
                                <img src={p.url} alt="" style={photoStyle} />
                              </div>
                            ))}
                          </div>
                        )}
                        {detail.summary?.hair_condition_analysis && (
                          <div style={block}>
                            <div style={subLabel}>髪の状態</div>
                            <p style={subText}>{detail.summary.hair_condition_analysis}</p>
                          </div>
                        )}
                        {detail.summary?.recommended_care && (
                          <div style={block}>
                            <div style={subLabel}>おすすめのケア</div>
                            <p style={subText}>{detail.summary.recommended_care}</p>
                          </div>
                        )}
                        {detail.next_recommendation?.recommended_menu && (
                          <div style={block}>
                            <div style={subLabel}>次回のご提案</div>
                            <p style={subText}>
                              {detail.next_recommendation.recommended_menu}
                              {detail.next_recommendation.next_visit_date &&
                                `（${formatDate(detail.next_recommendation.next_visit_date)}頃）`}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
      </div>

      <nav style={navStyle}>
        <a href="/miniapp" style={navItem}>ホーム</a>
        <a href="/miniapp/history" style={{ ...navItem, color: C.rose, fontWeight: 700 }}>履歴</a>
        <a href="/miniapp/booking" style={navItem}>予約</a>
      </nav>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
}
const rowBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
}
const thumb: React.CSSProperties = { width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }
const photoStyle: React.CSSProperties = { width: '100%', borderRadius: 8, marginTop: 4 }
const block: React.CSSProperties = { marginBottom: 10 }
const subLabel: React.CSSProperties = { fontSize: 12, color: '#B08D5E', fontWeight: 700, marginBottom: 3 }
const subText: React.CSSProperties = { color: '#6f655d', fontSize: 14, lineHeight: 1.8, margin: 0 }
const navStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  background: '#fff',
  borderTop: '1px solid #ece6df',
  maxWidth: 480,
  margin: '0 auto',
}
const navItem: React.CSSProperties = {
  flex: 1,
  textAlign: 'center',
  padding: '14px 0',
  fontSize: 13,
  color: '#6f655d',
  textDecoration: 'none',
}
