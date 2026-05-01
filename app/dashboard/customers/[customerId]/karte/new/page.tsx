'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewKartePage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params?.customerId as string

  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // フォーム状態
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [menuName, setMenuName] = useState('')
  const [hairCondition, setHairCondition] = useState('')
  const [scalpCondition, setScalpCondition] = useState('')
  const [allergies, setAllergies] = useState('')
  const [treatmentNote, setTreatmentNote] = useState('')
  const [nextSuggestion, setNextSuggestion] = useState('')

  useEffect(() => {
    async function loadCustomer() {
      if (!customerId) return
      const supabase = await createClient()
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .maybeSingle()
      setCustomer(data)
      setLoading(false)
    }
    loadCustomer()
  }, [customerId])

  // メニュー名から recipe_type を推定
  const inferRecipeType = (menu: string): string => {
    const m = menu.toLowerCase()
    if (m.includes('カラー') || m.includes('color')) return 'color'
    if (m.includes('パーマ') || m.includes('perm')) return 'perm'
    if (m.includes('カット') || m.includes('cut')) return 'cut'
    return 'other'
  }

  const handleSave = async () => {
    if (!menuName.trim()) {
      alert('メニュー名を入力してください')
      return
    }
    if (!customer) {
      alert('顧客情報の読み込み待ち')
      return
    }

    setSaving(true)

    try {
      const supabase = await createClient()

      // Step 1: kartes 作成
      const { data: karte, error: karteError } = await supabase
        .from('kartes')
        .insert({
          salon_id: customer.salon_id,
          customer_id: customerId,
          visit_date: visitDate,
        })
        .select()
        .single()

      if (karteError || !karte) {
        throw new Error('カルテ保存失敗: ' + (karteError?.message || ''))
      }

      // Step 2: karte_recipes 作成
      const { error: recipeError } = await supabase
        .from('karte_recipes')
        .insert({
          karte_id: karte.id,
          salon_id: customer.salon_id,
          recipe_type: inferRecipeType(menuName),
          recipe_data: {
            menu_name: menuName,
            hair_condition: hairCondition,
            scalp_condition: scalpCondition,
            allergies: allergies,
            treatment_note: treatmentNote,
            next_suggestion: nextSuggestion,
          },
          notes: '',
        })

      if (recipeError) {
        console.error('レシピ保存失敗:', recipeError.message)
        // レシピ失敗してもカルテは作成済み・続行
      }

      // Step 3: AI 自動生成(裏で・await しない)
      const aiPayload = {
        customer_id: customerId,
        salon_id: customer.salon_id,
        karte_id: karte.id,
      }

      // サマリー
      fetch('/api/ai/customer-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPayload),
      }).catch(() => {})

      // アレルギー警告
      fetch('/api/ai/allergy-warning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPayload),
      }).catch(() => {})

      // Step 4: 顧客詳細に戻る
      router.push(`/dashboard/customers/${customerId}`)

    } catch (error) {
      alert('エラー: ' + (error as Error).message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
        読み込み中...
      </div>
    )
  }

  if (!customer) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#A32D2D' }}>
        顧客が見つかりません
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #E0D8D0',
    fontSize: 14,
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#666',
    marginBottom: 6,
  }

  const fieldStyle = {
    marginBottom: 20,
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, paddingBottom: 80 }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href={`/dashboard/customers/${customerId}`}
          style={{ color: '#888', fontSize: 13, textDecoration: 'none' }}
        >
          ← 顧客詳細に戻る
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: '8px 0 4px 0' }}>
          カルテ追加
        </h1>
        <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
          {customer.name} 様
        </p>
      </div>

      {/* フォーム */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>来店日 *</label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>メニュー名 *</label>
          <input
            type="text"
            placeholder="例: カット、カラー、パーマ"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>髪の状態</label>
          <textarea
            placeholder="例: 短毛・剛毛・乾燥"
            value={hairCondition}
            onChange={(e) => setHairCondition(e.target.value)}
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>頭皮の状態</label>
          <textarea
            placeholder="例: やや乾燥、敏感"
            value={scalpCondition}
            onChange={(e) => setScalpCondition(e.target.value)}
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>アレルギー情報(任意)</label>
          <textarea
            placeholder="例: PPDA系アレルギー、ブリーチNG"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>施術メモ</label>
          <textarea
            placeholder="例: サイドそのまま、後ろ短く"
            value={treatmentNote}
            onChange={(e) => setTreatmentNote(e.target.value)}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>次回提案(任意)</label>
          <input
            type="text"
            placeholder="例: 6週間後の同メニュー"
            value={nextSuggestion}
            onChange={(e) => setNextSuggestion(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 8,
            border: 'none',
            background: saving ? '#E0D8D0' : '#1A1018',
            color: '#fff',
            fontSize: 15,
            fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer',
            marginTop: 12,
          }}
        >
          {saving ? '保存中... (AI生成も実行中)' : 'カルテを保存'}
        </button>

        <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: 12 }}>
          保存後、AI が自動でサマリー・注意を生成します
        </p>
      </div>
    </div>
  )
}
