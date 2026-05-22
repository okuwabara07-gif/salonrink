'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import {
  MenuRow,
  CreateMenuRequest,
  UpdateMenuRequest,
} from '@/lib/menus/schema'
import {
  fetchMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  MenuListResponse,
} from '@/lib/menus/client'
import { BottomNav } from '../../_components/BottomNav'

// ========================================
// Type definitions
// ========================================

type ModalMode = 'create' | 'edit' | null

interface MenuClientProps {
  user: User
}

// ========================================
// Main MenuClient Component
// ========================================

export function MenuClient({ user }: MenuClientProps) {
  const [menus, setMenus] = useState<MenuRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMenu, setSelectedMenu] = useState<MenuRow | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // ========================================
  // Initialize: Fetch menus
  // ========================================

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const data = await fetchMenus()
        if (!data) {
          setError('メニュー情報の取得に失敗しました')
          setMenus([])
          return
        }
        setMenus(data.items)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch menus:', err)
        setError('メニュー情報の取得中にエラーが発生しました')
        setMenus([])
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  // ========================================
  // Auto-dismiss error toast
  // ========================================

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(timer)
  }, [error])

  // ========================================
  // Derived state: Filtered menus by category
  // ========================================

  const filteredMenus = menus?.filter((menu) => {
    if (activeCategory === 'all') return true
    return menu.category === activeCategory || (activeCategory === 'その他' && !menu.category)
  }) || []

  // ========================================
  // Extract unique categories
  // ========================================

  const categories = ['all', ...(new Set(menus?.map((m) => m.category || 'その他').filter(Boolean)))]

  // ========================================
  // Count menus by category
  // ========================================

  const countByCategory = (cat: string): number => {
    if (!menus) return 0
    if (cat === 'all') return menus.length
    return menus.filter(m =>
      m.category === cat || (cat === 'その他' && !m.category)
    ).length
  }

  // ========================================
  // Event handlers
  // ========================================

  const handleCreateClick = () => {
    setSelectedMenu(null)
    setModalMode('create')
  }

  const handleEditClick = (menu: MenuRow) => {
    setSelectedMenu(menu)
    setModalMode('edit')
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setSelectedMenu(null)
  }

  const handleSaveMenu = async (data: CreateMenuRequest | UpdateMenuRequest) => {
    try {
      if (modalMode === 'create') {
        const created = await createMenu(data as CreateMenuRequest)
        if (!created) {
          setError('メニューの作成に失敗しました')
          return
        }
        // Refresh menus list
        const updated = await fetchMenus()
        if (updated) {
          setMenus(updated.items)
        }
      } else if (modalMode === 'edit' && selectedMenu) {
        const updated = await updateMenu(selectedMenu.id, data as UpdateMenuRequest)
        if (!updated) {
          setError('メニューの更新に失敗しました')
          return
        }
        // Refresh menus list
        const refreshed = await fetchMenus()
        if (refreshed) {
          setMenus(refreshed.items)
        }
      }
      handleCloseModal()
      setError(null)
    } catch (err) {
      console.error('Save menu error:', err)
      setError('メニューの保存に失敗しました')
    }
  }

  const handleDeleteMenu = async () => {
    if (!selectedMenu) return
    if (!confirm('このメニューを削除しますか？')) return

    try {
      const success = await deleteMenu(selectedMenu.id)
      if (!success) {
        setError('メニューの削除に失敗しました')
        return
      }
      // Refresh menus list
      const updated = await fetchMenus()
      if (updated) {
        setMenus(updated.items)
      }
      handleCloseModal()
      setError(null)
    } catch (err) {
      console.error('Delete menu error:', err)
      setError('メニューの削除に失敗しました')
    }
  }

  // ========================================
  // Render: Loading
  // ========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-xl">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-3 border-line border-t-accent rounded-full animate-spin mb-md" />
          <p className="text-body-sm text-ink-3">読み込み中…</p>
        </div>
      </div>
    )
  }

  // ========================================
  // Render: Main content
  // ========================================

  return (
    <div className="relative pb-32">
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-20 left-lg right-lg bg-coral text-white text-body-sm rounded-md p-md shadow-phone z-40">
          {error}
        </div>
      )}

      {/* Category Tabs */}
      <div className="sticky top-16 bg-card border-b border-line px-lg py-sm flex gap-sm overflow-x-auto">
        {categories.map((cat) => {
          const label = cat === 'all' ? 'すべて' : cat
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-md py-sm text-caption-md whitespace-nowrap font-500 border-b-2 transition ${
                isActive
                  ? 'text-ink border-b-accent'
                  : 'text-ink-3 border-b-transparent'
              }`}
            >
              {label}
              <span className="ml-xs text-ink-4">
                ({countByCategory(cat)})
              </span>
            </button>
          )
        })}
      </div>

      {/* Menu List */}
      <div className="px-lg py-md space-y-md">
        {filteredMenus.length === 0 ? (
          // Empty state
          <div className="text-center py-xl">
            <p className="text-body-sm text-ink-3 mb-md">
              「{activeCategory === 'all' ? 'すべての' : activeCategory}」メニューはまだ登録されていません
            </p>
            <button
              onClick={handleCreateClick}
              className="text-accent text-body-sm font-500 underline"
            >
              新規追加
            </button>
          </div>
        ) : (
          filteredMenus.map((menu) => (
            <MenuItemCard
              key={menu.id}
              menu={menu}
              onEdit={() => handleEditClick(menu)}
            />
          ))
        )}
      </div>

      {/* FAB: Create new menu */}
      <button
        onClick={handleCreateClick}
        className="fixed bottom-20 right-lg w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center shadow-fab hover:bg-accent-hover transition"
        aria-label="新規メニューを追加"
      >
        <IconPlus size={22} stroke={2} />
      </button>

      {/* Modal: Create/Edit Menu */}
      {modalMode && (
        <MenuEditorModal
          mode={modalMode}
          menu={selectedMenu}
          onSave={handleSaveMenu}
          onDelete={modalMode === 'edit' ? handleDeleteMenu : undefined}
          onClose={handleCloseModal}
        />
      )}

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  )
}

// ========================================
// MenuItemCard Component
// ========================================

interface MenuItemCardProps {
  menu: MenuRow
  onEdit: () => void
}

function MenuItemCard({ menu, onEdit }: MenuItemCardProps) {
  return (
    <div className="bg-card border border-line rounded-md p-md flex items-start gap-md">
      {/* Info */}
      <div className="flex-1">
        <h3 className="text-body-md text-ink font-500 mb-xs">
          {menu.name}
        </h3>
        <div className="flex gap-md text-caption-md text-ink-3">
          <span className="font-mono">¥{menu.price.toLocaleString()}</span>
          <span>{menu.duration}分</span>
        </div>
        {menu.category && (
          <div className="mt-xs text-caption-sm text-ink-4">
            {menu.category}
          </div>
        )}
      </div>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="text-accent hover:text-accent-hover transition"
        aria-label="編集"
      >
        <IconEdit size={18} stroke={2} />
      </button>
    </div>
  )
}

// ========================================
// MenuEditorModal Component
// ========================================

interface MenuEditorModalProps {
  mode: ModalMode
  menu: MenuRow | null
  onSave: (data: CreateMenuRequest | UpdateMenuRequest) => void
  onDelete?: () => void
  onClose: () => void
}

function MenuEditorModal({
  mode,
  menu,
  onSave,
  onDelete,
  onClose,
}: MenuEditorModalProps) {
  const [formData, setFormData] = useState<CreateMenuRequest | UpdateMenuRequest>({
    name: menu?.name || '',
    price: menu?.price || 0,
    duration: menu?.duration || 30,
    category: menu?.category || undefined,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSave(formData)
    } finally {
      setSubmitting(false)
    }
  }

  const categoryOptions = [
    'カラー',
    'カット',
    'パーマ',
    'トリートメント',
    'セット',
    'その他',
  ]

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-warm rounded-t-xl rounded-b-none p-lg max-h-[85vh] overflow-y-auto z-50">
        {/* Header */}
        <div className="flex items-center justify-between mb-lg">
          <h2 className="text-heading-sm text-ink font-serif">
            {mode === 'create' ? '新規メニュー' : 'メニュー編集'}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink"
            aria-label="閉じる"
          >
            <IconX size={20} stroke={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-md">
          {/* Menu Name */}
          <div>
            <label className="text-label-sm text-ink-3 block mb-xs">
              メニュー名
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-line rounded-md px-md py-sm text-body-sm focus:outline-none focus:border-accent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-label-sm text-ink-3 block mb-xs">
              カテゴリ
            </label>
            <div className="flex flex-wrap gap-sm">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, category: cat })
                  }
                  className={`px-md py-xs rounded-md text-caption-md font-500 border transition ${
                    formData.category === cat
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white border-line text-ink hover:border-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Duration Grid */}
          <div className="grid grid-cols-2 gap-md">
            {/* Price */}
            <div>
              <label className="text-label-sm text-ink-3 block mb-xs">
                料金
              </label>
              <div className="flex items-center border border-line rounded-md">
                <span className="px-md text-ink-3">¥</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 border-l border-line px-md py-sm text-body-sm focus:outline-none"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-label-sm text-ink-3 block mb-xs">
                所要時間
              </label>
              <div className="flex items-center border border-line rounded-md">
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 30,
                    })
                  }
                  className="flex-1 px-md py-sm text-body-sm focus:outline-none"
                  required
                  min="15"
                  step="15"
                />
                <span className="px-md text-ink-3">分</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-md pt-md">
            {/* Delete Button (edit mode only) */}
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={submitting}
                className="flex-1 px-lg py-md border border-coral text-coral text-btn-md font-500 rounded-md hover:bg-coral/10 disabled:opacity-50 transition"
              >
                削除する
              </button>
            )}

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-lg py-md border border-line text-ink text-btn-md font-500 rounded-md hover:bg-line/30 disabled:opacity-50 transition"
            >
              キャンセル
            </button>

            {/* Save Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-lg py-md bg-accent text-white text-btn-md font-500 rounded-md hover:bg-accent-hover disabled:opacity-50 transition"
            >
              {submitting
                ? '保存中…'
                : mode === 'create'
                  ? '追加する'
                  : '更新する'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
