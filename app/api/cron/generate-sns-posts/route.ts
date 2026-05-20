/**
 * POST/GET /api/cron/generate-sns-posts
 * Vercel Cron: 毎日 22:00 UTC (翌日 07:00 JST) 実行
 *
 * 役割:
 * - 曜日に応じてテーマを選択
 * - Claude Haiku で SNS 投稿案生成(X 3本 + Threads 3本 + Instagram 1本)
 * - Slack Webhook に整形して配信
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

interface SNSPost {
  type: string
  text: string
}

interface ThreadsPost {
  type: string
  text: string
}

interface InstagramPost {
  caption: string
}

interface GeneratedPosts {
  x: SNSPost[]
  threads: ThreadsPost[]
  instagram: InstagramPost
}

interface CronResponse {
  success: boolean
  theme: string
  generated: {
    x: number
    threads: number
    instagram: number
  }
  slackSent: boolean
  error?: string
}

// ───── Themes by Day of Week ─────

const THEMES: Record<number, string> = {
  0: '日: モチベーション系(美容師の仕事への思い)',
  1: '月: 認知拡大(サービス紹介、Salon業界の課題)',
  2: '火: 機能訴求(AI カルテで何が変わるか)',
  3: '水: 美容師あるある(共感ネタ)',
  4: '木: お客様目線(覚えてもらえる安心感)',
  5: '金: 月25時間訴求(時間の価値)',
  6: '土: 業界トレンド(美容業界の最新動向)',
}

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

// ───── Helper: Claude Haiku で投稿案生成 ─────

async function generateSNSPosts(theme: string): Promise<GeneratedPosts> {
  const client = new Anthropic()

  const systemPrompt = `あなたは SalonRink(美容師向け AI カルテ SaaS)のSNS担当です。
美容師さんに刺さる、自然で押し付けがましくない投稿を作ります。

重要ルール:
- 「SalonRink」のサービス名は商標問題があるので使わない
- 「AIカルテ」「事前カウンセリング」「美容師向けSaaS」など機能名で訴求
- 押し売り禁止、自然な「あるある」「気づき」スタイル
- 絵文字は適度に(過剰NG)
- 月¥1,980 などの価格は出さない(認知拡大用)
- 法令準拠(架空体験談NG、実在しない数値NG)`

  const userPrompt = `今日のテーマ: ${theme}

以下のSNS用に投稿案を考えてください。

【X (Twitter)】文字数 140字以内、3パターン
- type1: 共感系(美容師あるある)
- type2: 機能訴求(具体的なメリット)
- type3: 質問形式(エンゲージメント狙い)

【Threads】文字数 500字以内、3パターン
- type1: 物語形式(短いエピソード)
- type2: 問いかけ + 解決提示
- type3: データ訴求

【Instagram】キャプション本文 + ハッシュタグ、合計2000字以内
- 本文400字程度の美容師さんの感情に訴える物語形式
- 本文末尾に改行2つ空けて、ハッシュタグを10〜15個生成
- ハッシュタグは3層バランスで構成すること:
  * 大ハッシュタグ(投稿数10万以上、4〜5個): #美容師 #美容室 #サロン #ヘアサロン #美容業界 等から選択
  * 中ハッシュタグ(投稿数1〜10万、4〜5個): #サロン経営 #美容師の悩み #サロンオーナー #美容師求人 #サロン集客 #予約管理 等から選択
  * 小ハッシュタグ(投稿数1万以下、3〜5個): #AIカルテ #サロンコンシェルジュ #サロンDX #美容師向けSaaS #事前カウンセリング 等から選択
- ハッシュタグは投稿テーマと内容に関連するものを優先
- 全て半角#で始め、スペース区切り

以下のJSON形式で返してください(他の文章は含めない):
{
  "x": [
    { "type": "共感系", "text": "投稿文" },
    { "type": "機能訴求", "text": "投稿文" },
    { "type": "質問形式", "text": "投稿文" }
  ],
  "threads": [
    { "type": "物語", "text": "投稿文" },
    { "type": "問いかけ", "text": "投稿文" },
    { "type": "データ", "text": "投稿文" }
  ],
  "instagram": {
    "caption": "キャプション本文"
  }
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
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

  let jsonText = content.text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim()
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*/, '').replace(/```\s*$/, '').trim()
  }

  const generatedPosts = JSON.parse(jsonText) as GeneratedPosts
  return generatedPosts
}

// ───── Helper: IGトークンをSupabaseから取得 ─────

interface IgTokenRow {
  access_token: string
  ig_business_id: string
}

async function getIgToken(): Promise<IgTokenRow> {
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !supaKey) {
    throw new Error('Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)')
  }
  const res = await fetch(
    `${supaUrl}/rest/v1/ig_tokens?id=eq.salonrink&select=access_token,ig_business_id`,
    { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } }
  )
  if (!res.ok) {
    throw new Error(`getIgToken: supabase fetch failed ${res.status}`)
  }
  const rows = (await res.json()) as IgTokenRow[]
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('getIgToken: ig_tokens row not found')
  }
  return rows[0]
}

// ───── Helper: public/ig/ から日付ベースで連続3枚を選択 ─────

function pickCarouselImageUrls(count: number = 3): string[] {
  const fs = require('fs') as typeof import('fs')
  const path = require('path') as typeof import('path')
  const igDir = path.join(process.cwd(), 'public', 'ig')
  let files: string[] = []
  try {
    files = fs
      .readdirSync(igDir)
      .filter((f: string) => /\.(png|jpe?g)$/i.test(f))
      .sort()
  } catch {
    return []
  }
  if (files.length === 0) return []

  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const base = (dayOfYear * count) % files.length

  const baseUrl = 'https://salonrink.com/ig/'
  const picks: string[] = []
  for (let i = 0; i < count; i++) {
    picks.push(baseUrl + files[(base + i) % files.length])
  }
  return picks
}

// ───── Helper: IGカルーセル投稿(3段階) ─────

interface IgPostResult {
  success: boolean
  postId?: string
  imageUrls: string[]
  error?: string
}

async function postCarouselToInstagram(caption: string, imageUrls: string[]): Promise<IgPostResult> {
  if (imageUrls.length === 0) {
    return { success: false, imageUrls, error: 'no images available in public/ig/' }
  }
  let token: IgTokenRow
  try {
    token = await getIgToken()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return { success: false, imageUrls, error: `token fetch failed: ${msg}` }
  }
  const { access_token: accessToken, ig_business_id: igId } = token
  const api = `https://graph.facebook.com/v21.0/${igId}`

  try {
    const childIds: string[] = []
    for (const url of imageUrls) {
      const form = new URLSearchParams()
      form.set('image_url', url)
      form.set('is_carousel_item', 'true')
      form.set('access_token', accessToken)
      const r = await fetch(`${api}/media`, { method: 'POST', body: form })
      const j = await r.json()
      if (!j.id) {
        throw new Error(`child container failed for ${url}: ${JSON.stringify(j).slice(0, 200)}`)
      }
      childIds.push(j.id as string)
    }

    const parentForm = new URLSearchParams()
    parentForm.set('media_type', 'CAROUSEL')
    parentForm.set('children', childIds.join(','))
    parentForm.set('caption', caption)
    parentForm.set('access_token', accessToken)
    const pr = await fetch(`${api}/media`, { method: 'POST', body: parentForm })
    const pj = await pr.json()
    if (!pj.id) {
      throw new Error(`parent container failed: ${JSON.stringify(pj).slice(0, 200)}`)
    }
    const parentId = pj.id as string

    await new Promise((res) => setTimeout(res, 5000))
    const pubForm = new URLSearchParams()
    pubForm.set('creation_id', parentId)
    pubForm.set('access_token', accessToken)
    const ur = await fetch(`${api}/media_publish`, { method: 'POST', body: pubForm })
    const uj = await ur.json()
    if (!uj.id) {
      throw new Error(`publish failed: ${JSON.stringify(uj).slice(0, 200)}`)
    }
    return { success: true, postId: uj.id as string, imageUrls }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return { success: false, imageUrls, error: msg }
  }
}

