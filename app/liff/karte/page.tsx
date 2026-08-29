'use client'

import { useMemo, useState } from 'react'
import liff from '@line/liff'
import LiffTabBar from '../_components/LiffTabBar'
import { useMycarte } from '../_lib/useMycarte'
import { longDateTime, photoKindLabel, shortDate } from '../_lib/format'
import { SR_FUNCTIONS_BASE } from '../_lib/mycarteTypes'

type KarteStep = 1 | 2 | 3 | 4 | 'complete'

const CONCERNS = [
  '広がりやすい',
  'うねり・くせ',
  'パサつき・乾燥',
  'ぺたんこ',
  '頭皮のかゆみ',
  'ニオイ',
  '白髪が増えた',
]

const MENUS = [
  'カット',
  'カラー',
  '白髪ぼかし',
  'パーマ',
  'トリートメント',
  'スカルプケア',
  'ヘッドスパ',
  'その他',
]

export default function KartePage() {
  const [step, setStep] = useState<KarteStep>(1)
  const { data: carte, profile } = useMycarte()
  const [selectedConcerns, setSelectedConcerns] = useState<Set<string>>(new Set())
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sentAt, setSentAt] = useState<string | null>(null)

  const photos = useMemo(() => (carte?.photos ?? []).slice(0, 3), [carte])
  const inspirations = useMemo(() => (carte?.inspirations ?? []).slice(0, 3), [carte])
  const pickedPhotos = useMemo(
    () => photos.filter((p) => selectedImages.has(p.id)),
    [photos, selectedImages],
  )

  const handleImageToggle = (id: string) => {
    const next = new Set(selectedImages)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedImages(next)
  }
  const [selectedAvoid, setSelectedAvoid] = useState<Set<string>>(new Set())
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set())
  const [selectedPurpose, setSelectedPurpose] = useState<string>('')

  /** 送信本文。プレビューと共有メッセージで同一の文字列を使う。 */
  const summaryLines = [
    selectedMenus.size > 0 ? `【希望】 ${[...selectedMenus].join('、')}` : null,
    selectedPurpose ? `【イメージ】 ${selectedPurpose}` : null,
    selectedConcerns.size > 0 ? `【悩み】 ${[...selectedConcerns].join('、')}` : null,
    selectedAvoid.size > 0 ? `【避けたいこと】 ${[...selectedAvoid].join('、')}` : null,
  ].filter(Boolean) as string[]

  /**
   * 送信＝(1) karte_records に記録を残す (2) LINEの共有ピッカーで本文を送る。
   * save-record の deployed 版に karte_sent は存在しないため record_create を使う。
   */
  const handleSend = async () => {
    if (!profile?.userId) {
      setSendError('LINEから開くと送信できます。')
      return
    }
    if (summaryLines.length === 0) {
      setSendError('希望・悩みのいずれかを選んでください。')
      return
    }
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch(`${SR_FUNCTIONS_BASE}/save-record`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          line_user_id: profile.userId,
          action: 'record_create',
          kind: 'record',
          body: summaryLines.join('\\n'),
          tags: [...selectedConcerns].slice(0, 6),
          photo_path: pickedPhotos[0]?.storage_path ?? null,
        }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok || !j?.ok) throw new Error(j?.error ?? `save-record ${res.status}`)

      if (liff.isApiAvailable('shareTargetPicker')) {
        await liff
          .shareTargetPicker([{ type: 'text', text: summaryLines.join('\\n') }])
          .catch(() => null)
      }
      setSentAt(j.record?.created_at ?? new Date().toISOString())
      setStep('complete')
    } catch (e) {
      setSendError(e instanceof Error ? e.message : '送信できませんでした。')
    } finally {
      setSending(false)
    }
  }

  const handleConcernToggle = (concern: string) => {
    const newSet = new Set(selectedConcerns)
    if (newSet.has(concern)) {
      newSet.delete(concern)
    } else {
      newSet.add(concern)
    }
    setSelectedConcerns(newSet)
  }

  const handleAvoidToggle = (avoid: string) => {
    const newSet = new Set(selectedAvoid)
    if (newSet.has(avoid)) {
      newSet.delete(avoid)
    } else {
      newSet.add(avoid)
    }
    setSelectedAvoid(newSet)
  }

  const handleMenuToggle = (menu: string) => {
    const newSet = new Set(selectedMenus)
    if (newSet.has(menu)) {
      newSet.delete(menu)
    } else {
      newSet.add(menu)
    }
    setSelectedMenus(newSet)
  }

  const progressFilled = step === 'complete' ? 4 : (step as number)

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: step === 'complete' ? '#F3EEE5' : '#FBF7F1' }}>
      {/* Header */}
      {step !== 'complete' && (
        <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #EDE4D8' }} className="flex flex-col gap-[10px]">
          <div className="flex justify-between items-baseline">
            <h1 className="font-serif text-[17px] font-medium" style={{ color: '#3D342C' }}>
              {step === 1 && 'いまの髪'}
              {step === 2 && 'なりたいイメージ'}
              {step === 3 && '希望と目的'}
              {step === 4 && '確認して送信'}
            </h1>
            <span className="text-[10.5px]" style={{ color: '#8B8178' }}>
              Step {step} / 4
            </span>
          </div>
          {/* Progress Bar */}
          <div className="flex gap-[5px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full"
                style={{
                  backgroundColor: i <= progressFilled ? '#A9855C' : '#EDE4D8',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ padding: '16px 18px 20px' }}>
        {step === 1 && (
          <div className="flex flex-col gap-[14px]">
            {/* Photos Card */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <div className="flex justify-between items-baseline">
                <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                  今の状態の写真
                </h2>
                <span className="text-[10.5px]" style={{ color: '#8B8178' }}>
                  きろくから{photos.length}枚
                </span>
              </div>
              {photos.length > 0 ? (
                <div className="flex gap-[7px]">
                  {photos.map((p) => {
                    const picked = selectedImages.has(p.id)
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleImageToggle(p.id)}
                        className="flex-1 flex flex-col gap-[5px] items-center"
                      >
                        <div
                          className="w-full h-20 rounded-[12px] overflow-hidden"
                          style={{
                            backgroundColor: '#EFE8DA',
                            boxShadow: picked ? '0 0 0 2px #A98D4B' : 'none',
                          }}
                        >
                          {p.signed_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.signed_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-[9.5px]" style={{ color: '#8B8178' }}>
                          {photoKindLabel(p.kind)} {shortDate(p.created_at)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <span className="text-[11px] leading-[1.7]" style={{ color: '#8B8178' }}>
                  きろくに写真がまだありません。撮影して登録すると、ここから選べます。
                </span>
              )}
              <div className="flex gap-[8px]">
                <button
                  className="flex-1 text-center border rounded-full py-[11px] text-[12px]"
                  style={{ borderColor: '#EDE4D8', color: '#3D342C' }}
                >
                  写真を選ぶ
                </button>
                <button
                  className="flex-1 text-center border rounded-full py-[11px] text-[12px]"
                  style={{ borderColor: '#EDE4D8', color: '#3D342C' }}
                >
                  カメラで撮る
                </button>
              </div>
              <span className="text-[10.5px] leading-[1.7]" style={{ color: '#8B8178' }}>
                自然光・髪をおろした状態がいちばん伝わります
              </span>
            </div>

            {/* Concerns Card */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                気になる悩み（複数選択）
              </h2>
              <div className="flex flex-wrap gap-[7px] text-[11.5px]">
                {CONCERNS.map((concern) => (
                  <button
                    key={concern}
                    onClick={() => handleConcernToggle(concern)}
                    className="border rounded-full px-[14px] py-[8px] font-medium transition"
                    style={{
                      borderColor: selectedConcerns.has(concern) ? '#A9855C' : '#EDE4D8',
                      backgroundColor: selectedConcerns.has(concern) ? '#EFE8DA' : 'transparent',
                      color: selectedConcerns.has(concern) ? '#8A6A44' : '#3D342C',
                    }}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-attached Info */}
            <div
              className="rounded-[18px] p-[15px_17px] flex flex-col gap-[8px]"
              style={{ backgroundColor: '#EDE5D6' }}
            >
              <span className="text-[11.5px] font-bold" style={{ color: '#8A6A44' }}>
                自動で添付されます
              </span>
              <span className="text-[11.5px] leading-[1.8]" style={{ color: '#6E6257' }}>
                髪質74・頭皮61・白髪90（6/28 診断）／ 前回の施術から106日
              </span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-[14px]">
            {/* Image Selection Grid */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                なりたいイメージ（3×2グリッド）
              </h2>
              <div className="grid grid-cols-3 gap-[7px]">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="aspect-square relative rounded-[12px] cursor-pointer border-2"
                    style={{
                      backgroundColor: '#EFE8DA',
                      borderColor: idx <= 2 ? '#A9855C' : '#DCCFBD',
                    }}
                  >
                    {idx <= 2 && (
                      <div
                        className="absolute right-[8px] top-[8px] w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#A9855C', color: '#fff' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Image Point */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                イメージのポイント
              </h2>
              <textarea
                className="w-full border rounded-[12px] p-[12px] text-[12px] resize-none"
                style={{ borderColor: '#EDE4D8', color: '#3D342C', minHeight: '100px' }}
                placeholder="例：ツヤ感重視で…"
              />
            </div>

            {/* Avoid Card */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                絶対に避けたいこと（複数選択）
              </h2>
              <div className="flex flex-wrap gap-[7px] text-[11.5px]">
                {['ショート', 'カラーなし', 'パーマなし'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAvoidToggle(option)}
                    className="border rounded-full px-[14px] py-[8px] font-medium transition"
                    style={{
                      borderColor: selectedAvoid.has(option) ? '#DDB5A8' : '#EDE4D8',
                      backgroundColor: selectedAvoid.has(option) ? '#FBF1ED' : 'transparent',
                      color: selectedAvoid.has(option) ? '#A8705C' : '#3D342C',
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-[14px]">
            {/* Menus */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                希望メニュー（複数選択）
              </h2>
              <div className="flex flex-wrap gap-[7px] text-[11.5px]">
                {MENUS.map((menu) => (
                  <button
                    key={menu}
                    onClick={() => handleMenuToggle(menu)}
                    className="border rounded-full px-[14px] py-[8px] font-medium transition"
                    style={{
                      borderColor: selectedMenus.has(menu) ? '#A9855C' : '#EDE4D8',
                      backgroundColor: selectedMenus.has(menu) ? '#A9855C' : 'transparent',
                      color: selectedMenus.has(menu) ? '#fff' : '#3D342C',
                    }}
                  >
                    {menu}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                来店の目的
              </h2>
              {['髪の状態に合わせてほしい', '写真のイメージを実現したい', 'その他'].map((purpose) => (
                <label
                  key={purpose}
                  className="flex items-center p-[12px] rounded-[12px] cursor-pointer"
                  style={{
                    backgroundColor: selectedPurpose === purpose ? '#F1E7DA' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="purpose"
                    value={purpose}
                    checked={selectedPurpose === purpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-[12px]" style={{ color: '#3D342C' }}>
                    {purpose}
                  </span>
                </label>
              ))}
            </div>

            {/* Free Text */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                伝えておきたいこと
              </h2>
              <textarea
                className="w-full border rounded-[12px] p-[12px] text-[12px] resize-none"
                style={{ borderColor: '#EDE4D8', color: '#3D342C', minHeight: '100px' }}
                placeholder="例：アレルギーや施術不可の内容…"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-[14px]">
            {/* Summary */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <div className="flex justify-between items-baseline">
                <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                  わたしの情報
                </h2>
                <a href="#" className="text-[10.5px] font-bold" style={{ color: '#8A6A44' }}>
                  編集
                </a>
              </div>
              <div className="flex flex-col gap-[8px] text-[11.5px]" style={{ color: '#6E6257' }}>
                {/* アレルギー・施術履歴は保存先のカラムが未定義。実装までは表示しない。 */}
                <span>持病・アレルギー・施術履歴は、設定から登録すると添付されます。</span>
              </div>
            </div>

            {/* Send Preview */}
            <div
              className="rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ backgroundColor: '#F1E7DA' }}
            >
              <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                送信プレビュー
              </h2>
              {(pickedPhotos.length > 0 || inspirations.length > 0) && (
                <div className="flex gap-[7px] text-[9.5px]">
                  {[...pickedPhotos, ...inspirations].slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="flex-1 aspect-video rounded-[12px] overflow-hidden"
                      style={{ backgroundColor: '#EFE8DA' }}
                    >
                      {p.signed_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.signed_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-[8px] text-[11px]" style={{ color: '#3D342C' }}>
                {summaryLines.length > 0 ? (
                  summaryLines.map((line) => <div key={line}>{line}</div>)
                ) : (
                  <div>まだ何も選ばれていません。Step1〜3で選ぶとここに反映されます。</div>
                )}
              </div>
            </div>

            {/* Destination */}
            <div
              className="bg-white rounded-[18px] p-[17px] flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #EDE4D8' }}
            >
              <h2 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                送信先
              </h2>
              {['サロン公式LINE', 'LINEの友だち'].map((dest) => (
                <label key={dest} className="flex items-center cursor-pointer">
                  <input type="radio" name="destination" className="mr-3" defaultChecked={dest === 'サロン公式LINE'} />
                  <span className="text-[12px]" style={{ color: '#3D342C' }}>
                    {dest}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center gap-[22px]" style={{ padding: '40px 22px 24px' }}>
            {/* Success Circle */}
            <div className="flex flex-col items-center gap-[22px]">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#EFE8DA' }}
              >
                <span className="text-[26px]" style={{ color: '#A98D4B' }}>
                  ✓
                </span>
              </div>
              <div className="flex flex-col items-center gap-[12px]">
                <h2 className="font-serif text-[23px] leading-[1.5] text-center" style={{ color: '#2E2A24' }}>
                  事前カルテを{'\n'}送信しました
                </h2>
                <p className="text-[12.5px] leading-[1.9] text-center" style={{ color: '#5F584E' }}>
                  ヘアサロン公式LINEに届いています。{'\n'}返信があるとLINEでお知らせします。
                </p>
              </div>
            </div>

            {/* Submission Status */}
            <div
              className="bg-white rounded-[18px] p-[17px] w-full flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #E5DDCF' }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-[12px]" style={{ color: '#3D342C' }}>
                  送信状況
                </h3>
                <span className="text-[10.5px] font-bold" style={{ color: '#A98D4B' }}>
                  返信待ち
                </span>
              </div>
              <div
                className="rounded-[11px] p-[10px_12px] space-y-[8px]"
                style={{ backgroundColor: '#F7F3EA' }}
              >
                <div className="text-[11.5px]" style={{ color: '#3D342C' }}>
                  送信先：ヘアサロン公式LINE
                </div>
                <div className="text-[11.5px]" style={{ color: '#3D342C' }}>
                  来店予定：2026年9月5日（木）14:00～
                </div>
                <div className="text-[11.5px]" style={{ color: '#3D342C' }}>
                  送信日時：{longDateTime(sentAt)}
                </div>
              </div>
              <button
                className="w-full border rounded-[12px] py-[11px] text-[12px] text-center"
                style={{ borderColor: '#E5DDCF', color: '#3D342C' }}
              >
                送信した内容を見る
              </button>
            </div>

            {/* Next Steps */}
            <div
              className="bg-white rounded-[18px] p-[17px] w-full flex flex-col gap-[12px]"
              style={{ boxShadow: '0 1px 0 #E5DDCF' }}
            >
              <h3 className="font-serif text-[14px] font-medium" style={{ color: '#3D342C' }}>
                来店までにできること
              </h3>
              <div className="flex flex-col gap-[14px]">
                {[
                  { num: 1, title: '内容の追加・修正', desc: 'きろくに記録を追加したら、自動で反映されます' },
                  { num: 2, title: '気づいたことを記録', desc: 'ケア方法やスタイリングのコツを記録' },
                  { num: 3, title: 'イメージを保存箱に追加', desc: 'Pinterest等の素材を追加すると、次のカルテに反映' },
                ].map((item) => (
                  <div key={item.num} className="flex gap-[12px]">
                    <span
                      className="font-serif text-[15px] flex-none"
                      style={{ color: '#A98D4B', width: '22px' }}
                    >
                      {item.num}
                    </span>
                    <div className="flex flex-col gap-[4px]">
                      <span className="text-[12.5px] font-bold" style={{ color: '#3D342C' }}>
                        {item.title}
                      </span>
                      <span className="text-[11px]" style={{ color: '#7A7266' }}>
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-[12px] w-full pt-[10px]">
              <button
                className="flex-1 border rounded-full py-[14px] text-[12.5px] font-bold"
                style={{ borderColor: '#E5DDCF', color: '#3D342C' }}
              >
                きろくに戻る
              </button>
              <button
                className="flex-1 rounded-full py-[14px] text-[12.5px] font-bold text-white"
                style={{ backgroundColor: '#1B1815' }}
              >
                ホームへ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions (Step navigation) */}
      {step !== 'complete' && (
        <div
          className="flex gap-[12px] mt-[20px]"
          style={{ padding: '16px 18px 20px', backgroundColor: '#fff' }}
        >
          {step > 1 && (
            <button
              onClick={() => setStep((step as number) - 1 as KarteStep)}
              className="w-[88px] border rounded-[14px] py-[14px] text-[12px] font-bold"
              style={{ borderColor: '#EDE4D8', color: '#3D342C' }}
            >
              戻る
            </button>
          )}
          <div className="flex-1 flex flex-col gap-[6px]">
            <button
              disabled={sending}
              onClick={() => {
                if (step === 1) setStep(2)
                else if (step === 2) setStep(3)
                else if (step === 3) setStep(4)
                else if (step === 4) void handleSend()
              }}
              className="rounded-[14px] py-[14px] text-[12px] font-bold text-white"
              style={{ backgroundColor: '#A9855C', opacity: sending ? 0.6 : 1 }}
            >
              {step === 4
                ? sending
                  ? '送信中…'
                  : 'LINEで事前カルテを送る'
                : step === 3
                  ? '確認へ'
                  : '次へ'}
            </button>
            {sendError && (
              <span className="text-[10.5px] text-center" style={{ color: '#A8705C' }}>
                {sendError}
              </span>
            )}
          </div>
        </div>
      )}

      {step === 'complete' && <LiffTabBar active="karte" />}
    </div>
  )
}
