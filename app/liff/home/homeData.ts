'use client'

import { useState } from 'react'
import liff from '@line/liff'
import { useMycarte } from '../_lib/useMycarte'
import {
  clockTime,
  daysBetween,
  expiryLabel,
  isToday,
  photoKindLabel,
  shortDate,
} from '../_lib/format'
import { SR_FUNCTIONS_BASE } from '../_lib/mycarteTypes'
import type { MycarteScorePoint } from '../_lib/mycarteTypes'

export interface TileData {
  label: string
  color: string
  badge: boolean
  expiring: string | null
  imageUrl: string | null
}

export interface DiagnosticItem {
  title: string
  date: string
  isUnread: boolean
}

/** 棒グラフ・タイルに使う色。page.tsx の TOKENS から渡す。 */
export type HomePalette = {
  placeholder: string
  gold: string
  goldLight: string
  goldLighter: string
}

/** score_series から最新値と前回差分を取り出す */
function seriesTail(points: MycarteScorePoint[] | undefined) {
  if (!points || points.length === 0) {
    return { latest: null as number | null, change: null as number | null }
  }
  const latest = points[points.length - 1].score
  const prev = points.length > 1 ? points[points.length - 2].score : null
  return { latest, change: prev == null ? null : latest - prev }
}

export function useHomeData(palette: HomePalette) {
  const { data: carte, profile } = useMycarte()

  const counts = carte?.counts ?? { records: 0, visits: 0, products: 0, inspirations: 0 }
  const storage = carte?.storage ?? null
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const series = carte?.score_series ?? {}

  const hair = seriesTail(series.hair)
  const scalp = seriesTail(series.scalp)
  const gray = seriesTail(series.gray)

  /** 診断種別ごとの最終保存日。diagnoses は saved_at 降順で返る。 */
  const lastDiagDate = (type: string): string => {
    const hit = (carte?.diagnoses ?? []).find((d) => d.diagnosis_type === type)
    return hit ? shortDate(hit.saved_at ?? hit.created_at) : ''
  }

  // カルテ完成度＝5項目（診断・写真・記録・製品・次回予約）の充足率
  const filled = [
    (carte?.diagnoses.length ?? 0) > 0,
    (carte?.photos.length ?? 0) > 0,
    counts.records > 0,
    counts.products > 0,
    !!carte?.next_reservation,
  ].filter(Boolean).length

  const nextAt = carte?.next_reservation?.datetime ?? null
  const lastVisitDaysAgo = daysBetween(carte?.last_visit?.datetime, new Date().toISOString())

  const data = {
    userName: profile?.displayName ?? '',
    karteCompletionPercent: Math.round((filled / 5) * 100),
    karteScore: hair.latest,
    karteScoreChange: hair.change,
    scalpScore: scalp.latest,
    grayScore: gray.latest,
    recordsCount: counts.records,
    photosStored: storage?.used ?? 0,
    photosLimit: storage?.limit ?? 0,
    storagePlanDays: storage?.retention_days ?? null,
  }

  const greeting = data.userName ? `${data.userName}さんの髪のいま` : '髪のいま'

  const visitSummary = [
    lastVisitDaysAgo != null ? `前回の施術から ${lastVisitDaysAgo}日` : null,
    nextAt ? `${shortDate(nextAt)} ${clockTime(nextAt)} にご来店予定` : '次回のご予約は未定です',
  ]
    .filter(Boolean)
    .join(' ／ ')

  const scoreChangeLabel =
    data.karteScoreChange == null
      ? '髪質'
      : `髪質 ／ 前回 ${data.karteScoreChange >= 0 ? '+' : ''}${data.karteScoreChange}`

  const storagePercent =
    data.photosLimit > 0 ? Math.min(100, (data.photosStored / data.photosLimit) * 100) : 0

  // storage が無い＝未取得／LINE外。これを「無制限」と混同しないこと。
  // 無料は retention_days=90、プレミアムのみ retention_unlimited=true。
  const storagePlanLabel = !storage
    ? '—'
    : storage.retention_unlimited
      ? 'プレミアム（保存期限なし）'
      : `無料プラン（${storage.retention_days ?? 90}日保存）`

  /**
   * プレミアム購入。miniapp.html の openCheckout と同一経路。
   * create-checkout が返す Stripe URL を liff.openWindow で外部起動する。
   */
  const openCheckout = async (kind: 'premium_month' | 'premium_year' = 'premium_month') => {
    if (!profile?.userId) {
      setCheckoutError('LINEから開くと手続きできます。')
      return
    }
    if (checkoutBusy) return
    setCheckoutBusy(true)
    setCheckoutError(null)
    try {
      const r = await fetch(`${SR_FUNCTIONS_BASE}/create-checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ line_user_id: profile.userId, kind }),
      })
      const j = await r.json().catch(() => null)
      if (!r.ok || !j?.url) throw new Error(j?.message ?? 'ただいま手続きを開始できませんでした')
      if (liff.isApiAvailable('openWindow')) liff.openWindow({ url: j.url, external: true })
      else window.location.href = j.url
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'ただいま手続きを開始できませんでした')
    } finally {
      setCheckoutBusy(false)
    }
  }

  const tiles: TileData[] = (carte?.photos ?? []).slice(0, 3).map((p) => ({
    label: isToday(p.created_at) ? '今日' : photoKindLabel(p.kind),
    color: palette.placeholder,
    badge: true,
    expiring: expiryLabel(p.expires_at),
    imageUrl: p.signed_url,
  }))

  const diagnostics: DiagnosticItem[] = [
    { title: '髪質診断', date: lastDiagDate('hair'), isUnread: false },
    { title: '頭皮診断', date: lastDiagDate('scalp'), isUnread: false },
    { title: '白髪診断', date: lastDiagDate('gray'), isUnread: false },
    // 占いは get-mycarte に未読状態が無いため、導線のみ残す
    { title: '今日の髪占い', date: '', isUnread: false },
  ]

  // 直近4回分のスコア推移。系列が無ければ棒グラフは描かれない。
  const primarySeries = series.hair ?? series.gray ?? series.scalp ?? []
  const barChartData = primarySeries.slice(-4).map((pt, idx, arr) => ({
    month: `${new Date(pt.at).getMonth() + 1}月`,
    percent: pt.score,
    color:
      idx === arr.length - 1
        ? palette.gold
        : idx === arr.length - 2
          ? palette.goldLight
          : palette.goldLighter,
  }))

  // 「お知らせ」専用テーブルは無いため、施術後アンケートの未回答と
  // 残量が少ないケア用品から導出する。該当が無ければ0件で描画される。
  const newsItems: { title: string; date: string; from: string }[] = []
  if (carte?.followup_pending) {
    newsItems.push({
      title: '施術後の感想を教えてください',
      date: shortDate(carte.followup_pending.visited_on),
      from: 'アンケートへ',
    })
  }
  for (const s of carte?.shelf ?? []) {
    if (s.remaining === 'low' || s.remaining === '少なめ') {
      newsItems.push({
        title: `${s.name ?? 'ケア用品'}が残り少なめです`,
        date: s.purchased_on ? `前回購入 ${shortDate(s.purchased_on)}` : '',
        from: '再購入へ',
      })
    }
  }

  return {
    data,
    greeting,
    visitSummary,
    scoreChangeLabel,
    storagePercent,
    storagePlanLabel,
    tiles,
    diagnostics,
    barChartData,
    newsItems,
    openCheckout,
    checkoutBusy,
    checkoutError,
  }
}
