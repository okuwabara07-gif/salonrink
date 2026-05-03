/**
 * SalonRink Pre-Counseling AI プロンプト関数群
 * 事前カウンセリングの回答を分析するための Claude Haiku プロンプト生成
 *
 * 責務:
 * - 顧客の来店パターン別(初回/リピート/長期離反)に最適化されたプロンプトを生成
 * - AI 応答の JSON 検証
 * - AI 失敗時の フォールバック応答
 *
 * 特徴:
 * - 純粋関数のみ(副作用なし)
 * - AI API 呼び出しなし(Commit 44 で実施)
 * - maskCustomerName を内部適用(A2 個人情報保護)
 */

import { PreCounseling, AIAnalysisResultHint } from '@/types/pre-counseling'
import { maskCustomerName } from '@/lib/security/privacy'

// ========================================
// 型定義
// ========================================

/**
 * カルテサマリー（来店履歴用）
 */
interface KarteSummary {
  date: string // ISO 8601 date
  menu_name: string
  hair_condition?: string
}

/**
 * analyzePreCounseling の入力型
 */
interface PreCounselingAnalysisInput {
  preCounseling: PreCounseling
  customer: {
    id: string
    name: string
    visit_count: number
    last_visit: string | null
  }
  recentKartes?: KarteSummary[]
}

/**
 * validateAIResponse の戻り値型
 */
interface ValidationResult {
  valid: boolean
  errors: string[]
  cleaned?: AIAnalysisResultHint
}

// ========================================
// 1. 初回顧客向けプロンプト
// ========================================

/**
 * 初回顧客向けプロンプト生成
 * 来店1回目 → 来店経歴がないため基本情報を重視
 *
 * @param params - customerName(マスク前提), answers, hasPhotos
 * @returns Claude Haiku 向けプロンプト文字列
 */
export function buildPreCounselingPromptFirstTime(params: {
  customerName: string
  answers: Record<string, any>
  hasPhotos?: boolean
}): string {
  const { customerName, answers, hasPhotos } = params

  const photosNote = hasPhotos ? '（写真あり）' : '（写真なし）'

  return `以下は初めてご来店される顧客の事前カウンセリング回答です。丁寧で慎重な提案を心がけてください。

【顧客情報】
名前: ${customerName}
来店回数: 1 回目
写真: ${photosNote}

【回答内容】
${JSON.stringify(answers, null, 2)}

【出力形式】
JSON形式で以下の構造で返してください:
{
  "summary": "顧客の意図・希望を 80 文字以内で要約",
  "suggested_menu": "推奨メニューの名前と簡潔な理由（100 文字以内）",
  "preparation_notes": ["準備事項 1", "準備事項 2", "準備事項 3"],
  "communication_tips": "初回カウンセリング時の接客上の留意点（200 文字以内）"
}

【留意点】
- 初回顧客なので、基本からの丁寧な説明を心がける
- 希望イメージや懸念点を十分に汲み取る
- アレルギーや肌のデリケート性への配慮を示す
- 次回来店への期待感を高める内容にする`
}

// ========================================
// 2. リピート顧客向けプロンプト
// ========================================

/**
 * リピート顧客向けプロンプト生成
 * visit_count > 1 → 過去来店履歴との比較・継続的改善
 *
 * @param params - customerName, answers, visitCount, daysSinceLastVisit, recentKartes, hasPhotos
 * @returns Claude Haiku 向けプロンプト文字列
 */
export function buildPreCounselingPromptRepeat(params: {
  customerName: string
  answers: Record<string, any>
  visitCount: number
  daysSinceLastVisit: number
  recentKartes: KarteSummary[]
  hasPhotos?: boolean
}): string {
  const { customerName, answers, visitCount, daysSinceLastVisit, recentKartes, hasPhotos } = params

  const photosNote = hasPhotos ? '（写真あり）' : '（写真なし）'
  const kartesSummary = recentKartes
    .slice(0, 3)
    .map((k) => `- ${k.date}: ${k.menu_name}${k.hair_condition ? ` (${k.hair_condition})` : ''}`)
    .join('\n')

  return `以下はリピート顧客の事前カウンセリング回答です。過去の来店履歴と比較しながら、継続的な改善を提案してください。

【顧客情報】
名前: ${customerName}
来店回数: ${visitCount} 回目
前回来店から: ${daysSinceLastVisit} 日前
写真: ${photosNote}

【過去の来店履歴（直近）】
${kartesSummary}

【今回の回答内容】
${JSON.stringify(answers, null, 2)}

【出力形式】
JSON形式で以下の構造で返してください:
{
  "summary": "顧客の成長・変化・継続的なニーズを 80 文字以内で要約",
  "suggested_menu": "推奨メニュー（前回との違いがあれば言及、100 文字以内）",
  "preparation_notes": ["準備事項 1", "準備事項 2", "準備事項 3"],
  "communication_tips": "前回との比較・改善点を踏まえた接客上の留意点（200 文字以内）"
}

【留意点】
- 過去の施術結果とのつながりを確認する
- 顧客が抱える課題の進捗を認識する
- ケアアドバイスの効果を検証する視点
- 信頼関係を深める内容にする`
}

