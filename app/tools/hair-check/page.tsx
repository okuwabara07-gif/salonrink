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
type RecoProduct = {
  id: string
  name: string
  brand: string | null
  price: number
  volume: string | null
  effect_text: string | null
  is_set: boolean
  set_items: string[]
  fulfillment_type: 'inhouse' | 'affiliate'
  ec_url: string | null
}
type RecommendData = {
  entry: RecoProduct | null
  set: RecoProduct | null
  affiliate: RecoProduct | null
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
  const [recommend, setRecommend] = useState<RecommendData | null>(null)

  const isResult = result !== null
  async function loadRecommend(tags: string[]) {
    try {
      const res = await fetch('/api/tools/hair-check/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concern_tags: tags }),
      })
      const data = await res.json()
      if (!data.error) setRecommend(data as RecommendData)
    } catch (e) {
      console.warn('[hair-check] recommend load skipped:', e)
    }
  }

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
        body: JSON.stringify({ answers: next, source: 'haircheck' }),
      })
      const data = await res.json()
      if (data.result) {
        setResult(data.result)
        loadRecommend(data.result.concern_tags || [])
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
    setRecommend(null)
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

            {/* おすすめ製品 */}
            {recommend && (recommend.entry || recommend.set) && (
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, textAlign: 'center' }}>あなたにおすすめの製品</div>
                <p style={{ ...subText, fontSize: 12, textAlign: 'center', margin: '4px 0 14px' }}>診断結果に合わせてお選びしました。</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {recommend.entry && (
                    <div style={recoCard}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                        <div style={recoBadgeEntry}>エントリー</div>
                        <div style={recoFulfill}>サロン発送</div>
                      </div>
                      <div style={recoName}>{recommend.entry.name}</div>
                      {recommend.entry.brand && <div style={recoBrand}>{recommend.entry.brand}</div>}
                      {recommend.entry.effect_text && <p style={recoEffect}>{recommend.entry.effect_text}</p>}
                      <div style={recoPrice}>¥{recommend.entry.price.toLocaleString()}<span style={recoTax}>税込</span></div>
                      {recommend.entry.volume && <div style={recoVol}>{recommend.entry.volume}</div>}
                    </div>
                  )}
                  {recommend.set && (
                    <div style={{ ...recoCard, borderColor: C.rose }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                        <div style={recoBadgeSet}>本命セット</div>
                        <div style={recoFulfill}>サロン発送</div>
                      </div>
                      <div style={recoName}>{recommend.set.name}</div>
                      {recommend.set.brand && <div style={recoBrand}>{recommend.set.brand}</div>}
                      {recommend.set.effect_text && <p style={recoEffect}>{recommend.set.effect_text}</p>}
                      <div style={recoPrice}>¥{recommend.set.price.toLocaleString()}<span style={recoTax}>税込</span></div>
                      {recommend.set.set_items && recommend.set.set_items.length > 0 && (
                        <div style={recoVol}>{recommend.set.set_items.join(' / ')}</div>
                      )}
                    </div>
                  )}
                </div>
                {recommend.affiliate && (
                  <div style={{ ...recoCard, borderStyle: 'dashed', marginTop: 10 }}>
                    <div style={recoFulfillAff}>Amazon・楽天</div>
                    <div style={{ ...recoName, fontSize: 13 }}>参考: {recommend.affiliate.name}</div>
                    {recommend.affiliate.effect_text && <p style={recoEffect}>{recommend.affiliate.effect_text}</p>}
                    <div style={{ ...recoPrice, fontSize: 14 }}>¥{recommend.affiliate.price.toLocaleString()}<span style={recoTax}>参考価格</span></div>
                  </div>
                )}
                <p style={{ fontSize: 11, color: '#9a8f85', marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>※製品の購入機能は順次公開予定です。</p>
              </div>
            )}

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

const recoCard: React.CSSProperties = { position: 'relative', border: '1px solid #ece6df', borderRadius: 12, padding: '28px 10px 12px', background: '#fff' }
const recoBadgeEntry: React.CSSProperties = { fontSize: 10, background: '#f3ece1', color: '#8a7a63', borderRadius: 999, padding: '2px 8px' }
const recoBadgeSet: React.CSSProperties = { fontSize: 10, background: '#fbeae7', color: '#C24E40', borderRadius: 999, padding: '2px 8px' }
const recoFulfill: React.CSSProperties = { fontSize: 10, border: '1px solid #C24E40', color: '#C24E40', borderRadius: 999, padding: '1px 6px' }
const recoFulfillAff: React.CSSProperties = { display: 'inline-block', fontSize: 10, background: '#eee', color: '#666', borderRadius: 999, padding: '1px 8px', marginBottom: 4 }
const recoName: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#2b2622', marginTop: 2, lineHeight: 1.4 }
const recoBrand: React.CSSProperties = { fontSize: 11, color: '#9a8f85', marginTop: 1 }
const recoEffect: React.CSSProperties = { fontSize: 11, color: '#6f655d', lineHeight: 1.6, margin: '6px 0 0' }
const recoPrice: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: '#2b2622', marginTop: 8 }
const recoTax: React.CSSProperties = { fontSize: 10, color: '#9a8f85', marginLeft: 4, fontWeight: 400 }
const recoVol: React.CSSProperties = { fontSize: 10, color: '#9a8f85', marginTop: 2 }
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
