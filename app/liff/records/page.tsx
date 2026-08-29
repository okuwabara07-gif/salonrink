'use client'

import { useMemo, useState } from 'react'
import LiffTabBar from '../_components/LiffTabBar'
import { useMycarte } from '../_lib/useMycarte'
import {
  daysBetween,
  expiryLabel,
  isToday,
  photoKindLabel,
  recordDate,
  recordKindLabel,
  shortDate,
} from '../_lib/format'
import { SR_FUNCTIONS_BASE } from '../_lib/mycarteTypes'
import type { MycartePhoto, MycarteRecord } from '../_lib/mycarteTypes'

type TabKey = 'highlight' | 'grid' | 'visit'

const PLACEHOLDER_BG = '#EFE8DA'

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('highlight')
  const { status, data, profile, message, reload } = useMycarte()
  const [replyText, setReplyText] = useState('')
  const [replyName, setReplyName] = useState('')
  const [replySaving, setReplySaving] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  /**
   * 美容師の返信を貼り付けて記録する。
   * 美容師個人のLINEは Messaging API で取得できないため、
   * save-record の stylist_reply_create がこのループを閉じる唯一の経路。
   */
  const handleReplySave = async () => {
    if (!profile?.userId) {
      setReplyError('LINEから開くと保存できます。')
      return
    }
    const comment = replyText.trim()
    if (!comment) {
      setReplyError('返信の内容を貼り付けてください。')
      return
    }
    setReplySaving(true)
    setReplyError(null)
    try {
      const res = await fetch(`${SR_FUNCTIONS_BASE}/save-record`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          line_user_id: profile.userId,
          action: 'stylist_reply_create',
          comment,
          stylist_name: replyName.trim() || undefined,
        }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok || !j?.ok) throw new Error(j?.error ?? `save-record ${res.status}`)
      setReplyText('')
      setReplyName('')
      reload()
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : '保存できませんでした。')
    } finally {
      setReplySaving(false)
    }
  }

  const photos = useMemo(() => data?.photos ?? [], [data])
  const records = useMemo(() => data?.records ?? [], [data])
  const counts = data?.counts ?? { records: 0, visits: 0, products: 0, inspirations: 0 }

  const carousel = useMemo(() => photos.slice(0, 4), [photos])
  const gridPhotos = useMemo(() => photos.slice(0, 6), [photos])

  const feed = useMemo(() => {
    if (activeTab === 'visit') return records.filter((r) => r.kind === 'visit')
    return records
  }, [records, activeTab])

  const loading = status === 'loading'

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3EEE5' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: '#E5DDCF', padding: '12px 18px 14px' }}>
        <h1 className="font-serif text-[17px] font-medium" style={{ color: '#2E2A24' }}>
          きろく
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-[14px]" style={{ padding: '16px 18px 20px' }}>
        {/* Summary Card */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex gap-[14px] items-center"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <div
            className="w-[58px] h-[58px] rounded-full flex-none overflow-hidden"
            style={{
              backgroundColor: PLACEHOLDER_BG,
              boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px #A98D4B',
            }}
          >
            {profile?.pictureUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.pictureUrl} alt="" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex-1 flex gap-[20px]">
            {[
              { value: counts.records, label: '記録' },
              { value: counts.visits, label: '来店' },
              { value: counts.products, label: '製品' },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center">
                <span className="font-serif text-[20px]" style={{ color: '#2E2A24' }}>
                  {loading ? '–' : m.value}
                </span>
                <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          <span
            className="text-[9.5px] rounded-full px-[10px] py-[5px] font-bold flex-none whitespace-nowrap"
            style={{ backgroundColor: '#EFE8DA', color: '#8A7A5F' }}
          >
            非公開
          </span>
        </div>

        {/* Highlight Carousel */}
        <div className="flex gap-[9px] overflow-x-auto pb-2">
          {carousel.map((p, idx) => (
            <div key={p.id} className="flex flex-col items-center gap-[5px] flex-none">
              <div
                className="w-[56px] h-[56px] rounded-full overflow-hidden"
                style={{
                  backgroundColor: PLACEHOLDER_BG,
                  boxShadow: `0 0 0 2px #F3EEE5, 0 0 0 3.5px ${idx === 0 ? '#A98D4B' : '#DCCFBD'}`,
                }}
              >
                {p.signed_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.signed_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-[9.5px]" style={{ color: '#7A7266' }}>
                {isToday(p.created_at) ? '今日' : shortDate(p.created_at)}
              </span>
            </div>
          ))}

          {/* Add button */}
          <div className="flex flex-col items-center gap-[5px] flex-none">
            <div
              className="w-[56px] h-[56px] rounded-full border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: '#D8CCB8', color: '#B3A996' }}
            >
              <span className="text-[17px]">＋</span>
            </div>
            <span className="text-[9.5px]" style={{ color: '#7A7266' }}>
              追加
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="bg-white rounded-full p-1 flex" style={{ boxShadow: '0 1px 0 #E5DDCF' }}>
          {(['highlight', 'grid', 'visit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-[9px] text-[11.5px] font-bold rounded-full transition"
              style={{
                backgroundColor: activeTab === tab ? '#8A7A5F' : 'transparent',
                color: activeTab === tab ? '#fff' : '#A2988A',
              }}
            >
              {tab === 'highlight' && 'ハイライト'}
              {tab === 'grid' && 'グリッド'}
              {tab === 'visit' && '来店だけ'}
            </button>
          ))}
        </div>

        {/* Recent Records Card */}
        <div
          className="bg-white rounded-[18px] overflow-hidden flex flex-col gap-[12px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <div className="flex justify-between items-baseline" style={{ padding: '0 17px' }}>
            <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
              最近の記録
            </h2>
            <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
              {loading ? '読み込み中' : `すべて見る（${counts.records}件）`}
            </span>
          </div>

          {gridPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {gridPhotos.map((p: MycartePhoto) => {
                const expiry = expiryLabel(p.expires_at)
                return (
                  <div
                    key={p.id}
                    className="aspect-square relative overflow-hidden"
                    style={{ backgroundColor: PLACEHOLDER_BG }}
                  >
                    {p.signed_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.signed_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <span
                      className="absolute left-[5px] bottom-[5px] text-[8px] rounded-full px-[6px] py-[2px] font-bold"
                      style={{ backgroundColor: 'rgba(255,255,255,.88)', color: '#8A7A5F' }}
                    >
                      {isToday(p.created_at) ? '今日' : photoKindLabel(p.kind)}
                    </span>
                    {expiry && (
                      <span
                        className="absolute right-[5px] top-[5px] text-[8px] rounded-full px-[6px] py-[2px] font-bold"
                        style={{ backgroundColor: 'rgba(27,24,21,.72)', color: '#fff' }}
                      >
                        {expiry}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className="text-[11px] leading-[1.8] text-center"
              style={{ color: '#A2988A', padding: '4px 17px 0' }}
            >
              {loading ? '読み込んでいます…' : 'まだ写真の記録がありません。'}
            </div>
          )}

          <div className="flex gap-[8px]" style={{ padding: '0 17px 17px' }}>
            <button
              className="flex-1 text-center border rounded-full py-[11px] text-[12px]"
              style={{ borderColor: '#E5DDCF', color: '#2E2A24' }}
            >
              写真を記録する
            </button>
            <button
              className="flex-1 text-center border rounded-full py-[11px] text-[12px]"
              style={{ borderColor: '#E5DDCF', color: '#2E2A24' }}
            >
              製品を登録
            </button>
          </div>
        </div>

        {/* Feed Section */}
        {activeTab !== 'grid' && (
          <>
            <h3 className="font-serif text-[13px]" style={{ color: '#8A7A5F', paddingLeft: '2px' }}>
              フィード
            </h3>

            {feed.map((r, idx) => (
              <FeedCard key={r.id} record={r} prev={feed[idx + 1] ?? null} />
            ))}

            {data?.followup_last?.answer_label && (
              <div
                className="bg-white rounded-[18px] overflow-hidden"
                style={{ boxShadow: '0 1px 0 #E5DDCF' }}
              >
                <div className="flex gap-[10px] items-center p-[12px_14px]">
                  <div
                    className="w-[30px] h-[30px] rounded-full flex-none"
                    style={{ backgroundColor: PLACEHOLDER_BG }}
                  />
                  <div className="flex-1 flex flex-col">
                    <span className="text-[11.5px] font-bold" style={{ color: '#2E2A24' }}>
                      施術後1週間の感想
                    </span>
                    <span className="text-[9.5px]" style={{ color: '#A2988A' }}>
                      {shortDate(data.followup_last.visited_on ?? data.followup_last.answered_at)}
                    </span>
                  </div>
                  <span className="text-[13px]" style={{ color: '#B3A996' }}>
                    ···
                  </span>
                </div>
                <div className="flex gap-[6px] flex-wrap p-[0_14px_14px] text-[10.5px]">
                  <span
                    className="border rounded-full px-[11px] py-[5px] font-medium"
                    style={{
                      borderColor: '#D9B3A6',
                      backgroundColor: '#FBF1ED',
                      color: '#A8705C',
                    }}
                  >
                    {data.followup_last.answer_label}
                  </span>
                </div>
              </div>
            )}

            {!loading && feed.length === 0 && (
              <div
                className="bg-white rounded-[18px] text-[11.5px] leading-[1.8] text-center"
                style={{ boxShadow: '0 1px 0 #E5DDCF', color: '#A2988A', padding: '22px 18px' }}
              >
                {status === 'outside'
                  ? message
                  : activeTab === 'visit'
                    ? '来店の記録はまだありません。'
                    : 'まだ記録がありません。写真や製品を登録すると、ここに並びます。'}
              </div>
            )}
          </>
        )}

        {/* 美容師の返信を貼り付ける（「返る」ループ） */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[10px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
            美容師からの返信を残す
          </h2>
          <span className="text-[10.5px] leading-[1.7]" style={{ color: '#A2988A' }}>
            LINEで受け取った返信を貼り付けると、記録に残って次の来店の起点になります。
          </span>
          <input
            value={replyName}
            onChange={(e) => setReplyName(e.target.value)}
            placeholder="美容師名（任意）"
            className="rounded-[12px] border px-[12px] py-[10px] text-[11.5px]"
            style={{ borderColor: '#E5DDCF', color: '#2E2A24' }}
          />
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="返信の内容を貼り付け"
            rows={3}
            className="rounded-[12px] border px-[12px] py-[10px] text-[11.5px] leading-[1.7]"
            style={{ borderColor: '#E5DDCF', color: '#2E2A24' }}
          />
          {replyError && (
            <span className="text-[10.5px]" style={{ color: '#A8705C' }}>
              {replyError}
            </span>
          )}
          <button
            disabled={replySaving}
            onClick={() => void handleReplySave()}
            className="rounded-full py-[11px] text-[12px] font-bold text-white"
            style={{ backgroundColor: '#8A7A5F', opacity: replySaving ? 0.6 : 1 }}
          >
            {replySaving ? '保存中…' : '記録に残す'}
          </button>
        </div>

        {/* Footer Note */}
        <span className="text-[10.5px] leading-[1.7] text-center" style={{ color: '#A2988A' }}>
          記録は非公開です。来店前にまとめて美容師に共有できます。
        </span>
      </div>

      <LiffTabBar active="records" />
    </div>
  )
}

function FeedCard({ record, prev }: { record: MycarteRecord; prev: MycarteRecord | null }) {
  const gap = daysBetween(recordDate(record), prev ? recordDate(prev) : null)
  const meta = [shortDate(recordDate(record)), gap != null ? `前回から${gap}日` : null]
    .filter(Boolean)
    .join(' ・ ')

  return (
    <div
      className="bg-white rounded-[18px] overflow-hidden"
      style={{ boxShadow: '0 1px 0 #E5DDCF' }}
    >
      <div className="flex gap-[10px] items-center p-[12px_14px]">
        <div
          className="w-[30px] h-[30px] rounded-full flex-none"
          style={{ backgroundColor: PLACEHOLDER_BG }}
        />
        <div className="flex-1 flex flex-col">
          <span className="text-[11.5px] font-bold" style={{ color: '#2E2A24' }}>
            {recordKindLabel(record.kind)}
          </span>
          <span className="text-[9.5px]" style={{ color: '#A2988A' }}>
            {meta}
          </span>
        </div>
        <span className="text-[13px]" style={{ color: '#B3A996' }}>
          ···
        </span>
      </div>

      {record.signed_url && (
        <div className="aspect-square relative" style={{ backgroundColor: PLACEHOLDER_BG }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={record.signed_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-[12px_14px] flex flex-col gap-[8px]">
        {record.tags && record.tags.length > 0 && (
          <div className="flex gap-[6px] flex-wrap text-[9.5px]">
            {record.tags.map((t) => (
              <span
                key={t}
                className="rounded-full px-[9px] py-[4px] font-bold"
                style={{ backgroundColor: '#EFE8DA', color: '#8A7A5F' }}
              >
                {t.startsWith('#') ? t : `#${t}`}
              </span>
            ))}
          </div>
        )}

        {record.body && (
          <span className="text-[11.5px] leading-[1.75]" style={{ color: '#5F584E' }}>
            {record.body}
          </span>
        )}

        {record.stylist_comment && (
          <div
            className="flex gap-[10px] items-start p-[11px_12px] rounded-[12px]"
            style={{ backgroundColor: '#F7F3EA' }}
          >
            <div
              className="w-[24px] h-[24px] rounded-full flex-none"
              style={{ backgroundColor: '#E7DCC4' }}
            />
            <div className="flex-1 flex flex-col gap-[3px]">
              <span className="text-[10.5px] font-bold" style={{ color: '#8A7A5F' }}>
                {record.stylist_name ? `${record.stylist_name}（担当美容師）` : '担当美容師'}
              </span>
              <span className="text-[11px] leading-[1.75]" style={{ color: '#5F584E' }}>
                {record.stylist_comment}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
