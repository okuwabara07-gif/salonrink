'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import PassNavLink from '../../_components/PassNavLink'
import { PASS_TOKENS as T } from '../../_components/PassCard'
import { PassHeader, PassNotice, PassPage } from '../../_components/PassHeader'
import { linkPass, PASS_SALON_NAME, type PassLinkResult } from '../../_lib/passApi'
import { PASS_OUTSIDE_MESSAGE, usePassUser } from '../../_lib/usePassUser'

type View =
  | { kind: 'checking' }
  | { kind: 'form' }
  | { kind: 'done'; balance: number }
  | { kind: 'not_found' }
  | { kind: 'token_invalid' }
  | { kind: 'error' }

const serif = 'var(--font-serif)'

const primaryButton = {
  background: T.button,
  color: '#fff',
  borderRadius: '99px',
  minHeight: '52px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 700,
  border: 'none',
  width: '100%',
} as const

const resultScreen = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '88px 24px 32px',
  gap: '22px',
} as const

function toView(r: PassLinkResult): View {
  if (r.linked) return { kind: 'done', balance: r.balance }
  if (r.reason === 'token_invalid') return { kind: 'token_invalid' }
  return { kind: 'not_found' }
}

export default function PassLinkPage() {
  const user = usePassUser()
  const [view, setView] = useState<View>({ kind: 'checking' })
  const [kana, setKana] = useState('')
  const [digits, setDigits] = useState(['', '', '', ''])
  const [busy, setBusy] = useState(false)
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (user.status !== 'ready') return
    const token = new URLSearchParams(window.location.search).get('t')
    if (!token) {
      setView({ kind: 'form' })
      return
    }
    let cancelled = false
    linkPass(user.userId, { token })
      .then((r) => {
        if (!cancelled) setView(toView(r))
      })
      .catch(() => {
        if (!cancelled) setView({ kind: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [user.status, user.userId])

  const phone4 = digits.join('')
  const canSubmit = kana.trim().length > 0 && /^\d{4}$/.test(phone4) && !busy

  const submit = async () => {
    if (!canSubmit || user.status !== 'ready') return
    setBusy(true)
    try {
      setView(toView(await linkPass(user.userId, { kana: kana.trim(), phone4 })))
    } catch {
      setView({ kind: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const setDigit = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, '').slice(-1)
    setDigits((prev) => prev.map((d, j) => (j === i ? v : d)))
    if (v && i < 3) digitRefs.current[i + 1]?.focus()
  }

  const onDigitKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) digitRefs.current[i - 1]?.focus()
  }

  if (user.status === 'outside') {
    return (
      <PassPage>
        <PassNotice text={PASS_OUTSIDE_MESSAGE} />
      </PassPage>
    )
  }
  if (user.status === 'loading' || view.kind === 'checking') {
    return (
      <PassPage>
        <PassNotice text="読み込み中…" />
      </PassPage>
    )
  }

  if (view.kind === 'done') {
    return (
      <PassPage>
        <div style={resultScreen}>
          <div
            style={{
              alignSelf: 'center',
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              border: `2px solid ${T.goldFrame}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '38px',
              color: T.gold,
            }}
          >
            ✓
          </div>
          <span style={{ textAlign: 'center', fontFamily: serif, fontSize: '22px', fontWeight: 500, lineHeight: 1.6 }}>
            {PASS_SALON_NAME}の会員証と
            <br />
            連携しました
          </span>
          {view.balance > 0 && (
            <div
              style={{
                background: T.card,
                borderRadius: '16px',
                padding: '18px',
                boxShadow: `0 1px 0 ${T.line}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1.7, textAlign: 'center' }}>
                紙のスタンプ{view.balance}個を
                <br />
                ポイントに移行しました
              </span>
              <span style={{ fontFamily: serif, fontSize: '36px', color: T.goldDeep }}>+{view.balance}P</span>
            </div>
          )}
          <span style={{ fontSize: '15px', lineHeight: 1.7, color: T.sub, textAlign: 'center' }}>
            次回からは、お会計のたびに自動でポイントが貯まります。
          </span>
          <PassNavLink href="/liff/home" style={{ ...primaryButton, marginTop: 'auto' }}>
            会員証を見る
          </PassNavLink>
        </div>
      </PassPage>
    )
  }

  if (view.kind === 'not_found' || view.kind === 'token_invalid' || view.kind === 'error') {
    const message =
      view.kind === 'not_found'
        ? '入力内容は受け付けました。次回ご来店時にスタッフが確認します。紙のスタンプも、確認後にポイントへ移行します。'
        : view.kind === 'token_invalid'
          ? 'QRの有効期限が切れています。お店でもう一度表示してもらってください。'
          : '通信がうまくいきませんでした。時間をおいてもう一度お試しください。'
    const title =
      view.kind === 'not_found' ? (
        <>
          会員情報が
          <br />
          見つかりませんでした
        </>
      ) : view.kind === 'token_invalid' ? (
        <>
          QRを読み取れません
          <br />
          でした
        </>
      ) : (
        <>連携できませんでした</>
      )
    return (
      <PassPage>
        <div style={resultScreen}>
          <div
            style={{
              alignSelf: 'center',
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              border: `2px solid ${T.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: serif,
              fontSize: '36px',
              color: T.weak,
            }}
          >
            ？
          </div>
          <span style={{ textAlign: 'center', fontFamily: serif, fontSize: '22px', fontWeight: 500, lineHeight: 1.6 }}>
            {title}
          </span>
          <div style={{ background: T.card, borderRadius: '16px', padding: '18px', boxShadow: `0 1px 0 ${T.line}` }}>
            <span style={{ fontSize: '16px', lineHeight: 1.8 }}>{message}</span>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setView({ kind: 'form' })}
              style={{
                border: `1.5px solid ${T.line}`,
                background: T.card,
                color: T.text,
                borderRadius: '99px',
                minHeight: '52px',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              {view.kind === 'token_invalid' ? 'お名前と電話番号で連携する' : '入力内容を見直す'}
            </button>
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
      <PassHeader title="会員情報の連携" backHref="/liff/home" />
      <div style={{ padding: '24px 20px 32px', display: 'flex', flexDirection: 'column', gap: '22px', flex: 1 }}>
        <span style={{ fontSize: '16px', lineHeight: 1.75 }}>
          お店に登録しているお名前と、電話番号の下4桁を入力してください。
        </span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>お名前（カナ）</span>
          <input
            value={kana}
            onChange={(e) => setKana(e.target.value)}
            placeholder="タナカ ハナコ"
            autoComplete="off"
            style={{
              minHeight: '56px',
              borderRadius: '12px',
              background: T.card,
              border: `1.5px solid ${kana ? T.goldFrame : T.line}`,
              padding: '0 16px',
              fontSize: '18px',
              color: T.text,
              outline: 'none',
            }}
          />
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>電話番号の下4桁</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  digitRefs.current[i] = el
                }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onDigitKey(i, e)}
                inputMode="numeric"
                autoComplete="off"
                aria-label={`電話番号の下4桁 ${i + 1}桁目`}
                style={{
                  width: '60px',
                  height: '64px',
                  borderRadius: '12px',
                  background: T.card,
                  border: `1.5px solid ${d ? T.goldFrame : T.line}`,
                  textAlign: 'center',
                  fontFamily: serif,
                  fontSize: '28px',
                  color: T.text,
                  outline: 'none',
                }}
              />
            ))}
          </div>
        </div>
        <span style={{ fontSize: '14px', lineHeight: 1.7, color: T.sub }}>
          入力した情報は、会員情報の照合にのみ使います。
        </span>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => void submit()}
          style={{ ...primaryButton, marginTop: 'auto', opacity: canSubmit ? 1 : 0.4 }}
        >
          {busy ? '確認中…' : '連携する'}
        </button>
      </div>
    </PassPage>
  )
}
