'use client'

import { useEffect, useState } from 'react'
import PassNavLink from './PassNavLink'
import {
  expiryLabel,
  fetchPass,
  isExpiringSoon,
  passDateLabel,
  shortRewardName,
  PASS_SALON_NAME,
  type PassGet,
  type PassLinked,
} from '../_lib/passApi'

export const PASS_TOKENS = {
  bg: '#F3EEE5',
  card: '#FFFFFF',
  surface: '#F7F3EA',
  line: '#E5DDCF',
  lineSoft: '#EFE8DA',
  text: '#2E2A24',
  sub: '#5F584E',
  weak: '#7A7266',
  gold: '#A98D4B',
  goldDeep: '#8A6B2E',
  goldFrame: '#C9B27C',
  goldPale: '#E7DCC4',
  button: '#1B1815',
  noticeBg: '#FBF1ED',
  noticeLine: '#D9B3A6',
  noticeText: '#8E5744',
}

const T = PASS_TOKENS
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
} as const

/**
 * 連携済みなら会員証を出す。未連携は URL に ?t= / ?salon= があるときだけ連携ボタンを出し、
 * それ以外（一般ユーザー・PASS未導入・LINE外・取得失敗）は何も出さない。
 */
export default function PassCard({ lineUserId }: { lineUserId: string | null | undefined }) {
  const [data, setData] = useState<PassGet | null>(null)
  const [linkHref, setLinkHref] = useState<string | null>(null)

  useEffect(() => {
    if (!lineUserId) return
    let cancelled = false
    fetchPass(lineUserId)
      .then((d) => {
        if (cancelled) return
        if (!d.linked) {
          const q = new URLSearchParams(window.location.search)
          const token = q.get('t')
          if (!token && !q.get('salon')) return
          setLinkHref(token ? `/liff/pass/link?t=${encodeURIComponent(token)}` : '/liff/pass/link')
        }
        setData(d)
      })
      .catch((e) => {
        console.warn('[PassCard]', e instanceof Error ? e.message : e)
      })
    return () => {
      cancelled = true
    }
  }, [lineUserId])

  if (!data) return null
  return <PassCardView data={data} linkHref={linkHref ?? '/liff/pass/link'} />
}

export function PassCardView({ data, linkHref }: { data: PassGet; linkHref: string }) {
  return (
    <div
      style={{
        background: T.card,
        borderRadius: '18px',
        boxShadow: `0 1px 0 ${T.line}`,
        padding: '20px 18px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: T.text,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontFamily: serif,
            fontSize: '17px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {PASS_SALON_NAME} 会員証
        </span>
        {/* TODO(design): 会員番号（mono 12px）は pass-liff が返さないため未表示 */}
      </div>

      {data.linked ? <LinkedBody data={data} /> : <UnlinkedBody href={linkHref} />}
    </div>
  )
}

function UnlinkedBody({ href }: { href: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: T.surface,
        borderRadius: '14px',
        padding: '18px 16px',
      }}
    >
      <span style={{ fontSize: '16px', lineHeight: 1.75 }}>
        お店の会員情報と連携すると、ポイントと前回のカラーがここに表示されます。
      </span>
      <PassNavLink href={href} style={primaryButton}>
        お店の会員情報と連携する
      </PassNavLink>
      <span style={{ fontSize: '14px', color: T.sub, lineHeight: 1.7 }}>
        紙のポイントカードのスタンプも引き継げます
      </span>
    </div>
  )
}

