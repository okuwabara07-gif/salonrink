'use client'

import { useEffect, useState } from 'react'
import PassNavLink from '../../_components/PassNavLink'
import { PASS_TOKENS as T } from '../../_components/PassCard'
import { PassHeader, PassNotice, PassPage } from '../../_components/PassHeader'
import PassReserveButton from '../../_components/PassReserveButton'
import { fetchPass, isReserveUrl, setPassReserve, type PassGet } from '../../_lib/passApi'
import { PASS_OUTSIDE_MESSAGE, usePassUser } from '../../_lib/usePassUser'

const primaryButton = {
  background: T.button,
  color: '#fff',
  borderRadius: '99px',
  minHeight: '52px',
  fontSize: '16px',
  fontWeight: 700,
  border: 'none',
  width: '100%',
} as const

const field = {
  minHeight: '52px',
  borderRadius: '12px',
  background: T.card,
  border: `1.5px solid ${T.line}`,
  padding: '0 14px',
  fontSize: '16px',
  color: T.text,
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
} as const

type Msg = { kind: 'ok' | 'error'; text: string } | null

const SAVE_FAILED = '保存できませんでした。時間をおいてもう一度お試しください。'

export default function PassReservePage() {
  const user = usePassUser()
  const [pass, setPass] = useState<PassGet | null>(null)
  const [failed, setFailed] = useState(false)
  const [salonName, setSalonName] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null)
  const [msg, setMsg] = useState<Msg>(null)

  useEffect(() => {
    if (user.status !== 'ready') return
    let cancelled = false
    fetchPass(user.userId)
      .then((d) => {
        if (cancelled) return
        setPass(d)
        setSalonName(d.user_reserve?.salon_name ?? '')
        setUrl(d.user_reserve?.reserve_url ?? '')
      })
      .catch((e) => {
        console.warn('[PassReserve]', e instanceof Error ? e.message : e)
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [user.status, user.userId])

  const send = async (kind: 'save' | 'delete') => {
    if (busy || user.status !== 'ready') return
    const reserveUrl = kind === 'delete' ? '' : url.trim()
    if (kind === 'save' && !isReserveUrl(reserveUrl)) {
      setMsg({ kind: 'error', text: '予約ページのURLは https:// で始まる形で入力してください。' })
      return
    }
    setBusy(kind)
    setMsg(null)
    try {
      const r = await setPassReserve(user.userId, {
        salon_name: kind === 'delete' ? '' : salonName.trim(),
        reserve_url: reserveUrl,
      })
      if (!r.ok) {
        setMsg({ kind: 'error', text: 'このURLは登録できません。https:// で始まる予約ページのURLを入力してください。' })
        return
      }
      const d = await fetchPass(user.userId)
      setPass(d)
      setSalonName(d.user_reserve?.salon_name ?? '')
      setUrl(d.user_reserve?.reserve_url ?? '')
      setMsg({ kind: 'ok', text: kind === 'delete' ? '予約先を削除しました' : '保存しました' })
    } catch {
      setMsg({ kind: 'error', text: SAVE_FAILED })
    } finally {
      setBusy(null)
    }
  }

  let body
  if (user.status === 'outside') {
    body = <PassNotice text={PASS_OUTSIDE_MESSAGE} />
  } else if (failed) {
    body = <PassNotice text="読み込めませんでした。時間をおいてもう一度お試しください。" />
  } else if (!pass) {
    body = <PassNotice text="読み込み中…" />
  } else if (pass.reserve_source === 'salon') {
    body = (
      <div style={{ padding: '22px 18px 32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div
          style={{
            background: T.surface,
            borderRadius: '14px',
            padding: '16px',
            fontSize: '16px',
            lineHeight: 1.75,
          }}
        >
          お店が登録した予約先が使われます
        </div>
        <PassReserveButton
          data={{ reserve_url: pass.reserve_url, has_pending_bonus: false, next_reservation_at: null }}
        />
      </div>
    )
  } else {
    const registered = pass.user_reserve != null
    return (
      <PassPage>
        <PassHeader title="予約先の登録" backHref="/liff/home" />
        <div style={{ padding: '22px 18px 32px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <span style={{ fontSize: '16px', lineHeight: 1.75, color: T.sub }}>
            いつものサロンの予約ページを登録すると、会員証の「予約する」ボタンから開けます。
          </span>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700 }}>サロン名（任意）</span>
            <input
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              maxLength={60}
              style={field}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700 }}>予約ページのURL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="https://"
              style={field}
            />
            <span style={{ fontSize: '14px', color: T.sub, lineHeight: 1.7 }}>https:// で始まるURLを入力してください</span>
          </label>
          {msg && (
            <span style={{ fontSize: '15px', color: msg.kind === 'ok' ? T.goldDeep : T.noticeText, lineHeight: 1.6 }}>
              {msg.text}
            </span>
          )}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              disabled={busy != null}
              onClick={() => void send('save')}
              style={{ ...primaryButton, opacity: busy ? 0.4 : 1 }}
            >
              {busy === 'save' ? '保存中…' : registered ? '変更を保存する' : '保存する'}
            </button>
            {registered && (
              <button
                type="button"
                disabled={busy != null}
                onClick={() => void send('delete')}
                style={{
                  border: `1.5px solid ${T.line}`,
                  background: T.card,
                  color: T.text,
                  borderRadius: '99px',
                  minHeight: '52px',
                  fontSize: '16px',
                  fontWeight: 700,
                  opacity: busy ? 0.4 : 1,
                }}
              >
                {busy === 'delete' ? '削除中…' : '登録を削除する'}
              </button>
            )}
            <PassNavLink
              href="/liff/home"
              style={{
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: T.sub,
              }}
            >
              ホームへ戻る
            </PassNavLink>
          </div>
        </div>
      </PassPage>
    )
  }

  return (
    <PassPage>
      <PassHeader title="予約先の登録" backHref="/liff/home" />
      {body}
    </PassPage>
  )
}
