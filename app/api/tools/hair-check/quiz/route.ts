/**
 * POST /api/tools/hair-check/quiz
 *
 * 髪質診断 Step 1（質問式クイズ）の判定。
 * Claude を呼ばないロジック判定のみ。コスト¥0。
 *
 * body: { answers: string[], session_id?: string }
 * - answers: 各設問で選んだ choice.id の配列
 * - session_id: 登録前の一時識別(任意・結果の仮保存用)
 *
 * 結果は diagnosis_results に ai_used=false で記録(任意・失敗しても結果は返す)。
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { diagnose, isComplete } from '@/lib/tools/hair-check'
import { getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))
    const answers = body.answers

    if (!Array.isArray(answers) || !isComplete(answers)) {
      return NextResponse.json(
        { error: 'すべての質問にお答えください' },
        { status: 400 }
      )
    }

    const result = diagnose(answers)

    // 任意保存(記録できなくても診断結果は返す)
    try {
      const admin = createAdminClient()
      await admin.from('diagnosis_results').insert({
        line_user_id: null,
        session_id: typeof body.session_id === 'string' ? body.session_id : null,
        salon_id: getKireiTsurumiSalonId(),
        diagnosis_type: 'quiz',
        quiz_answers: answers,
        result,
        ai_used: false,
        converted_to_karte: false,
      })
    } catch (e) {
      console.warn('[tools/hair-check/quiz] save skipped:', e)
    }

    return NextResponse.json({ result })
  } catch (e) {
    console.error('[tools/hair-check/quiz] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