function LinkedBody({ data }: { data: PassLinked }) {
  const rewards = [...data.rewards].sort((a, b) => a.points_required - b.points_required)
  const maxP = rewards.length ? rewards[rewards.length - 1].points_required : 50
  const pct = Math.min(100, (data.balance / maxP) * 100)
  const redeemable = [...data.redeemable].sort((a, b) => b.points_required - a.points_required)
  const topRedeem = redeemable[0] ?? null
  const bonusP = data.rules?.next_booking_bonus ?? 2

  let rewardSub = ''
  if (topRedeem) {
    if (data.next_reward) {
      rewardSub = `${data.next_reward.points_required}Pまで貯めて、${data.next_reward.name}と交換することもできます`
    } else {
      const others = redeemable.slice(1).map((r) => `${r.name}（${r.points_required}P）`)
      rewardSub = others.length
        ? `${others.join('、')}との交換もできます。お会計時にスタッフへお伝えください`
        : 'お会計時にスタッフへお伝えください'
    }
  }

  const bookedLabel = data.next_reservation_at
    ? passDateLabel(data.next_reservation_at).replace(/（.）$/, '') + ' '
    : ''

  const columns = rewards.map(
    (r, i) => `${r.points_required - (i > 0 ? rewards[i - 1].points_required : 0)}fr`,
  )

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '14px', color: T.sub, marginRight: '6px' }}>現在のポイント</span>
          <span style={{ fontFamily: serif, fontSize: '52px', fontWeight: 500, lineHeight: 1 }}>{data.balance}</span>
          <span style={{ fontFamily: serif, fontSize: '20px' }}>P</span>
        </div>

        <div style={{ position: 'relative', height: '10px', borderRadius: '99px', background: T.lineSoft }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              borderRadius: '99px',
              background: T.gold,
              width: `${pct}%`,
            }}
          />
          {rewards.slice(0, -1).map((r) => (
            <div
              key={r.points_required}
              style={{
                position: 'absolute',
                left: `${(r.points_required / maxP) * 100}%`,
                top: '-3px',
                bottom: '-3px',
                width: '2px',
                background: '#FFFFFF',
                borderRadius: '1px',
              }}
            />
          ))}
        </div>

        {rewards.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: columns.join(' '),
              fontSize: '13px',
              lineHeight: 1.45,
              color: T.sub,
              marginTop: '-4px',
            }}
          >
            {rewards.map((r, i) => (
              <div
                key={r.points_required}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  paddingRight: i < rewards.length - 1 ? '6px' : 0,
                  borderRight: i < rewards.length - 1 ? `1px solid ${T.line}` : 'none',
                }}
              >
                <b style={{ fontSize: '14px', color: T.text }}>{r.points_required}P</b>
                <span>{shortRewardName(r.name)}</span>
              </div>
            ))}
          </div>
        )}

        {!topRedeem && data.next_reward && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              columnGap: '6px',
              fontSize: '16px',
              lineHeight: 1.6,
            }}
          >
            <span>{data.next_reward.name}まで</span>
            <b style={{ fontSize: '20px', color: T.goldDeep, whiteSpace: 'nowrap' }}>
              あと{data.next_reward.remaining}P
            </b>
          </div>
        )}

        {topRedeem && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              background: T.surface,
              border: `1.5px solid ${T.goldFrame}`,
              borderRadius: '14px',
              padding: '14px 16px',
            }}
          >
            <span style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.6 }}>
              {topRedeem.name}と交換できます
            </span>
            <span style={{ fontSize: '15px', color: T.sub, lineHeight: 1.6 }}>{rewardSub}</span>
          </div>
        )}
      </div>

      {data.has_pending_bonus ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: T.text,
            color: '#fff',
            borderRadius: '14px',
            padding: '14px 16px',
          }}
        >
          <span style={{ fontFamily: serif, fontSize: '22px', color: T.goldPale, flex: 'none' }}>+{bonusP}P</span>
          <span style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.6 }}>
            {bookedLabel}ご予約済み：ご来店時に+{bonusP}P
          </span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: T.surface,
            borderRadius: '14px',
            padding: '12px 16px',
          }}
        >
          <span style={{ fontFamily: serif, fontSize: '20px', color: T.goldDeep, flex: 'none' }}>+{bonusP}P</span>
          <span style={{ fontSize: '16px', lineHeight: 1.6 }}>
            ご来店当日に次回のご予約で<span style={{ whiteSpace: 'nowrap' }}>ポイント加算</span>
          </span>
        </div>
      )}

      {isExpiringSoon(data.expires_on) && data.expires_on && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: T.noticeBg,
            border: `1px solid ${T.noticeLine}`,
            borderRadius: '12px',
            padding: '10px 14px',
          }}
        >
          <span style={{ fontSize: '15px', color: T.noticeText, lineHeight: 1.6 }}>
            有効期限 {expiryLabel(data.expires_on)}
          </span>
        </div>
      )}

      {data.last_visit ? (
        <div
          style={{
            borderTop: `1px solid ${T.line}`,
            paddingTop: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '14px', color: T.sub }}>前回のご来店</span>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {/* TODO(design): 仕上がり写真は pass-liff が返さないためダミー地のまま */}
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '12px',
                background: 'linear-gradient(160deg,#6B5040,#3E2E25)',
                flex: 'none',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{passDateLabel(data.last_visit.date)}</span>
              {data.last_visit.menu && <span style={{ fontSize: '16px' }}>{data.last_visit.menu}</span>}
              {data.last_visit.color_label && (
                <span style={{ fontSize: '15px', color: T.sub }}>カラー：{data.last_visit.color_label}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            borderTop: `1px solid ${T.line}`,
            paddingTop: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span style={{ fontFamily: serif, fontSize: '18px', fontWeight: 500 }}>初回ご来店ありがとうございます</span>
          <span style={{ fontSize: '15px', color: T.sub, lineHeight: 1.7 }}>
            次回から、前回のカラーと仕上がり写真がここに表示されます。
          </span>
        </div>
      )}

      <PassNavLink href="/liff/pass/memo" style={primaryButton}>
        今回のご希望を伝える
      </PassNavLink>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '-4px' }}>
        <PassNavLink href="/liff/pass" style={linkRow(!!data.last_visit)}>
          <span>ポイント履歴・特典を見る</span>
          <span style={{ color: T.gold, fontSize: '18px' }}>›</span>
        </PassNavLink>
        {data.last_visit && (
          <PassNavLink href="/liff/karte" style={linkRow(false)}>
            <span>過去の写真を見る</span>
            <span style={{ color: T.gold, fontSize: '18px' }}>›</span>
          </PassNavLink>
        )}
      </div>
    </>
  )
}

function linkRow(withBorder: boolean) {
  return {
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '16px',
    borderBottom: withBorder ? `1px solid ${T.lineSoft}` : 'none',
  } as const
}
