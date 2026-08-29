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
  pillar: string
  hookText: string
  caption: string
  hashtags: string[]
  cardContents: string[]
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

// ───── 5 Pillars for Instagram Rotation ─────

const PILLARS = [
  '客離れの真実',
  'AIカルテ活用',
  'LINE配信テク',
  '個人サロンあるある',
  '数字で見せるビフォーアフター',
]

function getPillarByDayOfYear(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return PILLARS[dayOfYear % PILLARS.length]
}

// ───── Helper: 認証チェック ─────

function validateCronSecret(request: NextRequest): boolean {
  // Vercel cron uses X-Vercel-Cron header for internal authentication
  const vercelCronHeader = request.headers.get('x-vercel-cron')
  if (vercelCronHeader) {
    return true
  }

  // For manual testing with Bearer token
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

  const systemPrompt = `あなたはフリーランス美容師・個人サロン経営者向けに SalonRink を訴求する SNS 担当です。
ターゲット: LINE 公式アカウントで顧客管理しているが「客離れ」に悩んでいる層。

Salon Rink のブランド世界観: "高級AIコンシェルジュ"
- Apple / Aesop / Aman のような「静かな高級感」
- 予約システムではなく「サロン経営を静かに支える存在」
- 説明ではなく、体験と余韻を重視

重要ルール:
- 「SalonRink」のサービス名は商標問題があるので使わない
- 「AIカルテ」「LINE配信」「顧客管理」「予約管理」など機能名で訴求
- 押し売り禁止、共感型「あるある」「気づき」スタイル
- 最後に CTA: 「→ 無料デモ salonrink.com/demo」を必ず入れる
- 絵文字は適度に(過剰NG)
- 月¥1,980 などの価格は出さない(認知拡大用)
- 法令準拠(架空体験談NG、実在しない数値NG)

【Instagram cardContents 新ルール】
- 各カード 10-25字、最大3文以内、「ホテルラウンジに置けるか?」基準
- 説明文・機能羅列は禁止、短く強い断言調
- 良い例: 「再来店は、感覚では増えない。」「AIが、次回来店を設計する。」「予約対応から、再来店設計まで。」「施術に集中できるサロンへ。」「サロン経営を、次の時代へ。」
- NG例: 「初回来店後の満足度は高いのに〜」（長文）「LINE公式アカウントと AIカルテで顧客情報を一元管理」（機能羅列）

【Instagram hookText 新ルール】
- 15-25字、断言調、短く強く
- 同じ「静かな高級感」世界観`

  const userPrompt = `今日の柱: ${theme}

以下のSNS用に投稿案を考えてください。

【X (Twitter)】文字数 140字以内、3パターン
- type1: 共感系(美容師あるある)
- type2: 機能訴求(具体的なメリット)
- type3: 質問形式(エンゲージメント狙い)

【Threads】文字数 500字以内、3パターン
- type1: 物語形式(短いエピソード)
- type2: 問いかけ + 解決提示
- type3: データ訴求

【Instagram】 5枚カルーセル投稿用メタデータ
- hookText(15-25字): 1枚目に大文字で焼き込む「掴み」テキスト。断言調、短く強く
  例: 「再来店は、感覚では増えない。」「AIが、次回来店を設計する。」
- caption(200-300字): 感情に訴える物語形式 + 末尾に CTA「→ 無料デモ salonrink.com/demo」
- cardContents(4本): 2-5枚目に配置するテキスト。【重要】各 10-25字、最大3文以内、断言調
  * 説明文・機能羅列は禁止
  * 「ホテルラウンジに置けるか?」基準で判断
  * 良い例: 「予約対応から、再来店設計まで。」「施術に集中できるサロンへ。」「サロン経営を、次の時代へ。」
  * NG例: 「初回来店後の満足度は高いのに〜」（長文）「LINE公式アカウントと AIカルテで顧客情報を一元管理」（機能羅列）
- hashtags(10本): 3層バランス
  * 大: #美容師 #美容室 #サロン #ヘアサロン #フリーランス美容師 等から3個
  * 中: #サロン経営 #美容師の悩み #客離れ防止 #LINE公式アカウント #予約管理 等から4個
  * 小: #AIカルテ #サロンDX #美容師向けSaaS #顧客管理 #カウンセリング 等から3個

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
    "pillar": "柱名（客離れの真実 / AIカルテ活用 / LINE配信テク / 個人サロンあるある / 数字で見せるビフォーアフター）",
    "hookText": "掴みテキスト15-25字、断言調",
    "caption": "キャプション本文200-300字",
    "hashtags": ["#フリーランス美容師", ...10本],
    "cardContents": ["2枚目テキスト10-25字、断言調", "3枚目10-25字", "4枚目10-25字", "5枚目最終CTA10-25字"]
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

// ───── Helper: 次に投稿すべき post_NNN フォルダを選定 ─────

interface PostPackage {
  postNumber: number
  folderName: string         // 例: "post_001"
  folderPath: string          // 絶対パス
  imageFilenames: string[]    // 例: ["card1.png", ..., "card5.png"]
  imageUrls: string[]         // 例: ["https://salonrink.com/ig/posts/post_001/card1.png", ...]
  captionPath: string | null  // caption.txt の絶対パス（存在しない場合 null）
  captionText: string | null  // caption.txt の中身（存在しない場合 null）
}

function pickNextPostPackage(): PostPackage | null {
  const fs = require('fs') as typeof import('fs')
  const path = require('path') as typeof import('path')
  const baseDir = path.join(process.cwd(), 'public', 'ig', 'posts')

  if (!fs.existsSync(baseDir)) {
    console.warn('[pickNextPostPackage] baseDir not found:', baseDir)
    return null
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true })
  const postFolders = entries
    .filter((e: any) => e.isDirectory() && /^post_\d{3,}$/.test(e.name))
    .map((e: any) => e.name)
    .sort() // post_001, post_002, ... の順

  for (const folderName of postFolders) {
    const folderPath = path.join(baseDir, folderName)
    const files = fs.readdirSync(folderPath)
    const cardFiles = ['card1.png', 'card2.png', 'card3.png', 'card4.png', 'card5.png']
    const allCardsPresent = cardFiles.every((f: string) => files.includes(f))

    if (!allCardsPresent) {
      console.warn(`[pickNextPostPackage] skip ${folderName}: cards incomplete`)
      continue
    }

    const m = folderName.match(/^post_(\d+)$/)
    if (!m) continue
    const postNumber = parseInt(m[1], 10)

    const baseUrl = 'https://salonrink.com'
    const imageUrls = cardFiles.map((f: string) => `${baseUrl}/ig/posts/${folderName}/${f}`)

    const captionPath = path.join(folderPath, 'caption.txt')
    let captionText: string | null = null
    if (fs.existsSync(captionPath)) {
      captionText = fs.readFileSync(captionPath, 'utf-8').trim()
    }

    return {
      postNumber,
      folderName,
      folderPath,
      imageFilenames: cardFiles,
      imageUrls,
      captionPath: fs.existsSync(captionPath) ? captionPath : null,
      captionText,
    }
  }

  console.warn('[pickNextPostPackage] no valid post folder found')
  return null
}

// ───── Helper: 投稿成功後、フォルダを _posted/ に移動 ─────

function markPostAsPosted(folderPath: string, folderName: string): void {
  const fs = require('fs') as typeof import('fs')
  const path = require('path') as typeof import('path')
  const postedDir = path.join(process.cwd(), 'public', 'ig', 'posts', '_posted')
  if (!fs.existsSync(postedDir)) {
    fs.mkdirSync(postedDir, { recursive: true })
  }
  const dstPath = path.join(postedDir, folderName)
  fs.renameSync(folderPath, dstPath)
  console.log(`[markPostAsPosted] moved ${folderName} → _posted/`)
}

// ───── DEPRECATED v1.1以降IG投稿には使われない。Slack通知やバックアップ用途のみ ─────

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
        text: { type: 'mrkdwn', text: '*📷 Instagram 5枚カルーセル*' },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*柱:* ${posts.instagram.pillar}\n*フック:* ${posts.instagram.hookText}` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*キャプション*\n\`\`\`${posts.instagram.caption}\`\`\`` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*カード本文*\n\`\`\`1️⃣ ${posts.instagram.cardContents[0]}\n2️⃣ ${posts.instagram.cardContents[1]}\n3️⃣ ${posts.instagram.cardContents[2]}\n4️⃣ ${posts.instagram.cardContents[3]}\`\`\`` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*ハッシュタグ*\n\`\`\`${posts.instagram.hashtags.join(' ')}\`\`\`` },
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
    // 柱選択（5柱を日次ローテーション）
    const today = new Date()
    const pillar = getPillarByDayOfYear(today)

    result.theme = pillar
    console.log(`[generate-sns-posts] Starting SNS post generation for pillar: ${pillar}`)

    // Claude で投稿案生成
    console.log('[generate-sns-posts] Calling Claude Haiku API...')
    const generatedPosts = await generateSNSPosts(pillar)

    result.generated.x = generatedPosts.x.length
    result.generated.threads = generatedPosts.threads.length
    result.generated.instagram = 1
    // ─── IG実投稿 v1.1: post_NNN フォルダ + 5枚カルーセル ─── (patch)
    let igPostStatus = '未実行'
    try {
      const postPackage = pickNextPostPackage()
      if (!postPackage) {
        igPostStatus = 'スキップ(public/ig/posts/にpost_NNNなし)'
        console.warn('[generate-sns-posts] IG投稿スキップ: 投稿可能なpost_NNNが無い')
      } else {
        console.log(`[generate-sns-posts] IGカルーセル投稿開始: ${postPackage.folderName} (${postPackage.imageUrls.length}枚)`)

        // caption.txt があればそれを優先、なければHaiku生成結果を使う
        const finalCaption = postPackage.captionText ?? generatedPosts.instagram.caption

        const igResult = await postCarouselToInstagram(finalCaption, postPackage.imageUrls)
        if (igResult.success) {
          igPostStatus = `成功(post_id=${igResult.postId}, folder=${postPackage.folderName})`
          console.log(`[generate-sns-posts] IG投稿成功: ${igResult.postId}`)
          // 投稿成功 → フォルダを _posted/ に移動（次回は post_002 が拾われる）
          try {
            markPostAsPosted(postPackage.folderPath, postPackage.folderName)
          } catch (e) {
            console.error(`[generate-sns-posts] _posted/移動失敗:`, e)
            // 移動失敗しても投稿自体は成功しているのでスローしない
          }
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
    const slackSent = await sendToSlack(pillar, generatedPosts)
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
