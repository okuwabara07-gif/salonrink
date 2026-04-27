'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HpbSetupPage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [credentialsExist, setCredentialsExist] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [formData, setFormData] = useState({
    hpb_login_id: '',
    hpb_password: '',
    hpb_salon_id: '',
  })

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!isMounted) return

        if (!user) {
          setError('ログインが必要です')
          setLoading(false)
          return
        }

        const { data: salon, error: salonError } = await supabase
          .from('salons')
          .select('id')
          .eq('owner_user_id', user.id)
          .maybeSingle()

        if (!isMounted) return

        if (salonError) {
          console.error('Salon query error:', salonError)
          setError('サロン情報の取得に失敗しました')
          setLoading(false)
          return
        }

        if (!salon) {
          setError('サロン情報が見つかりません')
          setLoading(false)
          return
        }

        setSalonId(salon.id)

        const { data: credentials, error: credError } = await supabase
          .from('salon_hpb_credentials')
          .select('*')
          .eq('salon_id', salon.id)
          .maybeSingle()

        if (!isMounted) return

        if (credError) {
          console.error('Credentials query error:', credError)
          // テーブルが存在しない場合は、エラーを無視して続行
          if (credError.code !== 'PGRST116') {
            setError('認証情報の取得に失敗しました')
          }
        }

        if (credentials) {
          setCredentialsExist(true)
          setFormData(prev => ({
            ...prev,
            hpb_salon_id: credentials.hpb_salon_id || '',
          }))
        }

        setLoading(false)
      } catch (err) {
        console.error('Error loading HPB setup data:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salonId) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/salons/hpb-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        setMessage({ ok: false, text: `エラー: ${error.error}` })
        setSaving(false)
        return
      }

      setMessage({ ok: true, text: '保存しました' })
      setCredentialsExist(true)
      setFormData(prev => ({
        ...prev,
        hpb_login_id: '',
        hpb_password: '',
      }))
    } catch (error) {
      setMessage({ ok: false, text: 'エラーが発生しました' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
        <p style={{ color: '#666' }}>読み込み中...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: 4,
          color: '#1A1018',
          marginBottom: 32,
        }}>
          HPB設定
        </h1>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <p style={{
            fontSize: 13,
            color: '#A32D2D',
            textAlign: 'center',
            margin: 0,
          }}>
            エラーが発生しました: {error}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 400,
        letterSpacing: 4,
        color: '#1A1018',
        marginBottom: 32,
      }}>
        HPB設定
        {credentialsExist && (
          <span style={{
            marginLeft: 12,
            fontSize: 12,
            fontWeight: 400,
            color: '#3B6D11',
            backgroundColor: '#f0f5eb',
            padding: '4px 8px',
            borderRadius: 4,
          }}>
            設定済み
          </span>
        )}
      </h1>

      <form onSubmit={handleSave} style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: '#666',
            marginBottom: 8,
          }}>
            HPB（ホットペッパービューティー）ログインID
          </label>
          <input
            type="text"
            name="hpb_login_id"
            value={formData.hpb_login_id}
            onChange={handleChange}
            placeholder="通常、メールアドレス"
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
          <p style={{ fontSize: 11, color: '#888', margin: '8px 0 0 0' }}>
            サロンマネージャーへのログインに使用するIDです
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: '#666',
            marginBottom: 8,
          }}>
            HPB パスワード
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="hpb_password"
              value={formData.hpb_password}
              onChange={handleChange}
              placeholder="パスワード"
              style={{
                width: '100%',
                padding: '12px 14px',
                paddingRight: 40,
                borderRadius: 8,
                border: '1px solid #E0D8D0',
                fontSize: 14,
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                fontSize: 12,
                padding: 4,
              }}
            >
              {showPassword ? '非表示' : '表示'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#888', margin: '8px 0 0 0' }}>
            AES-256-GCMで暗号化されて保存されます
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: '#666',
            marginBottom: 8,
          }}>
            HPB サロンID
          </label>
          <input
            type="text"
            name="hpb_salon_id"
            value={formData.hpb_salon_id}
            onChange={handleChange}
            placeholder="例: H000123456"
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
          <p style={{ fontSize: 11, color: '#888', margin: '8px 0 0 0' }}>
            サロンマネージャーの画面で確認できます
          </p>
        </div>

        {/* 免責事項 */}
        <div style={{
          background: '#FAF6EE',
          border: '1px solid #B8966A',
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          fontSize: 12,
          lineHeight: 1.8,
          color: '#5C3A45',
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>
            ⚠️ 免責事項
          </p>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li style={{ marginBottom: 6 }}>
              15分ごとのデータ取得のため、最大15分のタイムラグが生じます
            </li>
            <li style={{ marginBottom: 6 }}>
              ダブルブッキングのリスクは完全にはゼロになりません
            </li>
            <li style={{ marginBottom: 6 }}>
              同期失敗時はLINE予約を自動停止します（利用規約に準拠）
            </li>
            <li>
              認証情報はAES-256-GCMで暗号化して保存されます
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={saving || !formData.hpb_login_id || !formData.hpb_password || !formData.hpb_salon_id}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border: 'none',
            background: saving || !formData.hpb_login_id || !formData.hpb_password || !formData.hpb_salon_id
              ? '#E0D8D0'
              : '#1A1018',
            color: saving || !formData.hpb_login_id || !formData.hpb_password || !formData.hpb_salon_id
              ? '#999'
              : '#FAF6EE',
            fontSize: 14,
            fontWeight: 500,
            cursor: saving || !formData.hpb_login_id || !formData.hpb_password || !formData.hpb_salon_id
              ? 'not-allowed'
              : 'pointer',
            transition: 'all 0.2s ease',
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
