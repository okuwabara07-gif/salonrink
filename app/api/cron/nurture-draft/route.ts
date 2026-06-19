/**
 * GET/POST /api/cron/nurture-draft
 * 日次ドラフト自動生成 → approval_queue 投入（メール前提）
 *
 * Flow:
 * 1. funnel_leads から email IS NOT NULL, status='new' を抽出（LIMIT 20）
 * 2. Claude Haiku で文面生成（subject, html）
 * 3. lintゲート（禁止語フィルタ）
 * 4. approval_queue に kind='nurture_msg' で INSERT
 * 5. owner へ承認Flex push（pushFlexApproval）
 *
 * Cron: 平日朝（月-金 7時）
 * 認証: X-Vercel-Cron ヘッダ or Authorization Bearer
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { Anthropic } from '@anthropic-ai/sdk'
import type { ApprovalQueue } from '@/lib/types/approval'

interface CronResponse {
  success: boolean
  generated: number
  inserted: number
  errors?: string[]
  error?: string
}

const PROHIBITED_WORDS = ['絶対', 'No.1', '日本一', '治る']

function validateCronSecret(request: Request): boolean {
  const vercelCronHeader = request.headers.get('x-vercel-cron')
  if (vercelCronHeader) {
    return true
  }

  const authHeader = request.headers.get('authorization') || ''
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return false
  }

  const expectedAuth = `Bearer ${secret}`
  return authHeader === expectedAuth
}

function containsProhibited(text: string): boolean {
  return PROHIBITED_WORDS.some((word) => text.includes(word))
}

async function handleNurtureDraft(): Promise<CronResponse> {
  const response: CronResponse = {
    success: false,
    generated: 0,
    inserted: 0,
    errors: [],
  }

  try {
    console.log('[Nurture Draft Cron] Starting...')

    const supabase = createAdminClient()

    // Step 1: funnel_leads から新規＆メールアドレス保有を抽出
    const { data: leads, error: fetchErr } = await supabase
      .from('funnel_leads')
      .select('id, contact_name, email')
      .eq('status', 'new')
      .not('email', 'is', null)
      .limit(20)

    if (fetchErr || !leads) {
      console.error('[Nurture Draft Cron] Fetch leads error:', fetchErr)
      return {
        ...response,
        error: 'Failed to fetch leads',
      }
    }

    console.log(`[Nurture Draft Cron] Found ${leads.length} new leads with email`)
    response.generated = leads.length

    // Step 2-5: 各lead ごとに処理
    for (const lead of leads) {
      try {
        // Step 2a: 同一lead への pending チェック（重複防止）
        const { data: existing } = await supabase
          .from('approval_queue')
          .select('id')
          .eq('lead_id', lead.id)
          .eq('status', 'pending')
          .eq('kind', 'nurture_msg')
          .limit(1)

        if (existing && existing.length > 0) {
          console.log(`[Nurture Draft Cron] Lead ${lead.id} already has pending approval, skip`)
          continue
        }

        // Step 2b: Claude Haiku で文面生成
        const draftText = await generateDraft(lead.contact_name || 'お客様')
        if (!draftText) {
          response.errors?.push(`Lead ${lead.id}: Draft generation failed`)
          continue
        }

        console.log(`[Nurture Draft Cron] Raw draft for lead ${lead.id}:`, draftText)

        // Step 2c: parseDraft で subject/html を抽出
        const { subject, html, isValid } = parseDraft(draftText)
        console.log(`[Nurture Draft Cron] Parsed for lead ${lead.id}:`, { isValid, subject, html })

        // Step 2d: 空チェック＆lintゲート（禁止語フィルタ）
        if (!isValid || !subject || !html) {
          console.warn(
            `[Nurture Draft Cron] Lead ${lead.id}: Invalid draft (isValid=${isValid}, subject=${!!subject}, html=${!!html}), skipping`
          )
          response.errors?.push(`Lead ${lead.id}: Invalid draft format or empty subject/html`)
          continue
        }

        if (containsProhibited(subject) || containsProhibited(html)) {
          console.warn(`[Nurture Draft Cron] Lead ${lead.id}: Prohibited word detected, discarding`)
          response.errors?.push(`Lead ${lead.id}: Prohibited word detected`)
          continue
        }

        // Step 3: payload 構築（email必須チェック）
        if (!lead.email) {
          console.warn(`[Nurture Draft Cron] Lead ${lead.id}: No email, skipping`)
          response.errors?.push(`Lead ${lead.id}: No email address`)
          continue
        }

        const payload: Record<string, unknown> = {
          channel: 'email',
          lead_id: lead.id,
          message_data: {
            email: lead.email,
            subject,
            html,
          },
        }

        console.log(`[Nurture Draft Cron] Final payload for lead ${lead.id}:`, JSON.stringify(payload))

        const { data: inserted, error: insertErr } = await supabase
          .from('approval_queue')
          .insert({
            lead_id: lead.id,
            kind: 'nurture_msg',
            payload,
            lint_status: 'pass',
            status: 'pending',
          } as unknown as ApprovalQueue)
          .select('id')
          .maybeSingle()

        if (insertErr || !inserted) {
          console.error(`[Nurture Draft Cron] Insert error for lead ${lead.id}:`, insertErr)
          response.errors?.push(`Lead ${lead.id}: Failed to insert approval_queue`)
          continue
        }

        console.log(`[Nurture Draft Cron] Inserted approval ${inserted.id} for lead ${lead.id}`)

        // Step 4: owner へ承認Flex push
        try {
          const { pushFlexApproval } = await import('@/lib/approval/push-flex-approval')
          const approvalRow: ApprovalQueue = {
            id: inserted.id,
            lead_id: lead.id,
            kind: 'nurture_msg',
            payload,
            lint_status: 'pass',
            status: 'pending',
            created_at: new Date().toISOString(),
          }
          await pushFlexApproval(approvalRow)
          console.log(`[Nurture Draft Cron] Flex pushed for approval ${inserted.id}`)
        } catch (pushErr) {
          console.error(`[Nurture Draft Cron] Flex push failed:`, pushErr)
          response.errors?.push(`Approval ${inserted.id}: Flex push failed`)
        }

        response.inserted++
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error(`[Nurture Draft Cron] Error processing lead ${lead.id}:`, errMsg)
        response.errors?.push(`Lead ${lead.id}: ${errMsg}`)
      }
    }

    response.success = true
    console.log(
      `[Nurture Draft Cron] Complete: generated=${response.generated}, inserted=${response.inserted}`
    )

    return response
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[Nurture Draft Cron] Fatal error:', errMsg)
    return {
      ...response,
      error: errMsg,
    }
  }
}

export async function GET(request: Request) {
  if (!validateCronSecret(request)) {
    console.error('[Nurture Draft Cron] Invalid CRON_SECRET')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const response = await handleNurtureDraft()
  return new Response(JSON.stringify(response), {
    status: response.success ? 200 : 500,
  })
}

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    console.error('[Nurture Draft Cron] Invalid CRON_SECRET')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const response = await handleNurtureDraft()
  return new Response(JSON.stringify(response), {
    status: response.success ? 200 : 500,
  })
}

async function generateDraft(contactName: string): Promise<string | null> {
  try {
    const client = new Anthropic()

    const prompt = `顧客 "${contactName}" さんへの再来店フォロー メール（件名 + 本文）をドラフト生成してください。

【要件】
- 形式: "【件名】〇〇〇〇\n【本文】△△△△"
- 文体: です・ます（敬語）
- 禁止語を含めない: 絶対, No.1, 日本一, 治る
- 数値は必ず "※シミュレーション" 注記を付ける
- 内容: サロン再来訪の提案、カルテAI解析の価値、穏当なトーン
- HTML本文: <html><body>...</body></html> 形式で、p/hなどで段落化

【例】
【件名】${contactName}さんへのカルテ確認のお知らせ
【本文】<html><body><p>お疲れ様です。</p><p>先日はご来店いただきありがとうございました。</p></body></html>`

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return null
    }

    return content.text
  } catch (error) {
    console.error('[generateDraft] Error:', error)
    return null
  }
}

function parseDraft(draftText: string): { subject: string; html: string; isValid: boolean } {
  const subjectMatch = draftText.match(/【件名】(.+?)(?:\n|【本文】)/)
  const htmlMatch = draftText.match(/【本文】([\s\S]+)$/)

  const subject = subjectMatch ? subjectMatch[1].trim() : ''
  const html = htmlMatch ? htmlMatch[1].trim() : ''

  const isValid = subject.length > 0 && html.length > 0

  return { subject, html, isValid }
}
