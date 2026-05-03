'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import liff from '@line/liff'
import {
  PreCounselingAnswersHint,
  ConcernType,
  MoodType,
  AllergyType,
  GetPreCounselingResponse,
  PRE_COUNSELING_ERROR_MESSAGES,
} from '@/types/pre-counseling'

// ========================================
// 選択肢ラベル定数
// ========================================

const CONCERN_LABELS: Record<ConcernType, string> = {
  dryness: '乾燥',
  frizz: '広がり・うねり',
  split_ends: '枝毛・切れ毛',
  color_fade: '色落ち',
  thinning: '細毛・ボリューム',
  gray: '白髪',
  other: 'その他',
}

const MOOD_LABELS: Record<MoodType, string> = {
  excited: 'ワクワク',
  relaxed: 'リラックス',
  normal: '普通',
  anxious: '少し不安',
}

const ALLERGY_LABELS: Record<AllergyType, string> = {
  hair_color: 'ヘアカラー成分',
  fragrance: '香り',
  detergent: '洗剤',
  none: 'なし',
  other: 'その他',
}

// ========================================
// UI ステート型
// ========================================

type PageState = 'loading' | 'error' | 'form' | 'submitted'

// ========================================
// スタイル定数
// ========================================

const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
    fontFamily: 'sans-serif',
    padding: '0 0 80px',
  } as React.CSSProperties,
  header: {
    backgroundColor: 'var(--bg-card)',
    borderBottom: '1px solid var(--sr-border)',
    padding: '20px 24px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  headerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  } as React.CSSProperties,
  headerSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  } as React.CSSProperties,
  body: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '24px 16px',
  } as React.CSSProperties,
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--sr-border)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  } as React.CSSProperties,
  questionLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '12px',
    display: 'block',
  } as React.CSSProperties,
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid var(--sr-border)',
    cursor: 'pointer',
  } as React.CSSProperties,
  checkboxRowLast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    cursor: 'pointer',
  } as React.CSSProperties,
  checkboxLabel: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    flex: 1,
  } as React.CSSProperties,
  radioRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid var(--sr-border)',
    cursor: 'pointer',
  } as React.CSSProperties,
  radioRowLast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    cursor: 'pointer',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    border: '1px solid var(--sr-border)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-main)',
    resize: 'vertical' as const,
    minHeight: '96px',
    boxSizing: 'border-box' as const,
    outline: 'none',
  } as React.CSSProperties,
  charCount: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'right' as const,
    marginTop: '4px',
  } as React.CSSProperties,
  submitBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--accent-gold)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
  } as React.CSSProperties,
  submitBtnDisabled: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--sr-border)',
    color: 'var(--text-secondary)',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'not-allowed',
    marginTop: '8px',
  } as React.CSSProperties,
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-main)',
    padding: '40px 24px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  errorIcon: {
    fontSize: '40px',
    marginBottom: '16px',
  } as React.CSSProperties,
  errorTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  } as React.CSSProperties,
  errorMsg: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  } as React.CSSProperties,
} as const

// ========================================
// 内部コンポーネント（useSearchParams を使用）
// ========================================

function PreCounselingContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [counselingInfo, setCounselingInfo] = useState<GetPreCounselingResponse | null>(null)
  const [lineUserId, setLineUserId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<PreCounselingAnswersHint>({
    concerns: [],
    mood: undefined,
    desired_look: '',
    allergies: [],
    stylist_request: '',
  })

  // LIFF 初期化 + トークン事前検証
  useEffect(() => {
    const init = async () => {
      if (!token) {
        setErrorMessage(PRE_COUNSELING_ERROR_MESSAGES['INVALID_TOKEN'])
        setPageState('error')
        return
      }

      const liffId = process.env.NEXT_PUBLIC_LIFF_ID_PRE_COUNSELING
      if (!liffId) {
        setErrorMessage('設定エラーが発生しました')
        setPageState('error')
        return
      }

      try {
        await liff.init({ liffId })

        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        const profile = await liff.getProfile()
        setLineUserId(profile.userId)
      } catch {
        setErrorMessage('LINE 認証に失敗しました')
        setPageState('error')
        return
      }

      try {
        const res = await fetch(`/api/pre-counseling/${token}/get`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          const msg = data?.message || PRE_COUNSELING_ERROR_MESSAGES['INTERNAL_ERROR']
          setErrorMessage(msg)
          setPageState('error')
          return
        }
        const data: GetPreCounselingResponse = await res.json()
        setCounselingInfo(data)
        setPageState('form')
      } catch {
        setErrorMessage(PRE_COUNSELING_ERROR_MESSAGES['INTERNAL_ERROR'])
        setPageState('error')
      }
    }

    init()
  }, [token])

  // フォーム送信
  const handleSubmit = async () => {
    if (!token || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/pre-counseling/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          line_user_id: lineUserId ?? undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.message || PRE_COUNSELING_ERROR_MESSAGES['INTERNAL_ERROR']
        setErrorMessage(msg)
        setPageState('error')
        return
      }

      setPageState('submitted')
    } catch {
      setErrorMessage(PRE_COUNSELING_ERROR_MESSAGES['INTERNAL_ERROR'])
      setPageState('error')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleConcern = (val: ConcernType) => {
    setAnswers((prev) => ({
      ...prev,
      concerns: prev.concerns?.includes(val)
        ? prev.concerns.filter((v) => v !== val)
        : [...(prev.concerns ?? []), val],
    }))
  }

  const toggleAllergy = (val: AllergyType) => {
    setAnswers((prev) => ({
      ...prev,
      allergies: prev.allergies?.includes(val)
        ? prev.allergies.filter((v) => v !== val)
        : [...(prev.allergies ?? []), val],
    }))
  }

  // 画面: ローディング
  if (pageState === 'loading') {
    return (
      <div style={S.center} role="status" aria-label="読み込み中">
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>読み込み中...</p>
      </div>
    )
  }

  // 画面: エラー
  if (pageState === 'error') {
    return (
      <div style={S.center} role="alert">
        <div style={S.errorIcon} aria-hidden="true">⚠️</div>
        <p style={S.errorTitle}>ご確認ください</p>
        <p style={S.errorMsg}>{errorMessage}</p>
      </div>
    )
  }

  // 画面: 送信完了
  if (pageState === 'submitted') {
    return (
      <div style={S.center} role="status">
        <div style={{ fontSize: '48px', marginBottom: '16px' }} aria-hidden="true">✅</div>
        <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
          ご回答ありがとうございました
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {counselingInfo?.salon_name ?? 'サロン'}でお待ちしております
        </p>
      </div>
    )
  }

  // 画面: フォーム
  const concerns = answers.concerns ?? []
  const allergies = answers.allergies ?? []
  const desiredLook = answers.desired_look ?? ''
  const stylistRequest = answers.stylist_request ?? ''

  return (
    <div style={S.page}>
      <header style={S.header}>
        <h1 style={S.headerTitle}>事前カウンセリング</h1>
        {counselingInfo && (
          <p style={S.headerSubtitle}>
            {counselingInfo.salon_name}
            {counselingInfo.customer_name ? `　${counselingInfo.customer_name} 様` : ''}
          </p>
        )}
      </header>

      <div style={S.body}>
        {/* Q1: 髪のお悩み */}
        <div style={S.card} role="group" aria-labelledby="q1-label">
          <span id="q1-label" style={S.questionLabel}>Q1. 髪のお悩みを教えてください（複数選択可）</span>
          {(Object.entries(CONCERN_LABELS) as [ConcernType, string][]).map(([val, label], i, arr) => (
            <label
              key={val}
              style={i === arr.length - 1 ? S.checkboxRowLast : S.checkboxRow}
              htmlFor={`concern-${val}`}
            >
              <input
                id={`concern-${val}`}
                type="checkbox"
                checked={concerns.includes(val)}
                onChange={() => toggleConcern(val)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)', flexShrink: 0 }}
              />
              <span style={S.checkboxLabel}>{label}</span>
            </label>
          ))}
        </div>

        {/* Q2: 当日の気分 */}
        <div style={S.card} role="group" aria-labelledby="q2-label">
          <span id="q2-label" style={S.questionLabel}>Q2. 本日の気分はいかがですか？</span>
          {(Object.entries(MOOD_LABELS) as [MoodType, string][]).map(([val, label], i, arr) => (
            <label
              key={val}
              style={i === arr.length - 1 ? S.radioRowLast : S.radioRow}
              htmlFor={`mood-${val}`}
            >
              <input
                id={`mood-${val}`}
                type="radio"
                name="mood"
                value={val}
                checked={answers.mood === val}
                onChange={() => setAnswers((prev) => ({ ...prev, mood: val }))}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)', flexShrink: 0 }}
              />
              <span style={S.checkboxLabel}>{label}</span>
            </label>
          ))}
        </div>

        {/* Q3: 仕上がりイメージ */}
        <div style={S.card}>
          <label htmlFor="desired-look" style={S.questionLabel}>
            Q3. ご希望の仕上がりイメージをお聞かせください
          </label>
          <textarea
            id="desired-look"
            style={S.textarea}
            placeholder="例: 毎朝のスタイリングが楽になるようなスタイルにしたい"
            value={desiredLook}
            onChange={(e) => setAnswers((prev) => ({ ...prev, desired_look: e.target.value.slice(0, 500) }))}
            maxLength={500}
            aria-describedby="desired-look-count"
          />
          <p id="desired-look-count" style={S.charCount}>{desiredLook.length} / 500</p>
        </div>

        {/* Q4: アレルギー・苦手 */}
        <div style={S.card} role="group" aria-labelledby="q4-label">
          <span id="q4-label" style={S.questionLabel}>Q4. アレルギーや苦手なものがあればお知らせください（複数選択可）</span>
          {(Object.entries(ALLERGY_LABELS) as [AllergyType, string][]).map(([val, label], i, arr) => (
            <label
              key={val}
              style={i === arr.length - 1 ? S.checkboxRowLast : S.checkboxRow}
              htmlFor={`allergy-${val}`}
            >
              <input
                id={`allergy-${val}`}
                type="checkbox"
                checked={allergies.includes(val)}
                onChange={() => toggleAllergy(val)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)', flexShrink: 0 }}
              />
              <span style={S.checkboxLabel}>{label}</span>
            </label>
          ))}
        </div>

        {/* Q5: スタイリストへの要望 */}
        <div style={S.card}>
          <label htmlFor="stylist-request" style={S.questionLabel}>
            Q5. スタイリストへのご要望・ご質問
          </label>
          <textarea
            id="stylist-request"
            style={S.textarea}
            placeholder="例: カラー後のケア方法を教えてほしい"
            value={stylistRequest}
            onChange={(e) => setAnswers((prev) => ({ ...prev, stylist_request: e.target.value.slice(0, 500) }))}
            maxLength={500}
            aria-describedby="stylist-request-count"
          />
          <p id="stylist-request-count" style={S.charCount}>{stylistRequest.length} / 500</p>
        </div>

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={submitting ? S.submitBtnDisabled : S.submitBtn}
          aria-busy={submitting}
          aria-label="アンケートを送信する"
        >
          {submitting ? '送信中...' : '回答を送信する'}
        </button>
      </div>
    </div>
  )
}

// ========================================
// エクスポート: Suspense でラップ
// ========================================

export default function PreCounselingPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-main)',
          }}
          role="status"
          aria-label="読み込み中"
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>読み込み中...</p>
        </div>
      }
    >
      <PreCounselingContent />
    </Suspense>
  )
}
