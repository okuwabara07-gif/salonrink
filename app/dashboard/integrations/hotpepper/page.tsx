'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HotpepperPage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [integration, setIntegration] = useState<any>(null)
  const [credentialsExist, setCredentialsExist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    shop_name?: string
  } | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    menu_mapping: 'auto',
  })

  useEffect(() => {
    async function loadData() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // サロン情報取得
      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle()

      if (!salon) {
        setLoading(false)
        return
      }

      setSalonId(salon.id)

      // HPB連携情報取得
      const { data: integrationData } = await supabase
        .from('hpb_integrations')
        .select('*')
        .eq('salon_id', salon.id)
        .maybeSingle()

      if (integrationData) {
        setIntegration(integrationData)
        setFormData(prev => ({
          ...prev,
          menu_mapping: integrationData.menu_mapping?.[0]?.type || 'auto',
        }))
      }

      // 認証情報の有無を確認
      const { data: credentials } = await supabase
        .from('salon_hpb_credentials')
        .select('id')
        .eq('salon_id', salon.id)
        .maybeSingle()

      if (credentials) {
        setCredentialsExist(true)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTest = async () => {
    if (!formData.username || !formData.password) {
      setTestResult({ success: false, message: 'ログインID とパスワードを入力してください' })
      return
    }

    setTestLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/hpb/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hpb_login_id: formData.username,
          hpb_password: formData.password,
          hpb_salon_id: salonId,
        }),
      })

      const data = await response.json()
      setTestResult({
        success: data.success,
        message: data.message,
        shop_name: data.shop_name,
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: 'テスト実行中にエラーが発生しました',
      })
    } finally {
      setTestLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salonId) return

    setSaving(true)
    setMessage(null)

    try {
      // SALON BOARD 認証情報を保存
      const credResponse = await fetch('/api/salons/hpb-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hpb_login_id: formData.username,
          hpb_password: formData.password,
          hpb_salon_id: salonId,
        }),
      })

      if (!credResponse.ok) {
        const error = await credResponse.json()
        setMessage({ ok: false, text: `エラー: ${error.error}` })
        setSaving(false)
        return
      }

      setCredentialsExist(true)

      // HPB連携情報を更新
      const supabase = await createClient()
      const { error } = await supabase
        .from('hpb_integrations')
        .upsert({
          salon_id: salonId,
          menu_mapping: [{ type: formData.menu_mapping }],
          active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'salon_id' })

      setSaving(false)
      if (error) {
        setMessage({ ok: false, text: `エラー: ${error.message}` })
      } else {
        setMessage({ ok: true, text: '保存しました' })
        setFormData(prev => ({
          ...prev,
          username: '',
          password: '',
        }))
      }
    } catch (error) {
      setMessage({ ok: false, text: 'エラーが発生しました' })
      setSaving(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/hpb/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ ok: false, text: `同期エラー: ${data.error || '不明なエラー'}` })
        setSyncing(false)
        return
      }

      setMessage({ ok: true, text: '同期を開始しました。完了までお待ちください...' })

      // Refresh integration data after a delay
      setTimeout(async () => {
        const supabase = await createClient()
        const { data: integrationData } = await supabase
          .from('hpb_integrations')
          .select('*')
          .eq('salon_id', salonId)
          .maybeSingle()

        if (integrationData) {
          setIntegration(integrationData)
        }
        setSyncing(false)
      }, 2000)
    } catch (error) {
      setMessage({ ok: false, text: 'エラーが発生しました' })
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <main style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', marginBottom: 32 }}>
        ホットペッパー連携
      </h1>

      <form onSubmit={handleSave} style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      }}>
        {/* SALON BOARD ログインID */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 8 }}>
            SALON BOARD ログインID
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
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

        {/* SALON BOARD パスワード */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 8 }}>
            SALON BOARD パスワード
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
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

        {/* テスト結果表示 */}
        {testResult ? (
          <div style={{
            background: testResult.success ? '#EFF6FF' : '#FEF2F2',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            border: `1px solid ${testResult.success ? '#BFDBFE' : '#FECACA'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 18 }}>
                {testResult.success ? '✅' : '❌'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: testResult.success ? '#1E3A8A' : '#991B1B',
                  margin: '0 0 6px 0',
                }}>
                  {testResult.success ? '接続成功' : `失敗: ${testResult.message}`}
                </p>
                {testResult.shop_name && (
                  <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px 0' }}>
                    店舗: {testResult.shop_name}
                  </p>
                )}
                {!testResult.success && (
                  <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
                    設定を保存できますが、同期は機能しません
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#FFFBEB',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            border: '1px solid #FEF3C7',
          }}>
            <p style={{ fontSize: 13, color: '#78350F', margin: 0 }}>
              ℹ️ 接続テストをまだ実行していません。先に接続テストを推奨します。
            </p>
          </div>
        )}

        {/* 同期状態 */}
        {integration && (
          <div style={{
            background: '#F5F1EC',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
                最終同期
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                {integration.last_synced_at
                  ? new Date(integration.last_synced_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  : '未同期'}
              </p>
            </div>
            {integration.last_sync_error && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: '#A32D2D', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px 0' }}>
                  最終エラー
                </p>
                <p style={{ fontSize: 12, color: '#A32D2D', margin: 0 }}>
                  {integration.last_sync_error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* メニュー連動設定 */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 8 }}>
            メニュー連動設定
          </label>
          <select
            name="menu_mapping"
            value={formData.menu_mapping}
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
            <option value="auto">自動マッピング（推奨）</option>
            <option value="manual">手動マッピング</option>
            <option value="none">マッピングなし</option>
          </select>
          <p style={{ fontSize: 11, color: '#888', margin: '8px 0 0 0' }}>
            ホットペッパーのメニュー名と SalonRink のメニューをどのように対応させるか選択します
          </p>
        </div>

        {/* ボタン */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            type="button"
            onClick={handleTest}
            disabled={testLoading || !formData.username || !formData.password}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: testLoading || !formData.username || !formData.password ? '#E5E7EB' : '#F3F4F6',
              color: testLoading || !formData.username || !formData.password ? '#9CA3AF' : '#4B5563',
              fontSize: 14,
              fontWeight: 500,
              cursor: (testLoading || !formData.username || !formData.password) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {testLoading ? 'テスト中...' : '接続テスト'}
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: saving ? '#E0D8D0' : '#1A1018',
              color: saving ? '#999' : '#FAF6EE',
              fontSize: 14,
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {saving ? '保存中...' : '保存'}
          </button>

          <button
            type="button"
            onClick={handleSync}
            disabled={syncing || !credentialsExist}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 10,
              border: '1px solid #B8966A',
              background: 'transparent',
              color: '#B8966A',
              fontSize: 14,
              fontWeight: 500,
              cursor: (syncing || !credentialsExist) ? 'not-allowed' : 'pointer',
              opacity: (syncing || !credentialsExist) ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {syncing ? '同期中...' : '手動同期'}
          </button>
        </div>

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

      {/* ご利用上の注意 */}
      <div style={{
        background: '#E8DCD0',
        borderRadius: 12,
        padding: 20,
        marginTop: 24,
      }}>
        <p style={{ fontSize: 12, color: '#1A1018', margin: '0 0 8px 0', fontWeight: 500 }}>
          📌 ご利用上の注意
        </p>
        <ul style={{ fontSize: 12, color: '#666', margin: '0', paddingLeft: 20, lineHeight: 1.8 }}>
          <li style={{ marginBottom: 6 }}>
            SALON BOARD の利用規約上、自動取得による連携は推奨されていません
          </li>
          <li style={{ marginBottom: 6 }}>
            1時間ごとに自動同期されます
          </li>
          <li style={{ marginBottom: 6 }}>
            認証情報はAES-256-GCMで暗号化して保存されます
          </li>
          <li>
            Cookie変更時は再度ログイン情報を登録してください
          </li>
        </ul>
      </div>
    </main>
  )
}
