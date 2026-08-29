'use client'

import { useState } from 'react'
import LiffTabBar from '../_components/LiffTabBar'
import { useMycarte } from '../_lib/useMycarte'

export default function SettingsPage() {
  const { data: carte } = useMycarte()
  // アレルギーは profiles.concerns に入るが、書き戻す action が save-record 側に
  // 未実装のため、いまは端末内の選択状態のみを保持する。
  const [allergies, setAllergies] = useState<Set<string>>(new Set())

  const storage = carte?.storage ?? null
  const photosUsed = storage?.used ?? 0
  const photosLimit = storage?.limit ?? 0
  const storagePercent = photosLimit > 0 ? Math.min(100, (photosUsed / photosLimit) * 100) : 0
  const retentionLabel = storage
    ? storage.retention_days == null
      ? '期限なし'
      : `${storage.retention_days}日`
    : '—'
  const [notificationPrefs, setNotificationPrefs] = useState({
    nextVisit: true,
    productReminder: true,
    photoExpiry: true,
    postServiceSurvey: false,
  })

  const handleAllergyToggle = (allergy: string) => {
    const newSet = new Set(allergies)
    if (newSet.has(allergy)) {
      newSet.delete(allergy)
    } else {
      newSet.add(allergy)
    }
    setAllergies(newSet)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3EEE5' }}>
      {/* Header */}
      <div
        className="border-b flex items-center gap-[10px]"
        style={{ borderColor: '#E5DDCF', padding: '12px 18px 14px' }}
      >
        <span className="text-[15px]" style={{ color: '#8A7A5F' }}>
          ‹
        </span>
        <h1 className="font-serif text-[17px] font-medium" style={{ color: '#2E2A24' }}>
          わたしの情報
        </h1>
        <div className="flex-1" />
        <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
          設定
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-[14px]" style={{ padding: '16px 18px 20px' }}>
        {/* Info Banner */}
        <div
          className="rounded-[16px] p-[14px_16px] text-[11.5px] leading-[1.8]"
          style={{ backgroundColor: '#EDE5D6', color: '#5F584E' }}
        >
          ここに保存した内容は、毎回のカルテに自動で添付されます。変更があったときだけ更新してください。
        </div>

        {/* Allergies Card */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
            アレルギー・注意事項
          </h2>
          <div className="flex flex-col gap-[8px] text-[11.5px]">
            {['ヘアカラーでしみやすい', '金属アレルギーあり', '肌が敏感・荒れやすい'].map((allergy) => (
              <div
                key={allergy}
                className="flex justify-between items-center rounded-[12px] p-[12px_14px] border"
                style={{
                  borderColor: allergies.has(allergy) ? '#A98D4B' : '#E5DDCF',
                  backgroundColor: allergies.has(allergy) ? '#EFE8DA' : 'transparent',
                }}
              >
                <span style={{ color: allergies.has(allergy) ? '#8A7A5F' : '#2E2A24', fontWeight: allergies.has(allergy) ? '500' : 'normal' }}>
                  {allergy}
                </span>
                <div
                  className="w-[17px] h-[17px] rounded-full flex items-center justify-center border flex-none"
                  style={{
                    borderColor: allergies.has(allergy) ? '#A98D4B' : '#D8CCB8',
                    backgroundColor: allergies.has(allergy) ? '#A98D4B' : 'transparent',
                    color: allergies.has(allergy) ? '#fff' : 'transparent',
                    fontSize: '9px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleAllergyToggle(allergy)}
                >
                  {allergies.has(allergy) && '✓'}
                </div>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="その他（自由記入）"
            className="border rounded-[12px] p-[12px] text-[11px]"
            style={{ borderColor: '#E5DDCF', color: '#A2988A' }}
          />
        </div>

        {/* Treatment History Card */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <div className="flex justify-between items-baseline">
            <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
              過去の施術履歴
            </h2>
            <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
              自動＋手入力
            </span>
          </div>
          <div className="flex flex-col gap-[7px] text-[11.5px]">
            {/* 施術履歴を保存するカラムが未定義のため、確定するまで空で描画する。 */}
            {([] as { label: string; value: string }[]).map((item) => (
              <div
                key={item.label}
                className="flex justify-between rounded-[11px] p-[11px_12px]"
                style={{ backgroundColor: '#F7F3EA' }}
              >
                <span style={{ color: '#7A7266' }}>{item.label}</span>
                <span style={{ color: '#2E2A24' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <button
            className="text-center border rounded-full py-[11px] text-[12px]"
            style={{ borderColor: '#E5DDCF', color: '#2E2A24' }}
          >
            施術を追加する
          </button>
          <span className="text-[10px] leading-[1.7]" style={{ color: '#A2988A' }}>
            履歴が揃うほど、薬剤選定の判断材料が増えます
          </span>
        </div>

        {/* Photo Storage Card */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
            写真の保存とプライバシー
          </h2>
          <div className="flex flex-col gap-[6px]">
            <div className="flex justify-between items-baseline">
              <span className="text-[11.5px]" style={{ color: '#5F584E' }}>
                保存中の写真 {photosUsed} / {photosLimit}枚
              </span>
              <span className="text-[10.5px]" style={{ color: '#A2988A' }}>
                無料プラン（90日保存）
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EFE8DA' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${storagePercent}%`, backgroundColor: '#C9B27C' }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-[8px] text-[11.5px]">
            {[
              { label: '保存期間', value: `${retentionLabel} ›` },
              { label: '写真をまとめて削除', value: '›' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-[10px] px-0.5"
                style={{
                  borderTop: item.label !== '保存期間' ? '1px solid #EFE8DA' : 'none',
                }}
              >
                <span style={{ color: '#5F584E' }}>{item.label}</span>
                <span style={{ color: '#A2988A' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div
            className="rounded-[12px] p-[12px] flex flex-col gap-[8px]"
            style={{ backgroundColor: '#EDE5D6' }}
          >
            <div className="flex justify-between items-baseline">
              <span className="text-[11.5px] font-bold" style={{ color: '#8A7A5F' }}>
                髪のアルバムを残す
              </span>
              <span className="text-[11px] font-bold" style={{ color: '#8A7A5F' }}>
                ¥---
              </span>
            </div>
            <span className="text-[10.5px] leading-[1.7]" style={{ color: '#5F584E' }}>
              無期限で保存・枚数の上限なし・年単位の比較ビュー
            </span>
            <button
              className="text-center rounded-full py-[11px] text-[12px] font-bold text-white"
              style={{ backgroundColor: '#1B1815' }}
            >
              プランを見る
            </button>
          </div>
        </div>

        {/* Notifications Card */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[11px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          <h2 className="font-serif text-[14px] font-medium" style={{ color: '#2E2A24' }}>
            通知
          </h2>
          <div className="flex flex-col gap-[8px] text-[11.5px]">
            {[
              { key: 'nextVisit', label: '次の来店目安' },
              { key: 'productReminder', label: '製品の残量' },
              { key: 'photoExpiry', label: '写真の保存期限' },
              { key: 'postServiceSurvey', label: '施術後1週間の質問' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex justify-between items-center py-[10px] px-0.5"
                style={{
                  borderTop: item.key !== 'nextVisit' ? '1px solid #EFE8DA' : 'none',
                }}
              >
                <span style={{ color: '#5F584E' }}>{item.label}</span>
                <button
                  className="w-9 h-5 rounded-full relative flex-none"
                  style={{
                    backgroundColor: notificationPrefs[item.key as keyof typeof notificationPrefs] ? '#A98D4B' : '#DCCFBD',
                  }}
                  onClick={() =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      [item.key]: !notificationPrefs[item.key as keyof typeof notificationPrefs],
                    })
                  }
                >
                  <div
                    className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
                    style={{
                      backgroundColor: '#fff',
                      [notificationPrefs[item.key as keyof typeof notificationPrefs] ? 'right' : 'left']: '2px',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Links Card */}
        <div
          className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[8px]"
          style={{ boxShadow: '0 1px 0 #E5DDCF' }}
        >
          {[
            { label: 'プロフィール', arrow: true },
            { label: '利用規約・プライバシーポリシー', arrow: true },
            { label: 'お問い合わせ', arrow: true },
          ].map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center py-[10px] px-0.5 text-[11.5px]"
              style={{
                borderTop: item.label !== 'プロフィール' ? '1px solid #EFE8DA' : 'none',
              }}
            >
              <span style={{ color: '#5F584E' }}>{item.label}</span>
              <span style={{ color: '#A2988A' }}>{item.arrow && '›'}</span>
            </div>
          ))}
        </div>
      </div>

      <LiffTabBar active="home" />
    </div>
  )
}
