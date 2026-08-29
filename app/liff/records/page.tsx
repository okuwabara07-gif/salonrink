'use client'

import { useState } from 'react'

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<'highlight' | 'grid' | 'visit'>('highlight')

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
          {/* Avatar */}
          <div
            className="w-[58px] h-[58px] rounded-full flex-none"
            style={{
              backgroundColor: '#EFE8DA',
              boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px #A98D4B',
            }}
          />

          {/* Metrics */}
          <div className="flex-1 flex gap-[20px]">
            <div className="flex flex-col items-center">
              <span className="font-serif text-[20px]" style={{ color: '#2E2A24' }}>
                36
              </span>
              <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
                記録
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-[20px]" style={{ color: '#2E2A24' }}>
                6
              </span>
              <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
                来店
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif text-[20px]" style={{ color: '#2E2A24' }}>
                4
              </span>
              <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
                製品
              </span>
            </div>
          </div>

          {/* Private Badge */}
          <span
            className="text-[9.5px] rounded-full px-[10px] py-[5px] font-bold flex-none whitespace-nowrap"
            style={{ backgroundColor: '#EFE8DA', color: '#8A7A5F' }}
          >
            非公開
          </span>
        </div>

        {/* Highlight Carousel */}
        <div className="flex gap-[9px] overflow-x-auto pb-2">
          {/* Today's highlight */}
          <div className="flex flex-col items-center gap-[5px] flex-none">
            <div
              className="w-[56px] h-[56px] rounded-full"
              style={{
                backgroundColor: '#EFE8DA',
                boxShadow: '0 0 0 2px #F3EEE5, 0 0 0 3.5px #A98D4B',
              }}
            />
            <span className="text-[9.5px]" style={{ color: '#7A7266' }}>
              今日
            </span>
          </div>

          {/* Past highlights */}
          {[
            { date: '7/2', color: '#E7DCC4', ring: '#DCCFBD' },
            { date: '6/10', color: '#E7DCC4', ring: '#DCCFBD' },
            { date: '5/10', color: '#EFE8DA', ring: '#DCCFBD' },
          ].map((item) => (
            <div key={item.date} className="flex flex-col items-center gap-[5px] flex-none">
              <div
                className="w-[56px] h-[56px] rounded-full"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 0 2px #F3EEE5, 0 0 0 3.5px ${item.ring}`,
                }}
              />
              <span className="text-[9.5px]" style={{ color: '#7A7266' }}>
                {item.date}
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
              すべて見る（36件）
            </span>
          </div>

          {/* Grid of records */}
          <div className="grid grid-cols-3 gap-0.5">
            {[
              { label: '今日', bg: '#EFE8DA', hasExpiry: true },
              { label: '製品', bg: '#E7DCC4', hasExpiry: false },
              { label: '来店', bg: '#EFE8DA', hasExpiry: true },
            ].map((item, idx) => (
              <div
                key={idx}
                className="aspect-square relative"
                style={{ backgroundColor: item.bg }}
              >
                <span
                  className="absolute left-[5px] bottom-[5px] text-[8px] rounded-full px-[6px] py-[2px] font-bold"
                  style={{
                    backgroundColor: 'rgba(255,255,255,.88)',
                    color: '#8A7A5F',
                  }}
                >
                  {item.label}
                </span>
                {item.hasExpiry && (
                  <span
                    className="absolute right-[5px] top-[5px] text-[8px] rounded-full px-[6px] py-[2px] font-bold"
                    style={{
                      backgroundColor: 'rgba(27,24,21,.72)',
                      color: '#fff',
                    }}
                  >
                    あと7日
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
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
        <h3 className="font-serif text-[13px]" style={{ color: '#8A7A5F', paddingLeft: '2px' }}>
          フィード
        </h3>

        {/* Feed Item 1 */}
        <div
          className="bg-white rounded-[18px] overflow-hidden"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <div className="flex gap-[10px] items-center p-[12px_14px]">
            <div
              className="w-[30px] h-[30px] rounded-full flex-none"
              style={{ backgroundColor: '#EFE8DA' }}
            />
            <div className="flex-1 flex flex-col">
              <span className="text-[11.5px] font-bold" style={{ color: '#2E2A24' }}>
                わたしの髪
              </span>
              <span className="text-[9.5px]" style={{ color: '#A2988A' }}>
                7/2 ・ 前回から106日
              </span>
            </div>
            <span className="text-[13px]" style={{ color: '#B3A996' }}>
              ···
            </span>
          </div>
          <div className="aspect-square" style={{ backgroundColor: '#EFE8DA' }} />
          <div className="p-[12px_14px] flex flex-col gap-[8px]">
            <div className="flex gap-[6px] flex-wrap text-[9.5px]">
              <span
                className="rounded-full px-[9px] py-[4px] font-bold"
                style={{ backgroundColor: '#EFE8DA', color: '#8A7A5F' }}
              >
                #根元2cm
              </span>
              <span
                className="rounded-full px-[9px] py-[4px] font-bold"
                style={{ backgroundColor: '#EFE8DA', color: '#8A7A5F' }}
              >
                #黄みが出てきた
              </span>
            </div>
            <span
              className="text-[11.5px] leading-[1.75]"
              style={{ color: '#5F584E' }}
            >
              毛先のパサつきが気になる。次はトリートメントも一緒に相談したい。
            </span>
            <div className="flex gap-[10px] items-start p-[11px_12px] rounded-[12px]" style={{ backgroundColor: '#F7F3EA' }}>
              <div
                className="w-[24px] h-[24px] rounded-full flex-none"
                style={{ backgroundColor: '#E7DCC4' }}
              />
              <div className="flex-1 flex flex-col gap-[3px]">
                <span className="text-[10.5px] font-bold" style={{ color: '#8A7A5F' }}>
                  山田さん（担当美容師）
                </span>
                <span
                  className="text-[11px] leading-[1.75]"
                  style={{ color: '#5F584E' }}
                >
                  紫シャンプーを週1で。来店時に毛先だけ整えましょう。
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Item 2 */}
        <div
          className="bg-white rounded-[18px] overflow-hidden"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <div className="flex gap-[10px] items-center p-[12px_14px]">
            <div
              className="w-[30px] h-[30px] rounded-full flex-none"
              style={{ backgroundColor: '#E7DCC4' }}
            />
            <div className="flex-1 flex flex-col">
              <span className="text-[11.5px] font-bold" style={{ color: '#2E2A24' }}>
                製品を登録
              </span>
              <span className="text-[9.5px]" style={{ color: '#A2988A' }}>
                6/29 ・ 補修シャンプー
              </span>
            </div>
            <span className="text-[13px]" style={{ color: '#B3A996' }}>
              ···
            </span>
          </div>
          <div className="flex gap-0.5">
            <div className="flex-1 aspect-square" style={{ backgroundColor: '#E7DCC4' }} />
            <div className="flex-1 aspect-square" style={{ backgroundColor: '#EFE8DA' }} />
          </div>
          <div className="p-[12px_14px] flex flex-col gap-[7px]">
            <div className="flex gap-[6px] flex-wrap text-[9.5px]">
              <span
                className="rounded-full px-[9px] py-[4px] font-bold"
                style={{ backgroundColor: '#EFE8DA', color: '#8A7A5F' }}
              >
                #乾燥対策
              </span>
              <span
                className="rounded-full px-[9px] py-[4px] font-bold"
                style={{ backgroundColor: '#EFE8DA', color: '#8A7A5F' }}
              >
                #2本目
              </span>
            </div>
            <span
              className="text-[11.5px] leading-[1.75]"
              style={{ color: '#5F584E' }}
            >
              シャンプーを変えて2週間。頭皮の乾燥が落ち着いてきた。
            </span>
          </div>
        </div>

        {/* Feed Item 3 */}
        <div
          className="bg-white rounded-[18px] overflow-hidden"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <div className="flex gap-[10px] items-center p-[12px_14px]">
            <div
              className="w-[30px] h-[30px] rounded-full flex-none"
              style={{ backgroundColor: '#EFE8DA' }}
            />
            <div className="flex-1 flex flex-col">
              <span className="text-[11.5px] font-bold" style={{ color: '#2E2A24' }}>
                施術後1週間の感想
              </span>
              <span className="text-[9.5px]" style={{ color: '#A2988A' }}>
                5/17
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
              やや明るすぎた
            </span>
            <span
              className="border rounded-full px-[11px] py-[5px]"
              style={{
                borderColor: '#E5DDCF',
                color: '#7A7266',
              }}
            >
              手触りは良い
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <span
          className="text-[10.5px] leading-[1.7] text-center"
          style={{ color: '#A2988A' }}
        >
          記録は非公開です。来店前にまとめて美容師に共有できます。
        </span>
      </div>

      {/* Tab Bar */}
      <div
        className="flex border-t"
        style={{ borderColor: '#E5DDCF', backgroundColor: '#fff', padding: '10px 0 16px' }}
      >
        {[
          { label: 'ホーム', active: false },
          { label: 'きろく', active: true },
          { label: 'マイカルテ', active: false },
          { label: 'サロン', active: false },
        ].map((tab, idx) => (
          <div
            key={idx}
            className="flex-1 text-center text-[10px]"
            style={{
              fontWeight: tab.active ? '700' : 'normal',
              color: tab.active ? '#8A7A5F' : '#A2988A',
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>
    </div>
  )
}
