/**
 * AI警告抽出プロンプト生成関数
 * Claude Haiku 用：事前カウンセリング回答からアレルギー・危険因子を抽出
 */

import type { PreCounseling } from '@/types/pre-counseling'

export type WarningType =
  | 'diamine_allergy'
  | 'chemical_sensitivity'
  | 'scalp_sensitivity'
  | 'pregnancy'
  | 'previous_reaction'
  | 'other'

export type WarningsSeverity = 'high' | 'medium' | 'low'

export interface Warning {
  type: WarningType
  severity: WarningsSeverity
  description: string
  recommended_action: string
  source: 'pre_counseling' | 'karte'
}

export function generateWarningsPrompt(
  preCounselingAnswers: Record<string, any>,
  existingAllergies?: string | null
): string {
  return `
あなたはヘアケア安全専門家です。顧客の回答からアレルギーと安全上の懸念を抽出してください。

顧客の回答:
${JSON.stringify(preCounselingAnswers, null, 2)}

既存アレルギー:
${existingAllergies || '(なし)'}

重要なルール:
1. ジアミン（PPD / パラフェニレンジアミン）アレルギー → 必ず "diamine_allergy" + severity "high"
2. 妊娠中・授乳中 → "pregnancy" + severity "medium"
3. 警告なし → 空配列を返す []
4. JSON配列のみを返す。説明やマークダウンなし

警告配列を返してください（警告なしなら空配列）:
[
  {
    "type": "diamine_allergy" | "chemical_sensitivity" | "scalp_sensitivity" | "pregnancy" | "previous_reaction" | "other",
    "severity": "high" | "medium" | "low",
    "description": "顧客状態の客観記述（30字以内・日本語）",
    "recommended_action": "推奨対応（50字以内・日本語）",
    "source": "pre_counseling"
  }
]
`.trim()
}

export function validateWarningsResponse(response: string): {
  valid: boolean
  warnings?: Warning[]
  error?: string
  raw?: string
} {
  const rawSnippet = response.slice(0, 500)
  try {
    let cleaned = response.trim()

    // markdown コードフェンス除去
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '')
    cleaned = cleaned.replace(/\n?\s*```\s*$/i, '')
    cleaned = cleaned.trim()

    // 周囲にテキストがある場合 JSON 配列を抽出
    if (!cleaned.startsWith('[')) {
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        cleaned = arrayMatch[0]
      }
    }

    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) {
      return { valid: false, error: 'Response is not an array', raw: rawSnippet }
    }

    const warnings: Warning[] = parsed.map((w: any) => ({
      type: w.type as WarningType,
      severity: w.severity as WarningsSeverity,
      description: String(w.description || '').slice(0, 30),
      recommended_action: String(w.recommended_action || '').slice(0, 50),
      source: w.source || 'pre_counseling',
    }))

    return { valid: true, warnings }
  } catch (err) {
    return { valid: false, error: String(err), raw: rawSnippet }
  }
}