// ───── Helper: Slack に投稿案を送信 ─────

async function sendToSlack(theme: string, posts: GeneratedPosts): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('[generate-sns-posts] SLACK_WEBHOOK_URL not configured, skipping Slack notification')
    return false
  }

  const today = new Date()
  const dateString = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const slackPayload = {
    text: `🌅 今日のSNS投稿案 - ${dateString}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🌅 今日のSNS投稿案 - ${dateString}` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*今日のテーマ:* ${theme}` },
      },
      { type: 'divider' },

      // X セクション
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*📱 X (Twitter) - 3本*' },
      },
      ...posts.x.map((post) => ({
        type: 'section',
        text: { type: 'mrkdwn', text: `*${post.type}*\n\`\`\`${post.text}\`\`\`` },
      })),

      { type: 'divider' },

      // Threads セクション
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*🧵 Threads - 3本*' },
      },
      ...posts.threads.map((post) => ({
        type: 'section',
        text: { type: 'mrkdwn', text: `*${post.type}*\n\`\`\`${post.text}\`\`\`` },
      })),

      { type: 'divider' },

      // Instagram セクション
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*📷 Instagram キャプション*' },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `\`\`\`${posts.instagram.caption}\`\`\`` },
      },

      { type: 'divider' },

      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: '💡 気に入った投稿を選んで、コピーして手動投稿してください' }],
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
      console.error(`[generate-sns-posts] Slack webhook error: ${response.status} ${response.statusText}`)
      return false
    }

    console.log('[generate-sns-posts] Slack notification sent successfully')
    return true
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[generate-sns-posts] Failed to send Slack notification: ${errMsg}`)
    return false
  }
}

// ───── Main Cron Handler ─────

async function handleCronRequest(request: NextRequest): Promise<NextResponse> {
  // 認証チェック
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      {
        error: 'CRON_SECRET not configured',
        message: 'Environment variable CRON_SECRET is required',
      },
      { status: 500 }
    )
  }

  if (!validateCronSecret(request)) {
    console.warn('Unauthorized cron request: generate-sns-posts')
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing authorization' },
      { status: 401 }
    )
  }

  const result: CronResponse = {
    success: false,
    theme: '',
    generated: { x: 0, threads: 0, instagram: 0 },
    slackSent: false,
  }

  try {
    // テーマ選択
    const today = new Date()
    const dayOfWeek = today.getDay()
    const theme = THEMES[dayOfWeek]

    result.theme = theme
    console.log(`[generate-sns-posts] Starting SNS post generation for theme: ${theme}`)

    // Claude で投稿案生成
    console.log('[generate-sns-posts] Calling Claude Haiku API...')
    const generatedPosts = await generateSNSPosts(theme)

    result.generated.x = generatedPosts.x.length
    result.generated.threads = generatedPosts.threads.length
    result.generated.instagram = 1
    // ─── IG実投稿 ─── (patch)
    let igPostStatus = '未実行'
    try {
      const imageUrls = pickCarouselImageUrls(3)
      if (imageUrls.length === 0) {
        igPostStatus = 'スキップ(public/ig/に画像なし)'
        console.warn('[generate-sns-posts] IG投稿スキップ: 画像が無い')
      } else {
        console.log(`[generate-sns-posts] IGカルーセル投稿開始 (${imageUrls.length}枚)`)
        const igResult = await postCarouselToInstagram(generatedPosts.instagram.caption, imageUrls)
        if (igResult.success) {
          igPostStatus = `成功(post_id=${igResult.postId})`
          console.log(`[generate-sns-posts] IG投稿成功: ${igResult.postId}`)
        } else {
          igPostStatus = `失敗(${igResult.error})`
          console.error(`[generate-sns-posts] IG投稿失敗: ${igResult.error}`)
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown'
      igPostStatus = `エラー(${msg})`
      console.error(`[generate-sns-posts] IG投稿例外: ${msg}`)
    }
    // ─── IG実投稿 ここまで ───


    console.log(
      `[generate-sns-posts] Generated: X=${result.generated.x}, Threads=${result.generated.threads}, Instagram=1`
    )

    // Slack に送信
    console.log('[generate-sns-posts] Sending to Slack...')
    const slackSent = await sendToSlack(theme, generatedPosts)
    result.slackSent = slackSent

    result.success = true
    console.log('[generate-sns-posts] Complete')

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate-sns-posts] Fatal error:', errMsg)

    return NextResponse.json(
      {
        success: false,
        error: errMsg,
        theme: result.theme,
        generated: result.generated,
        slackSent: result.slackSent,
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
