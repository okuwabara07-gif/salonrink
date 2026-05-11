/**
 * POST/GET /api/cron/generate-blog-post
 * Vercel Cron: 毎週月・水・金 21:00 UTC (翌日 06:00 JST) 実行
 *
 * 役割:
 * - タイトルストックから未発行の記事1本を選択
 * - Claude Haiku で記事本文生成
 * - Supabase blog_articles テーブルに保存
 * - Slack に公開通知
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'

interface ArticleTitle {
  id: string
  title: string
  cluster: string
}

interface CronResponse {
  success: boolean
  slug?: string
  title?: string
  cluster?: string
  published_at?: string
  slackSent?: boolean
  error?: string
}

// ───── Article Title Stock ─────

const ARTICLE_TITLES: ArticleTitle[] = [
  // クラスタ1: 競合比較(5本)
  { id: 'salonrink-vs-repitte', title: 'SalonRink vs Repitte: AI機能を徹底比較', cluster: '競合比較' },
  { id: 'salonrink-vs-salobo', title: 'SalonRink vs サロボ: 月額料金の違い', cluster: '競合比較' },
  { id: 'hotpepper-vs-saas', title: 'HotPepper Beauty とサロン向けSaaSの違い', cluster: '競合比較' },
  { id: 'salonrink-vs-lime', title: 'LiME と SalonRink: どっちが使いやすい?', cluster: '競合比較' },
  { id: 'free-vs-paid-karte', title: '無料カルテツール5選 vs 有料SaaS、本当のコスパは?', cluster: '競合比較' },

  // クラスタ2: ノウハウ系(5本)
  { id: 'ai-karte-time-saving', title: 'AI カルテで月25時間取り戻す具体的な方法', cluster: 'ノウハウ' },
  { id: 'line-pre-counseling', title: 'LINE 事前カウンセリングの始め方完全ガイド', cluster: 'ノウハウ' },
  { id: 'repeat-rate-up', title: 'リピート率を30%上げる顧客記録術', cluster: 'ノウハウ' },
  { id: 'beautician-dx', title: '美容師のための DX 入門: 何から始める?', cluster: 'ノウハウ' },
  { id: 'unit-price-up', title: '客単価を上げる施策とカルテ活用法', cluster: 'ノウハウ' },

  // クラスタ3: トレンド系(5本)
  { id: 'salon-trends-2026', title: '2026年のサロン経営トレンド予測', cluster: 'トレンド' },
  { id: 'beautician-overwork', title: '美容師の労働時間問題と解決策', cluster: 'トレンド' },
  { id: 'solo-salon-opening', title: '1人サロン開業ガイド: 必要な準備と費用', cluster: 'トレンド' },
  { id: 'prevent-customer-churn', title: 'お客様離れを防ぐ5つの方法', cluster: 'トレンド' },
  { id: 'ai-era-beautician', title: 'AI 時代の美容師サバイバル術', cluster: 'トレンド' },
]

// ───── Helper: 認証チェック ─────

function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return false
  }

  const expectedAuth = `Bearer ${secret}`
  return authHeader === expectedAuth
}

// ───── Helper: 次に発行する記事を選択 ─────

async function selectNextArticle(supabase: ReturnType<typeof createAdminClient>): Promise<ArticleTitle | null> {
  // 既発行記事の slug を取得
  const { data: publishedArticles, error } = await supabase
    .from('blog_articles')
    .select('slug')

  if (error) {
    console.error('[generate-blog-post] Failed to fetch published articles:', error.message)
    return null
  }

  const publishedSlugs = new Set((publishedArticles || []).map(a => a.slug))

  // 未発行の記事を検索(ID順)
  for (const article of ARTICLE_TITLES) {
    if (!publishedSlugs.has(article.id)) {
      return article
    }
  }

  // すべて発行済みの場合は null
  return null
}

// ───── Helper: Claude Haiku で記事生成 ─────

async function generateArticle(title: string, slug: string, cluster: string): Promise<string> {
  const client = new Anthropic()

  const systemPrompt = `あなたは SalonRink(美容師向け AI カルテ SaaS)の専属ライターです。
美容師さんに役立つ、SEO 最適化された記事を書きます。

ルール:
- 1800-2200字程度
- 見出し(## H2)を3-5個使う
- 具体的な数字・例を交える
- 読み手は40-50代のサロン経営者を想定
- 「SalonRink」のサービス名は使えない(商標問題)
- 代わりに「AIカルテ」「事前カウンセリング」「美容師向けSaaS」と表現
- 法令準拠(架空体験談NG、虚偽数値NG)
- 記事末尾に CTA: 「無料で AI カルテを試す」
- マークダウン形式で出力(Frontmatter なし、本文のみ)`

  const userPrompt = `以下のタイトルで記事を執筆してください。

タイトル: ${title}
クラスタ: ${cluster}
スラッグ: ${slug}

出力は本文のみ(Frontmatter は含めない)。
見出しは ## H2 で開始。
1800-2200字、見出し3-5個。`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text.trim()
}

// ───── Helper: Slack に公開通知 ─────

async function sendToSlack(title: string, slug: string, cluster: string, excerpt: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('[generate-blog-post] SLACK_WEBHOOK_URL not configured, skipping notification')
    return false
  }

  const slackPayload = {
    text: `📝 新しいブログ記事が公開されました`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📝 新しいブログ記事が公開されました' },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${title}*\n\`${cluster}\`` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `_${excerpt}_` },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<https://salonrink.com/blog/${slug}|記事を読む>`,
        },
      },
    ],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    })

    if (!response.ok) {
      console.error(`[generate-blog-post] Slack error: ${response.status}`)
      return false
    }

    console.log('[generate-blog-post] Slack notification sent')
    return true
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[generate-blog-post] Slack error: ${errMsg}`)
    return false
  }
}

// ───── Main Cron Handler ─────

async function handleCronRequest(request: NextRequest): Promise<NextResponse> {
  // 認証チェック
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    )
  }

  if (!validateCronSecret(request)) {
    console.warn('Unauthorized cron request: generate-blog-post')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const result: CronResponse = {
    success: false,
  }

  try {
    const supabase = createAdminClient()

    // Step 1: 次の記事を選択
    console.log('[generate-blog-post] Selecting next article...')
    const article = await selectNextArticle(supabase)

    if (!article) {
      console.log('[generate-blog-post] No unpublished articles available')
      return NextResponse.json(
        { success: true, message: 'No unpublished articles' },
        { status: 200 }
      )
    }

    console.log(`[generate-blog-post] Selected: ${article.title} (${article.id})`)

    // Step 2: Claude で記事本文生成
    console.log('[generate-blog-post] Generating content with Claude...')
    const content = await generateArticle(article.title, article.id, article.cluster)

    // excerpt を自動抽出(最初の120-150字)
    const excerpt = content.substring(0, 150).replace(/\n/g, ' ').trim() + '...'

    // Step 3: Supabase に保存
    console.log('[generate-blog-post] Saving to Supabase...')
    const { data: inserted, error: insertError } = await supabase
      .from('blog_articles')
      .insert({
        slug: article.id,
        title: article.title,
        cluster: article.cluster,
        excerpt: excerpt,
        content: content,
        image_url: `https://picsum.photos/800/450?random=${article.id}`,
        published_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      throw new Error(`Failed to insert article: ${insertError.message}`)
    }

    console.log(`[generate-blog-post] Article saved: ${article.id}`)

    // Step 4: Slack に通知
    console.log('[generate-blog-post] Sending Slack notification...')
    const slackSent = await sendToSlack(article.title, article.id, article.cluster, excerpt)

    result.success = true
    result.slug = article.id
    result.title = article.title
    result.cluster = article.cluster
    result.published_at = new Date().toISOString()
    result.slackSent = slackSent

    console.log('[generate-blog-post] Complete')

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate-blog-post] Fatal error:', errMsg)

    return NextResponse.json(
      {
        success: false,
        error: errMsg,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleCronRequest(request)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleCronRequest(request)
}
