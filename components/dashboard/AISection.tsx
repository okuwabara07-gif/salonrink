'use client'
import { useState } from 'react'

interface AISectionProps {
  karte: any
  customerId: string
  salonId: string
  karteId: string
  onRefresh?: () => void
}

// AIWarningsSection
export function AIWarningsSection({ karte, customerId, salonId, karteId, onRefresh }: AISectionProps) {
  const [loading, setLoading] = useState(false)
  const [localWarnings, setLocalWarnings] = useState(karte?.ai_warnings)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/allergy-warning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, salon_id: salonId, karte_id: karteId }),
      })
      if (!res.ok) throw new Error('Failed to generate warnings')
      const data = await res.json()
      setLocalWarnings(data.warnings)
      onRefresh?.()
    } catch (error) {
      alert('エラー: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#A32D2D'
      case 'medium': return '#D97706'
      case 'low': return '#059669'
      default: return '#888'
    }
  }

  return (
    <div style={{
      background: '#fff5f5',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      marginBottom: 24,
      borderLeft: `4px solid #A32D2D`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#A32D2D', margin: 0 }}>
          ⚠️ AI警告・注意事項
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: loading ? '#E0D8D0' : '#A32D2D',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '生成中...' : localWarnings ? '再生成' : '生成'}
        </button>
      </div>

      {localWarnings ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
              リスクレベル
            </p>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 4,
              background: getRiskColor(localWarnings.risk_level),
              color: '#fff',
              fontSize: 12,
              fontWeight: 500,
            }}>
              {localWarnings.risk_level?.toUpperCase() || 'N/A'}
            </span>
          </div>

          {localWarnings.allergy_warnings?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                アレルギー警告
              </p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {localWarnings.allergy_warnings.map((w: string, i: number) => (
                  <li key={i} style={{ fontSize: 13, color: '#1A1018', marginBottom: 4 }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {localWarnings.damage_alerts?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                ダメージ警告
              </p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {localWarnings.damage_alerts.map((w: string, i: number) => (
                  <li key={i} style={{ fontSize: 13, color: '#1A1018', marginBottom: 4 }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {localWarnings.recommended_action && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                推奨対応
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0, lineHeight: 1.6 }}>
                {localWarnings.recommended_action}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>まだ生成されていません</p>
      )}
    </div>
  )
}

// AISummarySection
export function AISummarySection({ karte, customerId, salonId, karteId, onRefresh }: AISectionProps) {
  const [loading, setLoading] = useState(false)
  const [localSummary, setLocalSummary] = useState(karte?.ai_summary)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/customer-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, salon_id: salonId, karte_id: karteId }),
      })
      if (!res.ok) throw new Error('Failed to generate summary')
      const data = await res.json()
      setLocalSummary(data.summary)
      onRefresh?.()
    } catch (error) {
      alert('エラー: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#f9f7f4',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      marginBottom: 24,
      borderLeft: `4px solid #888`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1018', margin: 0 }}>
          📋 AI顧客サマリー
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: loading ? '#E0D8D0' : '#1A1018',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '生成中...' : localSummary ? '再生成' : '生成'}
        </button>
      </div>

      {localSummary ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {localSummary.summary && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                サマリー
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0, lineHeight: 1.6 }}>
                {localSummary.summary}
              </p>
            </div>
          )}

          {localSummary.hair_condition_analysis && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                髪の状態分析
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0, lineHeight: 1.6 }}>
                {localSummary.hair_condition_analysis}
              </p>
            </div>
          )}

          {localSummary.recommended_care && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                推奨ケア
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0, lineHeight: 1.6 }}>
                {localSummary.recommended_care}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>まだ生成されていません</p>
      )}
    </div>
  )
}

// CommunicationScriptSection
export function CommunicationScriptSection({ karte, customerId, salonId, karteId, onRefresh }: AISectionProps) {
  const [loading, setLoading] = useState(false)
  const [plannedMenu, setPlannedMenu] = useState('')
  const [localScript, setLocalScript] = useState(karte?.ai_communication_scripts)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/communication-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          salon_id: salonId,
          karte_id: karteId,
          planned_menu: plannedMenu || karte?.menu_name || 'カット',
        }),
      })
      if (!res.ok) throw new Error('Failed to generate script')
      const data = await res.json()
      setLocalScript(data.script)
      onRefresh?.()
    } catch (error) {
      alert('エラー: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#f3e8ff',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      marginBottom: 24,
      borderLeft: `4px solid #7c3aed`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#7c3aed', margin: 0 }}>
          💬 AI接客スクリプト
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: loading ? '#E0D8D0' : '#7c3aed',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '生成中...' : localScript ? '再生成' : '生成'}
        </button>
      </div>

      {localScript ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {localScript.pre_service && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                施術前カウンセリング
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0, lineHeight: 1.6 }}>
                {localScript.pre_service}
              </p>
            </div>
          )}

          {localScript.confirmation_checklist?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                確認チェックリスト
              </p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {localScript.confirmation_checklist.map((item: string, i: number) => (
                  <li key={i} style={{ fontSize: 13, color: '#1A1018', marginBottom: 4 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {localScript.homecare_advice && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                ホームケアアドバイス
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0, lineHeight: 1.6 }}>
                {localScript.homecare_advice}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="施術メニュー（例：カット、カラー）"
            value={plannedMenu}
            onChange={(e) => setPlannedMenu(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #D8BFD8',
              fontSize: 13,
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>メニューを入力して生成を開始します</p>
        </div>
      )}
    </div>
  )
}

// NextRecommendationSection
export function NextRecommendationSection({ karte, customerId, salonId, karteId, onRefresh }: AISectionProps) {
  const [loading, setLoading] = useState(false)
  const [currentMenu, setCurrentMenu] = useState('')
  const [localRecommendation, setLocalRecommendation] = useState(karte?.ai_next_recommendation)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/next-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          salon_id: salonId,
          karte_id: karteId,
          current_menu: currentMenu || karte?.menu_name || 'カット',
        }),
      })
      if (!res.ok) throw new Error('Failed to generate recommendation')
      const data = await res.json()
      setLocalRecommendation(data.recommendation)
      onRefresh?.()
    } catch (error) {
      alert('エラー: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#f0fdf4',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      marginBottom: 24,
      borderLeft: `4px solid #059669`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#059669', margin: 0 }}>
          🎯 AI次回提案
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: loading ? '#E0D8D0' : '#059669',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '生成中...' : localRecommendation ? '再生成' : '生成'}
        </button>
      </div>

      {localRecommendation ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {localRecommendation.next_visit_date && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                次回来店推奨日
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#059669', margin: 0 }}>
                {new Date(localRecommendation.next_visit_date).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}

          {localRecommendation.recommended_menu && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                推奨メニュー
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                {localRecommendation.recommended_menu}
              </p>
            </div>
          )}

          {localRecommendation.reasoning && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                推奨理由
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0, lineHeight: 1.6 }}>
                {localRecommendation.reasoning}
              </p>
            </div>
          )}

          {localRecommendation.homecare_duration && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                ホームケア推奨期間
              </p>
              <p style={{ fontSize: 13, color: '#1A1018', margin: 0 }}>
                {localRecommendation.homecare_duration}日間
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="今回の施術メニュー（例：カット、カラー）"
            value={currentMenu}
            onChange={(e) => setCurrentMenu(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #D1D5DB',
              fontSize: 13,
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>メニューを入力して生成を開始します</p>
        </div>
      )}
    </div>
  )
}
