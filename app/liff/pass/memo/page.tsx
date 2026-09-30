'use client'

import { useEffect, useState } from 'react'
import PassNavLink from '../../_components/PassNavLink'
import { PASS_TOKENS as T } from '../../_components/PassCard'
import { PassHeader, PassNotice, PassPage } from '../../_components/PassHeader'
import { fetchPass, sendPassMemo, type PassGet, type PassMemoChoice } from '../../_lib/passApi'
import { useRedirectIfUnlinked } from '../../_lib/useRedirectIfUnlinked'
import { PASS_OUTSIDE_MESSAGE, usePassUser } from '../../_lib/usePassUser'

const serif = 'var(--font-serif)'
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

const CHOICES: { key: PassMemoChoice; label: string }[] = [
  { key: 'same', label: '前回と同じ' },
  { key: 'brighter', label: '少し明るくしたい' },
  { key: 'gray_concern', label: '白髪が気になる' },
  { key: 'photo', label: '写真で伝えたい' },
]

function reservationLabel(iso: string): string {
  const jst = new Date(new Date(iso).getTime() + 9 * 3600 * 1000)
  const hh = String(jst.getUTCHours()).padStart(2, '0')
  const mm = String(jst.getUTCMinutes()).padStart(2, '0')
  return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}（${WEEKDAYS[jst.getUTCDay()]}）${hh}:${mm}`
}

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

type Sent = { attached: boolean }

export default function PassMemoPage() {
  const user = usePassUser()
  const [pass, setPass] = useState<PassGet | null>(null)
  const [passFailed, setPassFailed] = useState(false)
  const [choice, setChoice] = useState<PassMemoChoice | null>(null)
  const [memoText, setMemoText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<Sent | null>(null)

  useEffect(() => {
    if (user.status !== 'ready') return
    let cancelled = false
    fetchPass(user.userId)
      .then((d) => {
        if (!cancelled) setPass(d)
      })
      .catch((e) => {
        console.warn('[PassMemo]', e instanceof Error ? e.message : e)
        if (!cancelled) setPassFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [user.status, user.userId])

  useRedirectIfUnlinked(pass)
  const reservationAt = pass?.linked ? pass.next_reservation_at : null

  const submit = async () => {
    if (!choice || busy || user.status !== 'ready') return
    setBusy(true)
    setError(null)
    try {
      const r = await sendPassMemo(user.userId, {
        choice,
        memo_text: memoText.trim() || undefined,
        concerns: [],
      })
      setSent({ attached: r.reservation_id != null })
    } catch {
      setError('送信できませんでした。時間をおいてもう一度お試しください。')
    } finally {
      setBusy(false)
    }
  }

  if (user.status === 'outside') {
    return (
      <PassPage>
        <PassNotice text={PASS_OUTSIDE_MESSAGE} />
      </PassPage>
    )
  }
  if (user.status === 'loading' || (!pass && !passFailed)) {
    return (
      <PassPage>
        <PassNotice text="読み込み中…" />
      </PassPage>
    )
  }
  if (pass && !pass.linked) {
    return (
      <PassPage>
        <PassNotice text="会員連携の画面へ移動します…" />
      </PassPage>
    )
  }
  if (passFailed) {
    return (
      <PassPage>
        <PassHeader title="今回のご希望" backHref="/liff/home" />
        <PassNotice text="会員証を読み込めませんでした。時間をおいてもう一度お試しください。" />
      </PassPage>
    )
  }

  if (sent) {
    const choiceLabel = CHOICES.find((c) => c.key === choice)?.label ?? ''
    return (
      <PassPage>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '88px 24px 32px', gap: '22px' }}>
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
          <span style={{ textAlign: 'center', fontFamily: serif, fontSize: '22px', fontWeight: 500 }}>
            {/* TODO(design): 予約に紐付かなかった場合の文言はデザイン未定義 */}
            {sent.attached ? 'スタッフに伝わりました' : '内容を保存しました'}
          </span>
          <div
            style={{
              background: T.card,
              borderRadius: '16px',
              padding: '18px',
              boxShadow: `0 1px 0 ${T.line}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {sent.attached && reservationAt && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14px', color: T.sub }}>ご予約</span>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>{reservationLabel(reservationAt)}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                ...(sent.attached && reservationAt
                  ? { borderTop: `1px solid ${T.lineSoft}`, paddingTop: '12px' }
                  : {}),
              }}
            >
              <span style={{ fontSize: '14px', color: T.sub }}>お伝えした内容</span>
              <span style={{ fontSize: '16px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {choiceLabel}
                {memoText.trim() ? `\n${memoText.trim()}` : ''}
              </span>
            </div>
          </div>
          <span style={{ fontSize: '15px', lineHeight: 1.7, color: T.sub, textAlign: 'center' }}>
            {sent.attached
              ? 'ご来店前なら、いつでも内容を変えられます。'
              : '次回のご予約が見つからなかったため、まだスタッフの一覧には表示されません。ご予約後に、もう一度お送りください。'}
          </span>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setSent(null)}
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
              内容を変更する
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

  const canSubmit = choice != null && !busy

  return (
    <PassPage>
      <PassHeader title="今回のご希望" backHref="/liff/home" />
      <div style={{ padding: '22px 18px 32px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {reservationAt && (
          <span style={{ fontSize: '15px', color: T.sub }}>{reservationLabel(reservationAt)} のご予約</span>
        )}
        <span style={{ fontFamily: serif, fontSize: '21px', fontWeight: 500, lineHeight: 1.6 }}>
          次回のご来店について、気になることはありますか？
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {CHOICES.map((c) => {
            const on = choice === c.key
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => setChoice(c.key)}
                style={{
                  minHeight: '76px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '8px',
                  fontSize: '17px',
                  fontWeight: 700,
                  lineHeight: 1.45,
                  background: on ? T.button : T.card,
                  color: on ? '#fff' : T.text,
                  border: `1.5px solid ${on ? T.button : T.line}`,
                }}
              >
                {c.label}
              </button>
            )
          })}
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>ほかに伝えたいこと（任意）</span>
          <textarea
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            rows={3}
            style={{
              minHeight: '104px',
              borderRadius: '12px',
              background: T.card,
              border: `1.5px solid ${T.line}`,
              padding: '12px 14px',
              fontSize: '16px',
              lineHeight: 1.7,
              color: T.text,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </label>
        {error && <span style={{ fontSize: '15px', color: T.noticeText, lineHeight: 1.6 }}>{error}</span>}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => void submit()}
          style={{ ...primaryButton, marginTop: 'auto', opacity: canSubmit ? 1 : 0.4 }}
        >
          {busy ? '送信中…' : 'スタッフに伝える'}
        </button>
      </div>
    </PassPage>
  )
}
