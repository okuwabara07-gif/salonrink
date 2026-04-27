'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [salon, setSalon] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    phone: '',
    email: '',
    postal_code: '',
    prefecture: '',
    city: '',
    address: '',
  })

  useEffect(() => {
    async function fetchSalon() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('salons')
        .select('*')
        .eq('owner_user_id', user.id)
        .maybeSingle()

      if (data) {
        setSalon(data)
        setFormData({
          name: data.name || '',
          owner_name: data.owner_name || '',
          phone: data.phone || '',
          email: data.email || '',
          postal_code: data.postal_code || '',
          prefecture: data.prefecture || '',
          city: data.city || '',
          address: data.address || '',
        })
      }
      setLoading(false)
    }
    fetchSalon()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage({ ok: false, text: '未ログイン' })
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('salons')
      .update(formData)
      .eq('owner_user_id', user.id)

    setSaving(false)
    if (error) {
      setMessage({ ok: false, text: `エラー: ${error.message}` })
    } else {
      setMessage({ ok: true, text: '保存しました' })
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#888' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <main style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', marginBottom: 32 }}>
        設定
      </h1>

      <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        {/* 基本情報 */}
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 20 }}>
          基本情報
        </h2>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 6 }}>
            サロン名
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E0D8D0',
              fontSize: 14,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 6 }}>
            オーナー名
          </label>
          <input
            type="text"
            name="owner_name"
            value={formData.owner_name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E0D8D0',
              fontSize: 14,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 6 }}>
            電話番号
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E0D8D0',
              fontSize: 14,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 6 }}>
            メールアドレス
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E0D8D0',
              fontSize: 14,
              background: '#f5f5f5',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              cursor: 'not-allowed',
              opacity: 0.6,
            }}
          />
        </div>

        {/* 住所 */}
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 20, marginTop: 32 }}>
          住所
        </h2>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 6 }}>
            郵便番号
          </label>
          <input
            type="text"
            name="postal_code"
            placeholder="000-0000"
            value={formData.postal_code}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E0D8D0',
              fontSize: 14,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 6 }}>
            都道府県
          </label>
          <select
            name="prefecture"
            value={formData.prefecture}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E0D8D0',
              fontSize: 14,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          >
            <option value="">選択してください</option>
            {['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'].map(pref => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 6 }}>
            市区町村
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E0D8D0',
              fontSize: 14,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 6 }}>
            住所
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E0D8D0',
              fontSize: 14,
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* 送信 */}
        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 10,
            border: 'none',
            background: saving ? '#E0D8D0' : '#1A1018',
            color: saving ? '#999' : '#FAF6EE',
            fontSize: 14,
            fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginTop: 20,
          }}
        >
          {saving ? '保存中...' : '保存'}
        </button>

        {message && (
          <p style={{
            marginTop: 16,
            fontSize: 13,
            textAlign: 'center',
            color: message.ok ? '#3B6D11' : '#A32D2D',
          }}>
            {message.text}
          </p>
        )}
      </form>
    </main>
  )
}