// ========================================
// 3. 長期離反顧客向けプロンプト
// ========================================

/**
 * 長期離反顧客向けプロンプト生成（90日以上）
 * 久しぶりの来店 → リコネクト重視、慎重な再スタート
 *
 * @param params - customerName, answers, visitCount, daysSinceLastVisit, recentKartes, hasPhotos
 * @returns Claude Haiku 向けプロンプト文字列
 */
export function buildPreCounselingPromptReturning(params: {
  customerName: string
  answers: Record<string, any>
  visitCount: number
  daysSinceLastVisit: number
  recentKartes: KarteSummary[]
  hasPhotos?: boolean
}): string {
  const { customerName, answers, visitCount, daysSinceLastVisit, recentKartes, hasPhotos } = params

  const photosNote = hasPhotos ? '（写真あり）' : '（写真なし）'
  const lastKarte = recentKartes[0]
  const lastVisitDate = lastKarte?.date || '不明'

  return `以下は長期間来店されていない顧客の事前カウンセリング回答です。リコネクション重視で、丁寧で温かみのある提案をしてください。

【顧客情報】
名前: ${customerName}
来店回数: ${visitCount} 回目
最後の来店日: ${lastVisitDate}
久しぶりの来店（${daysSinceLastVisit}日ぶり）
写真: ${photosNote}

【過去の来店履歴（最後）】
- ${lastVisitDate}: ${lastKarte?.menu_name || '不明'}${lastKarte?.hair_condition ? ` (${lastKarte.hair_condition})` : ''}

【今回の回答内容】
${JSON.stringify(answers, null, 2)}

【出力形式】
JSON形式で以下の構造で返してください:
{
  "summary": "顧客の久しぶりの来店と現在のニーズを 80 文字以内で要約",
  "suggested_menu": "リコネクション・リセット施術の提案（100 文字以内）",
  "preparation_notes": ["準備事項 1", "準備事項 2", "準備事項 3"],
  "communication_tips": "久しぶりの来店客への温かみのあるウェルカムメッセージと留意点（200 文字以内）"
}

【留意点】
- 久しぶりの来店への喜びを表現
- 前回からの変化（髪質、生活環境など）を丁寧にヒアリング
- 現在の髪の状態をリセットするメニュー選択
- 次回来店への期待感を高める
- 顧客との再つながりを大切にする内容`
}

// ========================================
// 4. ディスパッチャ関数
// ========================================

/**
 * 顧客パターン別にプロンプトを生成するディスパッチャ関数
 *
 * 分岐ロジック:
 * 1. visit_count === 1 → buildPreCounselingPromptFirstTime
 * 2. visit_count > 1 かつ daysSinceLastVisit < 90 → buildPreCounselingPromptRepeat
 * 3. daysSinceLastVisit >= 90 → buildPreCounselingPromptReturning
 *
 * @param params - preCounseling, customer, recentKartes
 * @returns プロンプト文字列
 */
