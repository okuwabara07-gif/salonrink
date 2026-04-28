'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LineOfficialAccountPage() {
  const [salonId, setSalonId] = useState<string | null>(null)
  const [lineAccount, setLineAccount] = useState<any>(null)
  const [credentialsExist, setCredentialsExist] = useState(false)
  const [linkedCount, setLinkedCount] = useState(0)
  const [recentLinks, setRecentLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showCreateGuide, setShowCreateGuide] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [formData, setFormData] = useState({
    channel_id: '',
    channel_access_token: '',
    channel_secret: '',
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

      // LINE連携情報取得
      const { data: lineData } = await supabase
        .from('line_accounts')
        .select('*')
        .eq('salon_id', salon.id)
        .maybeSingle()

      setLineAccount(lineData)

      // 認証情報の有無を確認
      if (lineData?.channel_access_token_enc) {
        setCredentialsExist(true)
      }

      // 紐付き顧客数
      const { count } = await supabase
        .from('line_customer_links')
        .select('id', { count: 'exact' })
        .eq('salon_id', salon.id)

      setLinkedCount(count || 0)

      // 直近紐付き一覧（3件）
      const { data: links } = await supabase
        .from('line_customer_links')
        .select('id, line_user_id, customer_id, linked_at, customers(name)')
        .eq('salon_id', salon.id)
        .order('linked_at', { ascending: false })
        .limit(3)

      setRecentLinks(links || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTestConnection = async () => {
    if (!formData.channel_access_token) {
      setMessage({ ok: false, text: 'Channel Access Token を入力してください' })
      return
    }

    setTesting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/line/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_access_token: formData.channel_access_token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ ok: false, text: `接続テスト失敗: ${data.error}` })
        setTesting(false)
        return
      }

      setMessage({
        ok: true,
        text: `接続成功: ${data.bot_info.display_name} (${data.bot_info.user_id})`,
      })
    } catch (error) {
      setMessage({ ok: false, text: 'エラーが発生しました' })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salonId) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/salons/line-credentials', {
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

      setCredentialsExist(true)
      setMessage({ ok: true, text: '保存しました' })
      setFormData(prev => ({
        ...prev,
        channel_access_token: '',
        channel_secret: '',
      }))

      // データ再読み込み
      const supabase = await createClient()
      const { data: lineData } = await supabase
        .from('line_accounts')
        .select('*')
        .eq('salon_id', salonId)
        .maybeSingle()

      if (lineData) {
        setLineAccount(lineData)
      }
    } catch (error) {
      setMessage({ ok: false, text: 'エラーが発生しました' })
    } finally {
      setSaving(false)
    }
  }

  const handleCopyWebhookUrl = () => {
    if (salonId) {
      const webhookUrl = `https://salonrink.com/api/line/webhook/${salonId}`
      navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const scrollToForm = () => {
    const formElement = document.getElementById('credentials-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' })
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
        LINE公式アカウント連携
      </h1>

      {/* LINE公式アカウント保有確認セクション */}
      <div style={{
        background: '#FFF3F0',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        marginBottom: 32,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 12 }}>
          LINE公式アカウントをお持ちですか?
        </h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
          LINE公式アカウントは、個人LINEとは別の、ビジネス用LINEアカウントです。無料で作成でき、お客様への一斉メッセージや予約管理に使えます。
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            onClick={scrollToForm}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: '#1A1018',
              color: '#FAF6EE',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            ✅ 持っている
          </button>

          <button
            onClick={() => setShowCreateGuide(!showCreateGuide)}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 10,
              border: '1px solid #B8966A',
              background: 'transparent',
              color: '#B8966A',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#B8966A'
              e.currentTarget.style.color = '#FAF6EE'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#B8966A'
            }}
          >
            📱 まだ持っていない
          </button>
        </div>

        <div style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>⏰ 全体の所要時間: 約10-15分</p>
          <p style={{ margin: '4px 0 0 0' }}>💰 完全無料で開始できます</p>
        </div>
      </div>

      {/* LINE公式アカウントの作成ガイド */}
      {showCreateGuide && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 24 }}>
            📱 LINE公式アカウントの作り方
          </h2>

          {/* ステップ1 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#B8966A',
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                1
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1018', margin: '0 0 8px 0' }}>
                  📱 スマホで LINE Official Account Manager を開く
                  <span style={{ fontSize: 12, color: '#888', fontWeight: 400, marginLeft: 8 }}>（約5分）</span>
                </p>
                <ul style={{ fontSize: 13, color: '#666', margin: '0 0 8px 0', paddingLeft: 16 }}>
                  <li style={{ marginBottom: 4 }}>
                    <a href="https://www.lycbiz.com/jp/service/line-official-account/" target="_blank" rel="noopener noreferrer"
                      style={{ color: '#B8966A', textDecoration: 'none', fontWeight: 500 }}>
                      LINE Official Account Manager
                    </a>
                    にアクセスしてください
                  </li>
                  <li style={{ marginBottom: 4 }}>「アカウント開設」をタップ</li>
                  <li style={{ marginBottom: 4 }}>メールアドレスで登録</li>
                  <li style={{ marginBottom: 4 }}>アカウント名（例: ○○美容室、ハナヘアサロン）を入力</li>
                  <li>業種「美容・サロン」を選択</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ステップ2 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#B8966A',
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                2
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1018', margin: '0 0 8px 0' }}>
                  💰 無料プランを選択
                  <span style={{ fontSize: 12, color: '#888', fontWeight: 400, marginLeft: 8 }}>（0円スタート）</span>
                </p>
                <ul style={{ fontSize: 13, color: '#666', margin: '0 0 8px 0', paddingLeft: 16 }}>
                  <li style={{ marginBottom: 4 }}>「コミュニケーションプラン」を選択（月200通まで無料）</li>
                  <li>200通を超える場合は有料プランも検討可能</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ステップ3 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#B8966A',
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                3
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1018', margin: '0 0 8px 0' }}>
                  🔧 Messaging API を有効化
                  <span style={{ fontSize: 12, color: '#888', fontWeight: 400, marginLeft: 8 }}>（約3分）</span>
                </p>
                <ul style={{ fontSize: 13, color: '#666', margin: '0 0 8px 0', paddingLeft: 16 }}>
                  <li style={{ marginBottom: 4 }}>
                    <a href="https://developers.line.biz" target="_blank" rel="noopener noreferrer"
                      style={{ color: '#B8966A', textDecoration: 'none', fontWeight: 500 }}>
                      LINE Developers Console
                    </a>
                    にアクセス
                  </li>
                  <li style={{ marginBottom: 4 }}>同じメールアドレスでログイン</li>
                  <li style={{ marginBottom: 4 }}>プロバイダー作成 → Messaging API Channel を選択</li>
                  <li>チャネル名・説明を入力</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ステップ4 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#B8966A',
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                4
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1018', margin: '0 0 8px 0' }}>
                  🔑 認証情報を取得
                  <span style={{ fontSize: 12, color: '#888', fontWeight: 400, marginLeft: 8 }}>（約2分）</span>
                </p>
                <ul style={{ fontSize: 13, color: '#666', margin: '0 0 8px 0', paddingLeft: 16 }}>
                  <li style={{ marginBottom: 4 }}>「Channel基本情報」タブで「Channel ID」と「Channel Secret」を確認</li>
                  <li>「Messaging API設定」タブで「Channel Access Token」を発行</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ステップ5 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#B8966A',
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                5
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1018', margin: '0 0 8px 0' }}>
                  ✅ SalonRink に保存
                  <span style={{ fontSize: 12, color: '#888', fontWeight: 400, marginLeft: 8 }}>（完了）</span>
                </p>
                <ul style={{ fontSize: 13, color: '#666', margin: '0 0 8px 0', paddingLeft: 16 }}>
                  <li style={{ marginBottom: 4 }}>下のフォームに3つの値を貼り付け</li>
                  <li>「保存」ボタンをクリック</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => scrollToForm()}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: '#1A1018',
              color: '#FAF6EE',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: 16,
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            認証情報を入力フォームへ
          </button>
        </div>
      )}

      {/* 認証情報入力フォーム */}
      <form onSubmit={handleSave} style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        marginBottom: 24,
      }} id="credentials-form">
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 20 }}>
          {credentialsExist ? '認証情報（更新）' : 'LINE 認証情報'}
        </h2>

        {/* Channel ID */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 8 }}>
            Channel ID
          </label>
          <input
            type="text"
            name="channel_id"
            value={formData.channel_id}
            onChange={handleChange}
            placeholder="例: 1234567890"
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
            LINE Developers の「Channel基本情報」から確認できます
          </p>
        </div>

        {/* Channel Access Token */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 8 }}>
            Channel Access Token
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showToken ? 'text' : 'password'}
              name="channel_access_token"
              value={formData.channel_access_token}
              onChange={handleChange}
              placeholder="Messaging API設定から発行したトークン"
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
              onClick={() => setShowToken(!showToken)}
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
              {showToken ? '非表示' : '表示'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#888', margin: '8px 0 0 0' }}>
            AES-256-GCMで暗号化されて保存されます
          </p>
        </div>

        {/* Channel Secret */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 8 }}>
            Channel Secret
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showSecret ? 'text' : 'password'}
              name="channel_secret"
              value={formData.channel_secret}
              onChange={handleChange}
              placeholder="Channel基本情報から確認したシークレット"
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
              onClick={() => setShowSecret(!showSecret)}
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
              {showSecret ? '非表示' : '表示'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#888', margin: '8px 0 0 0' }}>
            AES-256-GCMで暗号化されて保存されます
          </p>
        </div>

        {/* ボタン */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 10,
              border: '1px solid #B8966A',
              background: 'transparent',
              color: '#B8966A',
              fontSize: 14,
              fontWeight: 500,
              cursor: testing ? 'not-allowed' : 'pointer',
              opacity: testing ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {testing ? '接続テスト中...' : '接続テスト'}
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

      {/* Webhook URL 表示（認証情報保存済みの場合のみ） */}
      {credentialsExist && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 20 }}>
            Webhook URL
          </h2>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
            LINE Developers Console の Webhook URL 設定にこの値を貼り付けてください
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <code style={{
              flex: 1,
              fontSize: 12,
              fontFamily: 'monospace',
              background: '#F5F1EC',
              padding: '12px 16px',
              borderRadius: 8,
              overflow: 'auto',
              wordBreak: 'break-all',
              color: '#1A1018',
            }}>
              https://salonrink.com/api/line/webhook/{salonId}
            </code>
            <button
              onClick={handleCopyWebhookUrl}
              style={{
                padding: '10px 16px',
                fontSize: 12,
                border: '1px solid #B8966A',
                background: 'transparent',
                color: '#B8966A',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#B8966A'
                e.currentTarget.style.color = '#FAF6EE'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#B8966A'
              }}
            >
              {copied ? 'コピーしました' : '📋 コピー'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
            このURLは秘密ではないので、第三者に見られても問題ありません
          </p>
        </div>
      )}

      {/* ご利用上の注意 */}
      <div style={{
        background: '#E8DCD0',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}>
        <p style={{ fontSize: 12, color: '#1A1018', margin: '0 0 8px 0', fontWeight: 500 }}>
          📌 ご利用上の注意
        </p>
        <ul style={{ fontSize: 12, color: '#666', margin: '0', paddingLeft: 20, lineHeight: 1.8 }}>
          <li style={{ marginBottom: 6 }}>
            LINE公式アカウントの利用規約に従ってください
          </li>
          <li style={{ marginBottom: 6 }}>
            Channel Access Token は秘密情報です。第三者と共有しないでください
          </li>
          <li style={{ marginBottom: 6 }}>
            保存後、LINE Developers Console で Webhook URL の設定が必要です
          </li>
          <li>
            Channel Access Token を再発行した場合は、ここで再度保存してください
          </li>
        </ul>
      </div>

      {/* 紐付き顧客情報 */}
      {credentialsExist && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#1A1018', marginBottom: 20 }}>
            紐付き顧客
          </h2>

          {/* 統計 */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>
              紐付き顧客数
            </p>
            <p style={{ fontSize: 28, fontWeight: 300, color: '#1A1018', margin: 0 }}>
              {linkedCount}
            </p>
          </div>

          {/* 直近紐付き一覧 */}
          {recentLinks.length > 0 ? (
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                直近紐付き（3件）
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {recentLinks.map((link, i) => (
                  <li
                    key={link.id}
                    style={{
                      padding: '12px 0',
                      borderBottom: i < recentLinks.length - 1 ? '1px solid #F0EAE3' : 'none',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ color: '#1A1018', fontWeight: 500, marginBottom: 4 }}>
                      {(link.customers as any)?.name || 'ユーザー'}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {new Date(link.linked_at).toLocaleDateString('ja-JP')}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '20px' }}>
              紐付き顧客はまだいません
            </p>
          )}
        </div>
      )}
    </main>
  )
}
