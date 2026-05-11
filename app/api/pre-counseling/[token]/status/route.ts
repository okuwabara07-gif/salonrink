/**
 * GET /api/pre-counseling/[token]/status
 * AI分析進捗状況取得エンドポイント
 *
 * 責務:
 * - token 検証
 * - pre_counseling レコードの ai_analyzed_at をチェック
 * - 分析完了状態と進捗情報を返却
 */

import { NextRequest, NextResponse } from 'next/server'
import { validatePreCounselingToken } from '@/lib/security/token'
import type { PreCounselingError } from '@/types/pre-counseling'

const ERROR_MESSAGES: Record<PreCounselingError, string> = {
  INVALID_TOKEN: 'トークンが無効です',
  EXPIRED_TOKEN: 'トークンの有効期限が切れています',
  NOT_FOUND: 'カウンセリング情報が見つかりません',
  ALREADY_SUBMITTED: '既に提出済みです',
  INVALID_INPUT: '入力値が無効です',
  UNAUTHORIZED: '認可されていません',
  INTERNAL_ERROR: 'サーバーエラーが発生しました',
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const { token } = await props.params

    // Step 1: token 検証
    const validation = await validatePreCounselingToken(token)
    if (!validation.valid || !validation.preCounseling) {
      const errorCode = validation.error || 'INTERNAL_ERROR'
      return NextResponse.json(
        { error: errorCode, message: ERROR_MESSAGES[errorCode] },
        { status: validation.error === 'EXPIRED_TOKEN' ? 410 : 400 }
      )
    }

    const preCounseling = validation.preCounseling

    // Step 2: AI分析完了状態をチェック
    const isAnalyzed = !!(preCounseling as any).ai_analyzed_at
    const aiAnalysis = (preCounseling as any).ai_analysis || {}

    // Step 3: 進捗情報を構築
    let status: 'analyzing' | 'complete'
    let progress: number

    if (isAnalyzed) {
      status = 'complete'
      progress = 100
    } else {
      // 送信から経過時間で進捗を概算
      const submittedAt = new Date((preCounseling as any).submitted_at).getTime()
      const now = Date.now()
      const elapsedSeconds = (now - submittedAt) / 1000

      // 経過時間に基づいて進捗を計算（最大 90%）
      // 0-5秒: 20-40%, 5-10秒: 40-70%, 10秒以上: 70-90%
      if (elapsedSeconds < 5) {
        progress = 20 + (elapsedSeconds / 5) * 20
      } else if (elapsedSeconds < 10) {
        progress = 40 + ((elapsedSeconds - 5) / 5) * 30
      } else {
        progress = 70 + Math.min(20, (elapsedSeconds - 10) / 10 * 20)
      }

      status = 'analyzing'
    }

    // Step 4: レスポンス返却
    return NextResponse.json(
      {
        status,
        progress: Math.min(progress, status === 'complete' ? 100 : 90),
        ai_analysis: isAnalyzed ? aiAnalysis : null,
        is_analyzed: isAnalyzed,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/pre-counseling/[token]/status error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: ERROR_MESSAGES['INTERNAL_ERROR'] },
      { status: 500 }
    )
  }
}