export function analyzePreCounseling(params: PreCounselingAnalysisInput): string {
  const { preCounseling, customer, recentKartes = [] } = params

  // 顧客名マスキング（A2 個人情報保護）
  const maskedCustomerName = maskCustomerName(customer.name)

  // 最後の来店日から何日経過しているか計算
  const lastVisitDate = customer.last_visit ? new Date(customer.last_visit).getTime() : null
  const now = new Date().getTime()
  const daysSinceLastVisit = lastVisitDate ? Math.floor((now - lastVisitDate) / (1000 * 60 * 60 * 24)) : 999

  // photos 判定
  const hasPhotos = preCounseling.photos && preCounseling.photos.length > 0

  // 分岐: 顧客パターン別にプロンプト生成
  if (customer.visit_count === 1) {
    // パターン1: 初回顧客
    return buildPreCounselingPromptFirstTime({
      customerName: maskedCustomerName,
      answers: preCounseling.answers || {},
      hasPhotos,
    })
  } else if (daysSinceLastVisit < 90) {
    // パターン2: リピート顧客（定期的に来店）
    return buildPreCounselingPromptRepeat({
      customerName: maskedCustomerName,
      answers: preCounseling.answers || {},
      visitCount: customer.visit_count,
      daysSinceLastVisit,
      recentKartes,
      hasPhotos,
    })
  } else {
    // パターン3: 長期離反顧客（90日以上）
    return buildPreCounselingPromptReturning({
      customerName: maskedCustomerName,
      answers: preCounseling.answers || {},
      visitCount: customer.visit_count,
      daysSinceLastVisit,
      recentKartes,
      hasPhotos,
    })
  }
}

// ========================================
// 5. AI 応答検証
// ========================================

/**
 * Claude からの JSON 応答を検証
 *
 * 検証項目:
 * - 必須フィールド: summary, suggested_menu, preparation_notes, communication_tips
 * - 文字数制限: summary(80), suggested_menu(100), communication_tips(200)
 * - preparation_notes は配列で 3 項目以内
 *
 * @param response - Claude からのテキスト応答
 * @returns { valid, errors, cleaned }
 */
export function validateAIResponse(response: string | any): ValidationResult {
  const errors: string[] = []
  let parsed: any

  // JSON パース
  try {
    if (typeof response === 'string') {
      // JSON ブロックを抽出（```json ... ``` の形式に対応）
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1])
      } else {
        parsed = JSON.parse(response)
      }
    } else {
      parsed = response
    }
  } catch (err) {
    return {
      valid: false,
      errors: ['JSON parsing failed'],
    }
  }

  // 必須フィールド確認
  const requiredFields = ['summary', 'suggested_menu', 'preparation_notes', 'communication_tips']
  for (const field of requiredFields) {
    if (!(field in parsed)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // 文字数制限チェック
  if (parsed.summary && typeof parsed.summary === 'string') {
    if (parsed.summary.length > 80) {
      errors.push(`summary exceeds 80 characters (${parsed.summary.length})`)
    }
  }

  if (parsed.suggested_menu && typeof parsed.suggested_menu === 'string') {
    if (parsed.suggested_menu.length > 100) {
      errors.push(`suggested_menu exceeds 100 characters (${parsed.suggested_menu.length})`)
    }
  }

  if (parsed.communication_tips && typeof parsed.communication_tips === 'string') {
    if (parsed.communication_tips.length > 200) {
      errors.push(`communication_tips exceeds 200 characters (${parsed.communication_tips.length})`)
    }
  }

  // preparation_notes チェック
  if (parsed.preparation_notes) {
    if (!Array.isArray(parsed.preparation_notes)) {
      errors.push('preparation_notes must be an array')
    } else if (parsed.preparation_notes.length > 3) {
      errors.push(`preparation_notes exceeds 3 items (${parsed.preparation_notes.length})`)
    }
  }

  // クリーニング（型変換）
  const cleaned: AIAnalysisResultHint = {
    summary: parsed.summary?.toString().slice(0, 80) || '',
    suggested_menu: parsed.suggested_menu?.toString().slice(0, 100) || '',
    preparation_notes: Array.isArray(parsed.preparation_notes)
      ? parsed.preparation_notes.slice(0, 3).map((p: any) => p.toString())
      : [],
    communication_tips: parsed.communication_tips?.toString().slice(0, 200) || '',
  }

  return {
    valid: errors.length === 0,
    errors,
    cleaned: errors.length === 0 ? cleaned : undefined,
  }
}

// ========================================
// 6. フォールバック応答
// ========================================

/**
 * AI 失敗時のフォールバック応答
 * AI API 呼び出しに失敗した場合、この応答を返す
 *
 * @returns AIAnalysisResultHint 形式の汎用応答
 */
export function getFallbackResponse(): AIAnalysisResultHint {
  return {
    summary: 'ご来店ありがとうございます',
    suggested_menu: '顧客のご希望に最適なメニューをご案内いたします',
    preparation_notes: ['詳しいカウンセリングを実施いたします', '過去の施術記録を確認いたします', 'アレルギー・肌質をお聞かせください'],
    communication_tips: '本カウンセリングは AI が生成した予測であり、実際のカウンセリングは美容師の判断を優先してください',
  }
}
