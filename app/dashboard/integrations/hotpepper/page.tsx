'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HotpepperPage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [integration, setIntegration] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [formData, setFormData] = useState({
    ical_url: '',
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
        setFormData({
          ical_url: integrationData.ical_url || '',
          menu_mapping: integrationData.menu_mapping?.[0]?.type || 'auto',
        })
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salonId) return

    setSaving(true)
    setMessage(null)

    const supabase = await createClient()

    // iCal URLの検証
    const trimmedUrl = formData.ical_url.trim()
    if (trimmedUrl && !/^(webcal|https?):\/\//.test(trimmedUrl)) {
      setMessage({ ok: false, text: 'webcal:// または https:// で始まるURLを入力してください' })
      setSaving(false)
      return
    }

    // 更新または作成
    const { error } = await supabase
      .from('hpb_integrations')
      .upsert({
        salon_id: salonId,
        ical_url: trimmedUrl,
        menu_mapping: [{ type: formData.menu_mapping }],
        active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'salon_id' })

    setSaving(false)
    if (error) {
      setMessage({ ok: false, text: `エラー: ${error.message}` })
    } else {
      setMessage({ ok: true, text: '保存しました' })
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
        {/* iCal URL */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 8 }}>
            iCal URL
          </label>
          <input
            type="text"
            name="ical_url"
            value={formData.ical_url}
            onChange={handleChange}
            placeholder="webcal://... または https://..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #E0D8D0',
              fontSize: 14,
              boxSizing: 'border-box',
              fontFamily: 'monospace',
              marginBottom: 8,
            }}
          />
          <p style={{ fontSize: 11, color: '#888', margin: '8px 0 0 0' }}>
            ホットペッパーのカレンダーから取得した iCal URL を貼り付けてください
          </p>
        </div>

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
            disabled={syncing || !formData.ical_url}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 10,
              border: '1px solid #B8966A',
              background: 'transparent',
              color: '#B8966A',
              fontSize: 14,
              fontWeight: 500,
              cursor: (syncing || !formData.ical_url) ? 'not-allowed' : 'pointer',
              opacity: (syncing || !formData.ical_url) ? 0.5 : 1,
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

      {/* ヘルプテキスト */}
      <div style={{
        background: '#E8DCD0',
        borderRadius: 12,
        padding: 20,
        marginTop: 24,
      }}>
        <p style={{ fontSize: 12, color: '#1A1018', margin: '0 0 8px 0', fontWeight: 500 }}>
          📌 iCal URL の取得方法
        </p>
        <ol style={{ fontSize: 12, color: '#666', margin: '0', paddingLeft: 20, lineHeight: 1.8 }}>
          <li>ホットペッパー Beauty に登録</li>
          <li>お店の予約カレンダーを開く</li>
          <li>iCal 形式の URL をコピー</li>
          <li>上の入力欄に貼り付け</li>
        </ol>
      </div>
    </main>
  )
}
