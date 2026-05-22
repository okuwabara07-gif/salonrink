'use client'

import { useEffect, useState, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { MenuRow } from '@/lib/menus/schema'
import { CategoryPillBar } from './CategoryPillBar'
import { MenuCardB } from './MenuCardB'
import { MenuEditorSheet } from './MenuEditorSheet'
import { FAB } from './FAB'
import { BottomNav } from '../../_components/BottomNav'

interface MenuFormData {
  name: string
  price: number
  duration: number
  category: string
}

interface MenuClientProps {
  user: User
}

const CATEGORIES = ['カット', 'カラー', 'パーマ', 'トリートメント', 'ヘッドスパ', 'セット', '未分類']

export function MenuClient({ user }: MenuClientProps) {
  const [menus, setMenus] = useState<MenuRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salonName, setSalonName] = useState<string>('サロン')
  const [activeCategory, setActiveCategory] = useState<string>('カラー')
  const [editingMenu, setEditingMenu] = useState<MenuRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // データ初期化
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // メニュー取得は必須
        const menuRes = await fetch('/api/menus')
        if (!menuRes.ok) throw new Error('メニューの取得に失敗しました')
        const menuJson = await menuRes.json()
        setMenus(menuJson.data || [])

        // サロン情報は任意(失敗してもメニュー画面は表示)
        try {
          const now = new Date()
          const year = now.getFullYear()
          const month = now.getMonth() + 1
          const kpiRes = await fetch(`/api/kpi?year=${year}&month=${month}`)
          if (kpiRes.ok) {
            const kpiJson = await kpiRes.json()
            if (kpiJson.data?.salon?.name) {
              setSalonName(kpiJson.data.salon.name)
            }
          }
        } catch (kpiErr) {
          console.warn('[MenuClient] salon name fetch failed (non-critical):', kpiErr)
          // エラーにしない、salonName は 'サロン' のまま
        }
      } catch (err) {
        console.error('[MenuClient] init error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user.id])

  // Derived state: フィルタ・ソート済みメニュー
  const filtered = useMemo(
    () =>
      menus
        .filter((m) => (m.category ?? '未分類') === activeCategory)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [menus, activeCategory]
  )

  // Derived state: カテゴリ別件数
  const categoryCounts = useMemo(
    () =>
      CATEGORIES.map((name) => ({
        name,
        count: menus.filter((m) => (m.category ?? '未分類') === name).length,
      })),
    [menus]
  )

  // ハンドラー: 保存
  const handleSave = async (data: MenuFormData) => {
    setSaving(true)
    try {
      if (editingMenu) {
        // 更新
        const res = await fetch(`/api/menus/${editingMenu.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error || 'Failed to update')
        }
        const json = await res.json()
        setMenus((prev) =>
          prev.map((m) => (m.id === editingMenu.id ? json.data : m))
        )
      } else {
        // 新規作成
        const res = await fetch('/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error || 'Failed to create')
        }
        const json = await res.json()
        setMenus((prev) => [...prev, json.data])
      }
      setEditingMenu(null)
      setCreating(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // ハンドラー: 削除
  const handleDelete = async () => {
    if (!editingMenu) return
    if (!confirm(`「${editingMenu.name}」を削除しますか?`)) return

    setSaving(true)
    try {
      const res = await fetch(`/api/menus/${editingMenu.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to delete')
      }
      setMenus((prev) => prev.filter((m) => m.id !== editingMenu.id))
      setEditingMenu(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  // ハンドラー: 閉じる
  const handleClose = () => {
    setEditingMenu(null)
    setCreating(false)
  }

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* ヘッダー */}
      <header className="bg-cream px-4 pt-4 pb-3 border-b border-border-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-serif text-[19px] font-medium text-ink"
              style={{ letterSpacing: '0.4px' }}
            >
              メニュー編集
            </h1>
            <p className="text-[11px] text-muted mt-px">{salonName}</p>
          </div>
          <button
            onClick={() => setReorderMode(!reorderMode)}
            className={`text-[12px] px-1.5 py-1 ${
              reorderMode
                ? 'text-green font-semibold'
                : 'text-muted'
            }`}
          >
            {reorderMode ? '完了' : '並べ替え'}
          </button>
        </div>
      </header>

      {/* カテゴリピル */}
      <CategoryPillBar
        categories={categoryCounts}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* 件数表示 */}
      <div className="px-3 pb-1.5 flex items-center justify-between text-[11px] text-muted">
        <span>{filtered.length}件のメニュー</span>
        {reorderMode && (
          <span className="text-green font-medium">カードをドラッグで並べ替え</span>
        )}
      </div>

      {/* メニューグリッド */}
      <main className="flex-1 overflow-y-auto px-3 pt-1 pb-28">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted">
            読み込み中...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((menu) => (
              <MenuCardB
                key={menu.id}
                menu={menu}
                reorderMode={reorderMode}
                onEdit={() => setEditingMenu(menu)}
              />
            ))}

            {!reorderMode && (
              <button
                onClick={() => setCreating(true)}
                className="min-h-[132px] rounded-xl border border-dashed border-hairline bg-transparent text-muted text-[12px] flex flex-col items-center justify-center gap-1"
              >
                <div className="w-8 h-8 rounded-full bg-bg-alt text-muted flex items-center justify-center text-[16px]">
                  ＋
                </div>
                <span>追加</span>
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-alert-soft border border-alert text-alert text-[12px] rounded">
            {error}
          </div>
        )}
      </main>

      {/* FAB(並べ替え中は非表示) */}
      {!reorderMode && (
        <FAB onClick={() => setCreating(true)} label="新規メニュー" />
      )}

      {/* BottomNav */}
      <BottomNav />

      {/* BottomSheet エディタ */}
      <MenuEditorSheet
        open={!!editingMenu || creating}
        menu={editingMenu}
        defaultCategory={activeCategory}
        categories={CATEGORIES}
        onSave={handleSave}
        onDelete={editingMenu ? handleDelete : undefined}
        onClose={handleClose}
        saving={saving}
      />
    </div>
  )
}
