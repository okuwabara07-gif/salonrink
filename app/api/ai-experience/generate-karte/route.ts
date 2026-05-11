/**
 * POST /api/ai-experience/generate-karte
 * LP AI Experience: Karte generation endpoint
 *
 * 責務:
 * - プロファイル(1, 2, 3)の検証
 * - AI生成(Claude Haiku)
 * - レート制限(IP単位: 1分5リクエスト)
 * - JSON構造化レスポンス返却
 * - エラーハンドリング
 */

import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// 簡易的なインメモリレート制限(本番環境ではRedis推奨)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(ip: string): string {
  return `ai-experience:${ip}`
}

function checkRateLimit(ip: string): boolean {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 })
    return true
  }

  if (entry.count >= 5) {
    return false
  }

  entry.count++
  return true
}

// 顧客プロファイルデータ
interface CustomerProfile {
  id: 1 | 2 | 3
  age: number
  gender: '女性' | '男性'
  occupation: string
  hair_concern: string
  desired_style: string
  allergy: string | null
  visit_frequency: string
  notes: string
  past_conversation: string
}

const PROFILES: Record<1 | 2 | 3, CustomerProfile> = {
  1: {
    id: 1,
    age: 25,
    gender: '女性',
    occupation: 'OL',
    hair_concern: 'パサつき、毛先のダメージ',
    desired_style: 'グレーカラー、透明感重視',
    allergy: null,
    visit_frequency: '2ヶ月に1回',
    notes: '前回ブリーチで痛みが気になっています',
    past_conversation: '結婚式が3ヶ月後にあるとのこと',
  },
  2: {
    id: 2,
    age: 40,
    gender: '女性',
    occupation: '主婦',
    hair_concern: '白髪が増えてきた、頭皮の乾燥',
    desired_style: '白髪ぼかしハイライト、自然な仕上がり',
    allergy: '敏感肌(過去PPDA陽性反応あり)',
    visit_frequency: '1.5ヶ月に1回',
    notes: '頭皮が敏感、刺激の少ない薬剤を希望',
    past_conversation: 'お子さんが小学校入学とのこと',
  },
  3: {
    id: 3,
    age: 30,
    gender: '男性',
    occupation: '営業職',
    hair_concern: 'くせ毛、朝のスタイリング時間が長い',
    desired_style: '清潔感のある暗髪ナチュラル',
    allergy: null,
    visit_frequency: '月1回',
    notes: 'クライアント対応で第一印象を大事にしている',
    past_conversation: '最近ジムに通い始めたとのこと',
  },
}

interface KarteOutput {
  customer_summary: string
  key_observations_for_stylist: string[]
  allergy_warnings: string[]
  past_conversation_reminders: string[]
  reference_suggestions: {
    note: string
    treatment_ideas: string[]
    communication_starters: string[]
  }
  ai_disclaimer: string
}

async function generateKarteWithAI(profile: CustomerProfile): Promise<KarteOutput> {
  const prompt = `
あなたは美容業界15年経験のベテラン美容師アシスタントです。
あなたの役割は、お客様情報を「整理」して、現場の美容師さんに「引き継ぐ」ことです。
施術の最終判断は美容師さんが行います。あなたは判断を強制せず、参考情報を整理して提示します。

【お客様情報】
年齢: ${profile.age}歳
性別: ${profile.gender}
ご職業: ${profile.occupation}
髪・頭皮のお悩み: ${profile.hair_concern}
ご希望のスタイル: ${profile.desired_style}
アレルギー: ${profile.allergy || 'なし'}
来店頻度: ${profile.visit_frequency}
お客様メモ: ${profile.notes}
前回までの会話: ${profile.past_conversation}

【出力 JSON 形式・厳守】
{
  "customer_summary": "お客様のお声を整理しました(200字以内、敬体で)",
  "key_observations_for_stylist": [
    "(美容師さんが知っておくべきこと、3-4個、各60字以内)"
  ],
  "allergy_warnings": [
    "(該当する警告のみ、無ければ空配列)"
  ],
  "past_conversation_reminders": [
    "(前回までの会話メモから引き出すべき内容)"
  ],
  "reference_suggestions": {
    "note": "以下は参考案です。最終判断はあなたの目で行ってください。",
    "treatment_ideas": [
      "(参考施術案、2-3個、各40字以内)"
    ],
    "communication_starters": [
      "(初回挨拶での声かけ案、2個)"
    ]
  },
  "ai_disclaimer": "この内容は参考情報です。お客様の状態を見て、最終判断を行ってください。"
}

【出力時の絶対ルール】
- treatment_ideas は「決定」ではなく「参考案」と明記
- 美容師の判断を尊重する表現を必ず含める
- 効率や時短を強調しない
- 不自然な敬語禁止、自然な敬体を使用
- JSON 以外の出力禁止
`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  let parsedOutput: KarteOutput
  try {
    // JSON を抽出(code block の場合も対応)
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch ? jsonMatch[1] : responseText
    parsedOutput = JSON.parse(jsonStr)
  } catch (err) {
    console.error('JSON parse error:', err, 'Response:', responseText)
    throw new Error('Failed to parse AI response as JSON')
  }

  return parsedOutput
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: IP 取得 & レート制限チェック
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', message: '1分に5回までのリクエストです。少しお待ちください。' },
        { status: 429 }
      )
    }

    // Step 2: Body パース
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'invalid_json', message: 'Invalid JSON' },
        { status: 400 }
      )
    }

    // Step 3: profile_id 検証
    const { profile_id } = body
    if (!profile_id || ![1, 2, 3].includes(profile_id)) {
      return NextResponse.json(
        {
          error: 'invalid_profile',
          message: 'profile_id must be 1, 2, or 3',
        },
        { status: 400 }
      )
    }

    const profile = PROFILES[profile_id as 1 | 2 | 3]

    // Step 4: Claude Haiku で AI 生成
    const karte = await generateKarteWithAI(profile)

    // Step 5: レスポンス返却
    return NextResponse.json(
      {
        success: true,
        profile_id,
        karte,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/ai-experience/generate-karte error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to generate karte' },
      { status: 500 }
    )
  }
}
