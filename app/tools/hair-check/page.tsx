'use client'

/**
 * app/tools/hair-check/page.tsx
 *
 * 髪質・ダメージ診断 Step 1（質問式クイズ）。
 * - 誰でも登録不要で利用可（PLGの間口）
 * - 質問 → 結果表示 → 「マイカルテに保存(LINE登録)」「相談・予約」CTA
 * - Claudeを呼ばないのでコスト¥0
 *
 * 結果のキーは第一弾 ai_summary と互換（保存時にそのままカルテ化できる）。
 */

import { useState } from 'react'
import { QUESTIONS } from '@/lib/tools/hair-check'

type Result = {
  damage_level: number
  level_name: string
  hair_condition_analysis: string
  recommended_care: string
  concern_tags: string[]
}

const C = {
  rose: '#C24E40',
  gold: '#B08D5E',
  ink: '#2b2622',
  muted: '#6f655d',
  bg: '#faf8f5',
  line: '#ece6df',
}

export default function HairCheckPage() {
  const [step, setStep] = useState(0) // 0..QUESTIONS.length-1 が設問、それ以降は結果
  const [answers, setAnswers] = useState<string[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Step2 写真診断用
  const [photoResult, setPhotoResult] = useState<Result | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const isResult = result !== null
  const total = QUESTIONS.length

  // 画像をbase64化(data URLのprefixを除去)してphoto APIへ
  const onPhotoSelected = async (file: File) => {
    setPhotoError('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('JPEG / PNG / WebP の画像を選んでください')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('画像サイズは5MBまでです')
      return
    }
    setPhotoLoading(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const r = reader.result as string
          resolve(r.split(',')[1] || '')
        }
        reader.onerror = () => reject(new Error('read failed'))
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/tools/hair-check/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64, media_type: file.type }),
      })
      const data = await res.json()
      if (data.result) {
        setPhotoResult(data.result)
        try {
          sessionStorage.setItem('haircheck_result', JSON.stringify(data.result))
        } catch {}
      } else {
        setPhotoError(data.error || '写真診断に失敗しました')
      }
    } catch {
      setPhotoError('通信エラーが発生しました')
    } finally {
      setPhotoLoading(false)
    }
  }

  const choose = async (choiceId: string) => {
    const next = [...answers, choiceId]
    setAnswers(next)
    if (step + 1 < total) {
      setStep(step + 1)
      return
    }
    // 最終問 → 判定APIへ
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/tools/hair-check/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: next }),
      })
      const data = await res.json()
      if (data.result) {
        setResult(data.result)
        // 結果をsessionに保持（LINE登録後の保存用）
        try {
          sessionStorage.setItem('haircheck_result', JSON.stringify(data.result))
        } catch {}
      } else {
        setErrorMsg(data.error || '診断に失敗しました')
      }
    } catch {
      setErrorMsg('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const restart = () => {
    setStep(0)
    setAnswers([])
    setResult(null)
    setErrorMsg('')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: C.gold, fontWeight: 700 }}>
            SALONRINK
          </div>
          <h1 style={{ fontSize: 22, color: C.ink, marginTop: 6, fontWeight: 700 }}>
            髪質・ダメージ診断
          </h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
            5つの質問で今の髪の状態をチェック（無料・登録不要）
          </p>
        </div>

        {loading && <p style={{ textAlign: 'center', color: C.muted }}>診断中...</p>}

        {/* 質問 */}
        {!isResult && !loading && (
          <div>
            {/* 進捗 */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: i <= step ? C.rose : C.line,
                  }}
                />
              ))}
            </div>

            <div style={card}>
              <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, marginBottom: 8 }}>
                質問 {step + 1} / {total}
              </div>
              <p style={{ fontSize: 17, color: C.ink, fontWeight: 700, lineHeight: 1.6, marginBottom: 16 }}>
                {QUESTIONS[step].text}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {QUESTIONS[step].choices.map((ch) => (
                  <button key={ch.id} onClick={() => choose(ch.id)} style={choiceBtn}>
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
            {errorMsg && <p style={{ color: C.rose, fontSize: 13, marginTop: 12 }}>{errorMsg}</p>}
          </div>
        )}

        {/* 結果 */}
        {isResult && result && (
          <div>
            <div style={{ ...card, textAlign: 'center', borderTop: `4px solid ${C.rose}` }}>
              <div style={{ fontSize: 13, color: C.muted }}>あなたの髪は…</div>
              <div style={{ fontSize: 28, color: C.rose, fontWeight: 800, margin: '8px 0' }}>
                {result.level_name}
              </div>
              {result.concern_tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                  {result.concern_tags.map((t) => (
                    <span key={t} style={tag}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            <div style={card}>
              <div style={subLabel}>髪の状態</div>
              <p style={subText}>{result.hair_condition_analysis}</p>
              <div style={{ ...subLabel, marginTop: 14 }}>おすすめのケア</div>
              <p style={subText}>{result.recommended_care}</p>
            </div>

            {/* Step2 写真AI診断 */}
            {!photoResult && (
              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
                  写真でもっと詳しく診断
                </div>
                <p style={{ ...subText, fontSize: 13, marginBottom: 12 }}>
                  髪の写真を1枚アップすると、AIがさらに詳しくチェックします。
                </p>
                <label style={photoBtn}>
                  {photoLoading ? '診断中...' : '写真を選んで診断する'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={photoLoading}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) onPhotoSelected(f)
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
                {photoError && <p style={{ color: C.rose, fontSize: 13, marginTop: 10 }}>{photoError}</p>}
                <p style={{ fontSize: 11, color: '#9a8f85', marginTop: 10, lineHeight: 1.6 }}>
                  ※写真は診断のために使用します。お顔が写らない髪中心の写真がおすすめです。
                </p>
              </div>
            )}

            {/* 写真診断の結果 */}
            {photoResult && (
              <div style={{ ...card, borderTop: `4px solid ${C.gold}` }}>
                <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginBottom: 6 }}>
                  写真AI診断の結果
                </div>
                <div style={{ fontSize: 20, color: C.ink, fontWeight: 800, marginBottom: 8 }}>
                  {photoResult.level_name}
                </div>
                <div style={subLabel}>髪の状態</div>
                <p style={subText}>{photoResult.hair_condition_analysis}</p>
                <div style={{ ...subLabel, marginTop: 14 }}>おすすめのケア</div>
                <p style={subText}>{photoResult.recommended_care}</p>
              </div>
            )}

            {/* PLG動線CTA */}
            <button
              onClick={() => (window.location.href = '/miniapp/link?from=haircheck')}
              style={ctaPrimary}
            >
              この結果をマイカルテに保存する
            </button>
            <button
              onClick={() => (window.location.href = '/miniapp/booking')}
              style={ctaSecondary}
            >
              キレイ鶴見店に相談・予約する
            </button>

            <p style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={restart} style={linkBtn}>もう一度診断する</button>
            </p>

            <p style={{ fontSize: 11, color: '#9a8f85', marginTop: 20, lineHeight: 1.7, textAlign: 'center' }}>
              ※本診断は美容に関する一般的なアドバイスを目的としたもので、医学的な診断ではありません。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 22,
  marginBottom: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
}
const choiceBtn: React.CSSProperties = {
  width: '100%',
  padding: '15px 16px',
  fontSize: 15,
  color: C.ink,
  background: '#fff',
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  textAlign: 'left',
  cursor: 'pointer',
}
const tag: React.CSSProperties = {
  fontSize: 12,
  color: C.gold,
  background: '#f5efe8',
  padding: '4px 10px',
  borderRadius: 999,
}
const photoBtn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '13px',
  fontSize: 15,
  fontWeight: 700,
  color: C.gold,
  background: '#fff',
  border: `1px solid ${C.gold}`,
  borderRadius: 10,
  textAlign: 'center',
  cursor: 'pointer',
  boxSizing: 'border-box',
}
const subLabel: React.CSSProperties = { fontSize: 12, color: C.gold, fontWeight: 700, marginBottom: 4 }
const subText: React.CSSProperties = { color: C.ink, fontSize: 15, lineHeight: 1.9, margin: 0 }
const ctaPrimary: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  fontSize: 16,
  fontWeight: 700,
  color: '#fff',
  background: C.rose,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  marginBottom: 10,
}
const ctaSecondary: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  fontSize: 15,
  fontWeight: 700,
  color: C.rose,
  background: '#fff',
  border: `1px solid ${C.rose}`,
  borderRadius: 10,
  cursor: 'pointer',
}
const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: C.muted,
  fontSize: 13,
  textDecoration: 'underline',
  cursor: 'pointer',
}
