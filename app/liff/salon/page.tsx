'use client'

import LiffTabBar from '../_components/LiffTabBar'
import { useMycarte } from '../_lib/useMycarte'
import { longDateTime } from '../_lib/format'

export default function SalonPage() {
  const { data: carte } = useMycarte()

  // salons テーブルに営業時間・定休日のカラムが無く、顧客向けに salons を返す
  // Edge Function も未実装のため、ここでは get-mycarte が返す予約情報だけを出す。
  const salonRows = [
    carte?.next_reservation
      ? { label: '次回のご予約', value: longDateTime(carte.next_reservation.datetime) }
      : null,
    carte?.next_reservation?.menu ? { label: 'メニュー', value: carte.next_reservation.menu } : null,
    carte?.last_visit
      ? { label: '前回のご来店', value: longDateTime(carte.last_visit.datetime) }
      : null,
  ].filter(Boolean) as { label: string; value: string }[]

  // お知らせ専用テーブルが無いため、未回答の施術後アンケートのみを出す。
  const newsItems: { title: string; subtitle: string }[] = carte?.followup_pending
    ? [{ title: '施術後の感想を教えてください', subtitle: 'アンケートへ' }]
    : []
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3EEE5' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: '#E5DDCF', padding: '12px 18px 14px' }}>
        <h1 className="font-serif text-[17px] font-medium" style={{ color: '#2E2A24' }}>
          サロン
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-[14px]" style={{ padding: '16px 18px 20px' }}>
        {/* Next Appointment Card */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[13px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <div className="flex justify-between items-baseline">
            <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
              次回のご予約
            </h2>
            <span className="text-[10.5px] font-bold" style={{ color: '#8A7A5F' }}>
              変更する
            </span>
          </div>
          <div className="flex gap-[12px] items-center">
            <div
              className="w-14 h-14 rounded-[14px] flex flex-col items-center justify-center flex-none"
              style={{ backgroundColor: '#EFE8DA' }}
            >
              <span className="text-[9.5px]" style={{ color: '#8A7A5F' }}>
                6月
              </span>
              <span className="font-serif text-[19px] leading-none" style={{ color: '#8A7A5F' }}>
                15
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-[3px]">
              <span className="text-[12.5px] font-bold" style={{ color: '#2E2A24' }}>
                14:00～ ／ 山田さん
              </span>
              <span className="text-[10.5px]" style={{ color: '#7A7266' }}>
                カラー＋トリートメント（予定・約2時間）
              </span>
            </div>
          </div>
          <div
            className="rounded-[12px] p-[11px_12px] flex justify-between items-center"
            style={{ backgroundColor: '#F7F3EA' }}
          >
            <span className="text-[11px]" style={{ color: '#5F584E' }}>
              事前カルテ 送信済み ／ 返信待ち
            </span>
            <span className="text-[10.5px] font-bold" style={{ color: '#8A7A5F' }}>
              内容を見る
            </span>
          </div>
        </div>

        {/* Salon Info Card */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[13px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
            ヘアサロン SALONRINK 鶴見
          </h2>
          <div
            className="h-[120px] rounded-[14px]"
            style={{ backgroundColor: '#EFE8DA' }}
          />
          <div className="flex flex-col gap-[7px] text-[11.5px]">
            {salonRows.map((item) => (
              <div
                key={item.label}
                className="flex justify-between rounded-[11px] p-[10px_12px]"
                style={{ backgroundColor: '#F7F3EA' }}
              >
                <span style={{ color: '#7A7266' }}>{item.label}</span>
                <span style={{ color: '#2E2A24' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-[8px]">
            <button
              className="flex-1 text-center border rounded-full py-[11px] text-[12px]"
              style={{ borderColor: '#E5DDCF', color: '#2E2A24' }}
            >
              地図で見る
            </button>
            <button
              className="flex-1 text-center border rounded-full py-[11px] text-[12px]"
              style={{ borderColor: '#E5DDCF', color: '#2E2A24' }}
            >
              電話する
            </button>
          </div>
        </div>

        {/* News Card */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[13px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <div className="flex justify-between items-baseline">
            <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
              お知らせ
            </h2>
            <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
              {newsItems.length}件
            </span>
          </div>
          {newsItems.map((news, idx) => (
            <div key={idx} className="flex gap-[11px] items-center">
              <div
                className="w-[50px] h-[50px] rounded-[12px] flex-none"
                style={{ backgroundColor: '#EFE8DA' }}
              />
              <div className="flex-1 flex flex-col gap-[3px]">
                <span className="text-[12px] font-bold" style={{ color: '#2E2A24' }}>
                  {news.title}
                </span>
                <span className="text-[10.5px]" style={{ color: '#7A7266' }}>
                  {news.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Home Care Card */}
        <div
          className="bg-white rounded-[18px] overflow-hidden flex flex-col gap-[12px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <div className="flex justify-between items-baseline" style={{ padding: '0 17px' }}>
            <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
              ホームケア
            </h2>
            <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
              すべて見る
            </span>
          </div>
          <div
            className="mx-[17px] rounded-[12px] p-[11px_12px] flex justify-between items-center"
            style={{ backgroundColor: '#F7F3EA' }}
          >
            <span className="text-[11px]" style={{ color: '#5F584E' }}>
              補修シャンプーが残り少なめです
            </span>
            <span className="text-[10.5px] font-bold flex-none" style={{ color: '#8A7A5F' }}>
              再購入
            </span>
          </div>
          <div className="grid grid-cols-2 gap-0.5">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="aspect-square"
                style={{ backgroundColor: idx === 1 ? '#EFE8DA' : '#E7DCC4' }}
              />
            ))}
          </div>
          <div style={{ padding: '0 17px 17px' }}>
            <button
              className="w-full text-center border rounded-full py-[11px] text-[12px]"
              style={{ borderColor: '#E5DDCF', color: '#2E2A24' }}
            >
              おすすめの製品を見る
            </button>
          </div>
        </div>

        {/* Chat Card */}
        <div
          className="rounded-[18px] p-[17px] flex flex-col gap-[11px]"
          style={{ backgroundColor: '#EDE5D6' }}
        >
          <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
            担当美容師とのやりとり
          </h2>
          <div
            className="flex gap-[10px] items-flex-start rounded-[12px] p-[12px]"
            style={{ backgroundColor: '#fff' }}
          >
            <div
              className="w-[26px] h-[26px] rounded-full flex-none"
              style={{ backgroundColor: '#E7DCC4' }}
            />
            <div className="flex-1 flex flex-col gap-[3px]">
              <span className="text-[10.5px] font-bold" style={{ color: '#8A7A5F' }}>
                山田さん
              </span>
              <span className="text-[11px] leading-[1.75]" style={{ color: '#5F584E' }}>
                カルテを拝見しました。ご希望の色味なら8レベルからのご提案が安心です。当日ご相談させてください。
              </span>
            </div>
          </div>
          <button
            className="text-center rounded-full py-[12px] text-[12.5px] font-bold text-white"
            style={{ backgroundColor: '#06C755' }}
          >
            LINEで返信する
          </button>
        </div>
      </div>

      <LiffTabBar active="salon" />
    </div>
  )
}
