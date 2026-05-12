import Anthropic from '@anthropic-ai/sdk'

const classifyPrompt = `あなたは美容業界向けSaaS「SalonRink」のメール返信を分類するAIです。
以下のメール本文を分類してください。

分類カテゴリ:
1. question - 製品・料金・機能などの質問
2. meeting - 商談・面談・デモ希望
3. unsubscribe - 配信停止希望、興味なし、解約希望
4. absent - 不在通知、自動応答(out of office, vacation)
5. unknown - 上記に該当しない、または判別困難

レスポンスは厳密に以下のJSON形式のみで返してください。前後の説明文不要:
{
  "classification": "question" | "meeting" | "unsubscribe" | "absent" | "unknown",
  "confidence": 0.0-1.0,
  "reasoning": "判定理由を簡潔に",
  "extracted_topic": "質問の場合、何についての質問か簡潔に"
}

メール本文:
---
{body}
---`

interface ClassificationResult {
  classification: 'question' | 'meeting' | 'unsubscribe' | 'absent' | 'unknown'
  confidence: number
  reasoning: string
  extracted_topic?: string
}

export async function classifyEmail(body: string): Promise<ClassificationResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[classify-email] ANTHROPIC_API_KEY not configured')
    return null
  }

  const anthropic = new Anthropic({ apiKey })

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: classifyPrompt.replace('{body}', body),
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned) as ClassificationResult

    console.log(`[classify-email] ${result.classification} (confidence: ${result.confidence})`)
    return result
  } catch (error) {
    console.error('[classify-email] Failed:', error instanceof Error ? error.message : error)
    return null
  }
}
