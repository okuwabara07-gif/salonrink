'use client'

import { useEffect, useState } from 'react'
import { PASS_TOKENS as T } from '../_components/PassCard'
import { PassHeader, PassNotice, PassPage } from '../_components/PassHeader'
import { fetchPass, type PassGet, type PassHistoryRow, type PassLinked } from '../_lib/passApi'
import { useRedirectIfUnlinked } from '../_lib/useRedirectIfUnlinked'
import { PASS_OUTSIDE_MESSAGE, usePassUser } from '../_lib/usePassUser'

const serif = 'var(--font-serif)'

const card = {
  background: T.card,
  borderRadius: '16px',
  boxShadow: `0 1px 0 ${T.line}`,
} as const

function shortDate(iso: string): string {
  const jst = new Date(new Date(iso).getTime() + 9 * 3600 * 1000)
  return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}`
}

function historyLabel(h: PassHistoryRow): string {
  switch (h.reason) {
    case 'purchase':
      return h.amount_yen != null ? `ご来店（${h.amount_yen.toLocaleString('ja-JP')}円）` : 'ご来店'
    case 'next_booking_bonus':
      return '次回予約ボーナス'
    case 'redeem':
      return `${h.note ?? '特典'}交換`
    case 'migration':
      return '紙カードから移行'
    case 'adjust':
      return '調整'
    case 'expire':
      return '有効期限切れ'
  }
}

function exchangeNote(rewards: PassLinked['rewards']): string {
  const ps = rewards.map((r) => r.points_required).sort((a, b) => a - b)
  if (ps.length >= 2) {
    return `${ps[0]}Pで使うか、${ps[ps.length - 1]}Pまで貯めるかを選べます。`
  }
  return ''
}

export default function PassHistoryPage() {
  const user = usePassUser()
  const [data, setData] = useState<PassGet | null>(null)
  const [failed, setFailed] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)

  useEffect(() => {
    if (user.status !== 'ready') return
    let cancelled = false
    fetchPass(user.userId)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [user.status, user.userId])

  useRedirectIfUnlinked(data)

  let body
  if (user.status === 'outside') {
    body = <PassNotice text={PASS_OUTSIDE_MESSAGE} />
  } else if (failed) {
    body = <PassNotice text="会員証を読み込めませんでした。時間をおいてもう一度お試しください。" />
  } else if (!data) {
    body = <PassNotice text="読み込み中…" />
  } else if (!data.linked) {
    body = <PassNotice text="会員連携の画面へ移動します…" />
  } else {
    body = <Linked data={data} rulesOpen={rulesOpen} toggleRules={() => setRulesOpen((v) => !v)} />
  }

  return (
    <PassPage>
      <PassHeader title="ポイント履歴・特典" backHref="/liff/home" />
      {body}
    </PassPage>
  )
}

function Linked({
  data,
  rulesOpen,
  toggleRules,
}: {
  data: PassLinked
  rulesOpen: boolean
  toggleRules: () => void
}) {
  const rewards = [...data.rewards].sort((a, b) => a.points_required - b.points_required)
  const redeemableP = new Set(data.redeemable.map((r) => r.points_required))
  const rules = data.rules
  const rewardsText = rewards.map((r) => `${r.points_required}P：${r.name}`).join('／')
  const exchange = exchangeNote(rewards)

  const ruleRows = [
    {
      k: '購入ポイント',
      v: `お会計${rules.yen_per_point.toLocaleString('ja-JP')}円ごとに1P（${rules.include_retail ? '施術・店販ともに対象' : '施術が対象'}）`,
    },
    {
      k: '次回予約ボーナス',
      v: `ご来店当日に次回のご予約をされると、次回ご来店時に+${rules.next_booking_bonus}P`,
    },
    { k: '特典', v: rewardsText },
    {
      k: '交換方法',
      v: `お会計時にスタッフにお伝えください${exchange ? `（${exchange.replace(/。$/, '')}）` : ''}`,
    },
    { k: '有効期限', v: `最終ご来店日から${rules.expiry_months}ヶ月` },
    { k: '紙カードからの移行', v: '紙のスタンプは1個＝1Pとしてすべて引き継ぎます' },
  ]

  return (
    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div
        style={{
          ...card,
          borderRadius: '18px',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '14px', color: T.sub }}>現在のポイント</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: serif, fontSize: '52px', lineHeight: 1 }}>{data.balance}</span>
          <span style={{ fontFamily: serif, fontSize: '20px' }}>P</span>
        </div>
        {data.expires_on && (
          <span style={{ fontSize: '15px', color: T.sub, lineHeight: 1.7 }}>
            有効期限 {data.expires_on.replace(/-/g, '/')}
            <br />
            （最終ご来店日から{rules.expiry_months}ヶ月）
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontFamily: serif, fontSize: '18px', fontWeight: 500 }}>特典</span>
        {rewards.map((r) => {
          const ok = redeemableP.has(r.points_required)
          return (
            <div
              key={r.points_required}
              style={{ ...card, padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: T.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: serif,
                  fontSize: '20px',
                  color: T.goldDeep,
                  flex: 'none',
                }}
              >
                {r.points_required}P
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.5 }}>{r.name}</span>
                <span style={{ fontSize: '15px', color: ok ? T.goldDeep : T.sub }}>
                  {ok ? '交換できます' : `あと${r.points_required - data.balance}Pで交換できます`}
                </span>
              </div>
            </div>
          )
        })}
        <span style={{ fontSize: '15px', lineHeight: 1.7, color: T.sub }}>
          交換はお会計時にスタッフへお伝えください。{exchange}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontFamily: serif, fontSize: '18px', fontWeight: 500 }}>履歴</span>
        <div style={{ ...card, padding: '0 16px' }}>
          {data.history.length === 0 && (
            <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center', fontSize: '16px', color: T.sub }}>
              まだ履歴はありません
            </div>
          )}
          {data.history.slice(0, 20).map((h, i) => (
            <div
              key={`${h.at}-${h.reason}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '60px',
                borderBottom: i < Math.min(data.history.length, 20) - 1 ? `1px solid ${T.lineSoft}` : 'none',
              }}
            >
              <span style={{ fontSize: '15px', color: T.sub, width: '44px', flex: 'none' }}>{shortDate(h.at)}</span>
              <span style={{ fontSize: '16px', flex: 1, lineHeight: 1.5 }}>{historyLabel(h)}</span>
              <span
                style={{
                  fontFamily: serif,
                  fontSize: '19px',
                  color: h.delta >= 0 ? T.goldDeep : T.sub,
                  whiteSpace: 'nowrap',
                }}
              >
                {h.delta >= 0 ? `+${h.delta}P` : `−${Math.abs(h.delta)}P`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: '0 16px 8px' }}>
        <button
          type="button"
          onClick={toggleRules}
          aria-expanded={rulesOpen}
          style={{
            width: '100%',
            minHeight: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            color: T.text,
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: 700 }}>ポイントのルール</span>
          <span style={{ fontSize: '15px', color: T.sub }}>{rulesOpen ? '閉じる ︿' : '開く ﹀'}</span>
        </button>
        {rulesOpen &&
          ruleRows.map((ru) => (
            <div
              key={ru.k}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                padding: '10px 0',
                borderTop: `1px solid ${T.lineSoft}`,
              }}
            >
              <span style={{ fontSize: '14px', color: T.sub }}>{ru.k}</span>
              <span style={{ fontSize: '16px', lineHeight: 1.65 }}>{ru.v}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
