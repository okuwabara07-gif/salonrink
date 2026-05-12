import Anthropic from '@anthropic-ai/sdk'

const replyPrompt = `あなたは美容業界向けSaaS「SalonRink」のカスタマーサポート担当です。
顧客からの質問に丁寧に答えるメール返信文を作成してください。

製品情報:
- 月額1,980円〜(税込2,178円〜)から
- 初期費用0円
- 14日間無料トライアル
- LINE予約・顧客管理・AIカルテ機能
- AIカルテ:施術内容を自動記録、次回提案も自動生成

絶対ルール:
- 「保証」「絶対」「必ず」など過剰約束NG
- 競合サービス名(HotPepper Beauty, Salobo, Repitte, LIME)を批判する内容NG
- 価格・機能の事実確認できない情報は書かない
- フォーマルすぎず、親しみやすく
- 末尾に「ご不明点があればこちらのメールにそのままご返信ください」

質問内容:
---
{body}
---

JSON形式で返答(前後の説明文不要):
{
  "reply_text": "返信本文(HTMLタグ不要、改行はそのまま)",
  "confidence": 0.0-1.0
}`

interface ReplyResult {
  reply_text: string
  confidence: number
}

export async function generateReply(body: string): Promise<ReplyResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const anthropic = new Anthropic({ apiKey })

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: replyPrompt.replace('{body}', body) }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as ReplyResult
  } catch (error) {
    console.error('[generate-reply] Failed:', error)
    return null
  }
}
