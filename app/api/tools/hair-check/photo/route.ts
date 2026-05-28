/**
 * POST /api/tools/hair-check/photo
 *
 * 髪質診断 Step 2（写真AI診断）。希望者のみ。Claude Haiku(vision)を使用。
 *
 * コスト制御(必須):
 * 1. IP単位のレート制限(短時間の連打防止)
 * 2. 日次グローバル上限(diagnosis_results の当日 ai_used=true 件数でキャップ)
 * いずれも超過時は 429 を返し Claude を呼ばない。
 *
 * body: { image_base64: string, media_type: string, session_id?: string }
 * 返却 result は quiz と同じキー構造(カルテ互換)。
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { getKireiTsurumiSalonId } from '@/lib/miniapp/verify'

const MODEL = 'claude-haiku-4-5-20251001'

// 日次グローバル上限(暴走防止)。必要に応じて env で調整可能にする。
const DAILY_PHOTO_LIMIT = Number(process.env.HAIR_CHECK_PHOTO_DAILY_LIMIT || 200)

// IPレート制限(メモリ・既存 ai-experience パターン踏襲)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_WINDOW_MS = 60_000 // 1分
const RATE_MAX = 3 // 1分あたり3回まで

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_MAX) return false
  entry.count += 1
  return true
}

const ALLOWED_MEDIA = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))
    const { image_base64, media_type, session_id } = body

    // 入力検証
    if (!image_base64 || typeof image_base64 !== 'string') {
      return NextResponse.json({ error: '画像をアップロードしてください' }, { status: 400 })
    }
    if (!ALLOWED_MEDIA.includes(media_type)) {
      return NextResponse.json({ error: '対応していない画像形式です' }, { status: 400 })
    }
    // 画像サイズ上限(base64で約5MB相当)
    if (image_base64.length > 7_000_000) {
      return NextResponse.json({ error: '画像サイズが大きすぎます' }, { status: 400 })
    }

    // 1. IPレート制限
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: '短時間に多くの診断が行われました。少し時間をおいてお試しください。' },
        { status: 429 }
      )
    }

    const admin = createAdminClient()

    // 2. 日次グローバル上限(当日の ai_used=true 件数)
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const { count } = await admin
      .from('diagnosis_results')
      .select('id', { count: 'exact', head: true })
      .eq('ai_used', true)
      .gte('created_at', startOfDay.toISOString())

    if ((count || 0) >= DAILY_PHOTO_LIMIT) {
      return NextResponse.json(
        { error: '本日の写真診断は上限に達しました。クイズ診断はご利用いただけます。' },
        { status: 429 }
      )
    }

    // 3. Haiku(vision)で診断
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const prompt = `あなたは美容室のヘアケアアドバイザーです。アップロードされた髪の写真を見て、髪の状態を一般的な美容アドバイスの範囲で評価してください。医学的診断や効能の断定はしないでください。

以下のJSON形式のみで出力してください(JSON以外の出力禁止):
{
  "damage_level": "low | medium | high のいずれか",
  "level_name": "健康毛 | 軽度乾燥 | 中度ダメージ | 高度ダメージ のいずれか",
  "hair_condition_analysis": "髪の状態の評価(顧客向けの平易で前向きな1-2文)",
  "recommended_care": "おすすめのケア(1-2文・断定や効能表現を避ける)",
  "concern_tags": ["乾燥","広がり","ダメージ","白髪" から該当するもの(最大3つ)]
}`

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type, data: image_base64 },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    })

    const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
    let result: any
    try {
      const jsonStr = text.replace(/```json|```/g, '').trim()
      result = JSON.parse(jsonStr)
    } catch (e) {
      console.error('[tools/hair-check/photo] parse error:', e, text)
      return NextResponse.json({ error: '診断結果の解析に失敗しました' }, { status: 500 })
    }

    // 4. 結果を記録(ai_used=true・コスト追跡)
    try {
      await admin.from('diagnosis_results').insert({
        line_user_id: null,
        session_id: typeof session_id === 'string' ? session_id : null,
        salon_id: getKireiTsurumiSalonId(),
        diagnosis_type: 'photo',
        quiz_answers: [],
        result,
        ai_used: true,
        converted_to_karte: false,
      })
    } catch (e) {
      console.warn('[tools/hair-check/photo] save skipped:', e)
    }

    return NextResponse.json({ result })
  } catch (e) {
    console.error('[tools/hair-check/photo] fatal:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
