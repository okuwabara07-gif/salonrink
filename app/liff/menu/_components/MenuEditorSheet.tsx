'use client'

import React, { useState, useEffect } from 'react'

const PRICE_QUICKPICKS = [3800, 4500, 5500, 6800, 8500, 11000]
const DURATION_PRESETS = [15, 30, 45, 60, 75, 90, 120, 150, 180]

interface MenuFormData {
  name: string
  price: number
  duration: number
  category: string
}

interface MenuEditorSheetProps {
  open: boolean
  menu: {
    id: string
    name: string
    price: number
    duration: number
    category: string | null
  } | null
  defaultCategory: string
  categories: string[]
  onSave: (data: MenuFormData) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
  saving?: boolean
}

export function MenuEditorSheet({
  open,
  menu,
  defaultCategory,
  categories,
  onSave,
  onDelete,
  onClose,
  saving = false,
}: MenuEditorSheetProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(5000)
  const [duration, setDuration] = useState(60)
  const [category, setCategory] = useState(defaultCategory)

  useEffect(() => {
    if (open) {
      setName(menu?.name ?? '')
      setPrice(menu?.price ?? 5000)
      setDuration(menu?.duration ?? 60)
      setCategory(menu?.category || defaultCategory)
    }
  }, [open, menu, defaultCategory])

  if (!open) return null

  const adjustPrice = (delta: number) => {
    const next = Math.max(0, price + delta)
    setPrice(Math.round(next / 100) * 100)
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    await onSave({ name: name.trim(), price, duration, category })
  }

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* BottomSheet 本体 */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl z-50 max-h-[85vh] overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="px-5 py-5">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-serif text-[17px] font-medium text-ink"
              style={{ letterSpacing: '0.3px' }}
            >
              {menu ? 'メニュー編集' : '新規メニュー'}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 text-muted text-[18px] leading-none"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>

          {/* フォーム */}
          <div className="flex flex-col gap-3.5">
            {/* メニュー名 */}
            <div>
              <label className="text-[11px] text-muted font-medium mb-1.5 block">
                メニュー名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: リタッチ + トリートメント"
                className="w-full px-3 py-2.5 rounded-lg border border-border-primary bg-surface text-[14px] text-ink outline-none focus:border-ink"
              />
            </div>

            {/* カテゴリ */}
            <div>
              <label className="text-[11px] text-muted font-medium mb-1.5 block">
                カテゴリ
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {categories.map((c) => {
                  const active = c === category
                  return (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-md text-[12px] border ${
                        active
                          ? 'bg-green text-white border-green font-semibold'
                          : 'bg-surface text-ink border-border-primary'
                      }`}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 料金 */}
            <div>
              <label className="text-[11px] text-muted font-medium mb-1.5 block">
                料金(税込)
              </label>
              <div className="flex gap-1.5 items-stretch">
                <button
                  onClick={() => adjustPrice(-500)}
                  className="w-9 rounded-lg border border-border-primary bg-surface text-ink text-[18px]"
                  aria-label="-500"
                >
                  −
                </button>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-[13px]">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 pl-7 rounded-lg border border-border-primary bg-surface text-[15px] font-mono font-medium text-ink text-center outline-none focus:border-ink"
                  />
                </div>
                <button
                  onClick={() => adjustPrice(500)}
                  className="w-9 rounded-lg border border-border-primary bg-surface text-ink text-[18px]"
                  aria-label="+500"
                >
                  +
                </button>
              </div>

              {/* クイックピック */}
              <div className="flex gap-1.5 flex-wrap mt-1.5">
                {PRICE_QUICKPICKS.map((p) => {
                  const active = price === p
                  return (
                    <button
                      key={p}
                      onClick={() => setPrice(p)}
                      className={`px-2.5 py-1.5 rounded-md text-[11px] font-mono border ${
                        active
                          ? 'bg-ink text-white border-ink font-semibold'
                          : 'bg-surface text-ink border-border-primary'
                      }`}
                    >
                      ¥{p.toLocaleString()}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 所要時間 */}
            <div>
              <label className="text-[11px] text-muted font-medium mb-1.5 block">
                所要時間
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {DURATION_PRESETS.map((d) => {
                  const active = duration === d
                  const suggested = d === 60
                  return (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-2.5 py-1.5 rounded-md text-[11px] font-mono border ${
                        active
                          ? 'bg-ink text-white border-ink font-semibold'
                          : suggested
                            ? 'bg-surface text-green border-green font-semibold'
                            : 'bg-surface text-ink border-border-primary'
                      }`}
                    >
                      {d}分
                    </button>
                  )
                })}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || saving}
                className="px-4 py-3 rounded-lg bg-green text-white text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : menu ? '更新する' : '追加する'}
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-lg bg-transparent text-alert border border-alert text-[13px] font-medium disabled:opacity-50"
                >
                  削除する
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
