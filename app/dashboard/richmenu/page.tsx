'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Template = 'standard' | 'minimal'
type Action = 'url' | 'postback'

interface Button {
  label: string
  action: Action
  url: string
  postbackData?: string
}

export default function RichMenuPage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [template, setTemplate] = useState<Template>('standard')
  const [buttons, setButtons] = useState<Button[]>(
    Array(6).fill(null).map(() => ({ label: '', action: 'url', url: '' }))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

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

      // リッチメニュー設定取得
      const { data: lineAccount } = await supabase
        .from('line_accounts')
        .select('richmenu_config')
        .eq('salon_id', salon.id)
        .maybeSingle()

      if (lineAccount?.richmenu_config) {
        const config = lineAccount.richmenu_config
        if (config.template) setTemplate(config.template)
        if (config.buttons) setButtons(config.buttons)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const handleButtonChange = (index: number, field: keyof Button, value: any) => {
    const newButtons = [...buttons]
    newButtons[index] = { ...newButtons[index], [field]: value }
    setButtons(newButtons)
  }

  const handleSave = async () => {
    if (!salonId) return

    // バリデーション
    const filledButtons = buttons.filter(b => b.label.trim())
    if (filledButtons.length === 0) {
      setMessage({ ok: false, text: 'ボタンを少なくとも1つ設定してください' })
      return
    }

    setSaving(true)
    setMessage(null)

    const supabase = await createClient()

    const { error } = await supabase
      .from('line_accounts')
      .update({
        richmenu_config: {
          template,
          buttons: filledButtons,
          updated_at: new Date().toISOString(),
        },
      })
      .eq('salon_id', salonId)

    setSaving(false)
    if (error) {
      setMessage({ ok: false, text: `エラー: ${error.message}` })
    } else {
      setMessage({ ok: true, text: 'リッチメニュー設定を保存しました' })
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>読み込み中...</p>
      </div>
    )
  }

  const filledButtons = buttons.filter(b => b.label.trim())
  const maxButtons = template === 'standard' ? 6 : 4

  return (
    <main style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', marginBottom: 32 }}>
        LINEリッチメニュー
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* 設定パネル */}
        <div>
          {/* テンプレート選択 */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 16 }}>
              テンプレート選択
            </h2>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['standard', 'minimal'] as Template[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 8,
                    border: template === t ? 'none' : '1px solid #E0D8D0',
                    background: template === t ? '#1A1018' : '#fff',
                    color: template === t ? '#FAF6EE' : '#1A1018',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t === 'standard' ? 'スタンダード (6個)' : 'ミニマル (4個)'}
                </button>
              ))}
            </div>
          </div>

          {/* ボタン設定 */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 16 }}>
              ボタン設定
            </h2>

            {buttons.slice(0, maxButtons).map((button, index) => (
              <div
                key={index}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  border: '1px solid #E0D8D0',
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 500, color: '#888', margin: '0 0 12px 0' }}>
                  ボタン {index + 1}
                </p>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 6 }}>
                    ラベル
                  </label>
                  <input
                    type="text"
                    value={button.label}
                    onChange={(e) => handleButtonChange(index, 'label', e.target.value)}
                    placeholder="例：予約する"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #E0D8D0',
                      fontSize: 12,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 6 }}>
                    アクション
                  </label>
                  <select
                    value={button.action}
                    onChange={(e) => handleButtonChange(index, 'action', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #E0D8D0',
                      fontSize: 12,
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="url">URL を開く</option>
                    <option value="postback">ポストバック</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 6 }}>
                    {button.action === 'url' ? 'URL' : 'ポストバックデータ'}
                  </label>
                  <input
                    type="text"
                    value={button.action === 'url' ? button.url : button.postbackData || ''}
                    onChange={(e) => {
                      if (button.action === 'url') {
                        handleButtonChange(index, 'url', e.target.value)
                      } else {
                        handleButtonChange(index, 'postbackData', e.target.value)
                      }
                    }}
                    placeholder={button.action === 'url' ? 'https://...' : 'action=...'}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #E0D8D0',
                      fontSize: 12,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            disabled={saving || filledButtons.length === 0}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: (saving || filledButtons.length === 0) ? '#E0D8D0' : '#1A1018',
              color: (saving || filledButtons.length === 0) ? '#999' : '#FAF6EE',
              fontSize: 14,
              fontWeight: 500,
              cursor: (saving || filledButtons.length === 0) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {saving ? '保存中...' : '適用'}
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
        </div>

        {/* プレビュー */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 16 }}>
            プレビュー
          </h2>

          <div
            style={{
              background: '#000',
              borderRadius: 12,
              padding: 12,
              aspectRatio: '9 / 16',
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 300,
              margin: '0 auto',
            }}
          >
            {/* スマートフォン画面 */}
            <div
              style={{
                flex: 1,
                background: '#fff',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                padding: 12,
                overflow: 'auto',
              }}
            >
              <div style={{ flex: 1, marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>
                  トーク画面
                </p>
                <div style={{
                  background: '#F0F0F0',
                  borderRadius: 4,
                  padding: 8,
                  fontSize: 10,
                  color: '#666',
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  メッセージ表示エリア
                </div>
              </div>

              {/* リッチメニュー */}
              <div
                style={{
                  background: '#F8F8F8',
                  borderRadius: 4,
                  padding: 4,
                  border: '1px solid #E0E0E0',
                  display: 'grid',
                  gridTemplateColumns: `repeat(${template === 'standard' ? 3 : 2}, 1fr)`,
                  gap: 4,
                }}
              >
                {filledButtons.slice(0, maxButtons).map((button, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#1A1018',
                      color: '#FAF6EE',
                      borderRadius: 3,
                      padding: 4,
                      textAlign: 'center',
                      fontSize: 8,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 30,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {button.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: '#E8DCD0', borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: '#1A1018', margin: 0, fontWeight: 500, marginBottom: 4 }}>
              📌 注意事項
            </p>
            <ul style={{ fontSize: 10, color: '#666', margin: '4px 0 0 0', paddingLeft: 16, lineHeight: 1.6 }}>
              <li>ラベルは最大20文字</li>
              <li>URL は https:// または http:// から始まる</li>
              <li>リッチメニューはLINE公式アカウント連携後に表示</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
