/**
 * GET/POST /api/cron/sdr-draft
 * SDR営業アウトバウンド ドラフト自動生成
 *
 * Flow:
 * 1. agents_config から (agent='sdr', tenant_id='salonrink', enabled=true) を取得
 * 2. daily_cap に基づき salon_prospects から status='new' AND opted_out=false AND email有 を取得
 * 3. Claude Haiku (claude-haiku-4-5-20251001) で営業メール下書き生成（subject + html）
 * 4. 禁止語lint（絶対/No.1/日本一/治る/最高/保証/効果/確実）
 * 5. agent_actions 挿入（status='pending', expires_at=48h後, tier='B'）
 * 6. salon_prospects.status='drafted' に更新
 * 7. owner へ承認Flex push（@901bsvrb / owner_line_links の active userId）
 *
 * Cron: 日次（平日朝が推奨）
 * 認証: X-Vercel-Cron ヘッダ or Authorization Bearer CRON_SECRET
 * Dry-run: ?dry=1 クエリで送信せず確認
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { Anthropic } from '@anthropic-ai/sdk'
import type { SalonProspect, AgentConfig, SdrDraftResult, OutboundEmailPayload } from '@/lib/types/agent'

const MODEL = 'claude-haiku-4-5-20251001'
const TENANT_ID = 'salonrink'
const AGENT_ID = 'sdr'

// 禁止語リスト（※否定注記は可）
const PROHIBITED_WORDS = ['絶対', 'No.1', '日本一', '治る', '最高', '保証', '効果', '確実']

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

async function generateSdrDraft(prospect: SalonProspect): Promise<string | null> {
  try {
    const client = new Anthropic()

    const prompt = `以下のサロンへの営業メールドラフトを生成してください。

【対象サロン】
- サロン名: ${prospect.salon_name}
- 担当者: ${prospect.contact_name}
- 地域: ${prospect.region}
- URL: ${prospect.url}

【要件】
- 形式: "【件名】〇〇〇〇\n【本文】△△△△"
- 文体: です・ます（丁寧・ビジネス）
- 禁止語を含めない: 絶対, No.1, 日本一, 治る, 最高, 保証, 効果, 確実
- HTML本文: <html><body>...</body></html> 形式で、<p><h2> 等で段落化
- 内容: SalonRink Concierge の紹介、LINE業務自動化の価値、穏当で好感度の高いトーン
- 長さ: メール件名 50字以内、本文 300-500字

【例】
【件名】${prospect.contact_name}さんへ：LINE業務の自動化ツール
【本文】<html><body><p>${prospect.contact_name}さんへ</p><p>いつもお疲れ様です。</p>...(続く)</body></html>`

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
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
    console.error('[generateSdrDraft] Error:', error)
    throw error
  }
}

function parseSdrDraft(draftText: string): { subject: string; html: string; isValid: boolean } {
  const subjectMatch = draftText.match(/【件名】(.+?)(?:\n|【本文】)/)
  const htmlMatch = draftText.match(/【本文】([\s\S]+)$/)

  const subject = subjectMatch ? subjectMatch[1].trim() : ''
  const html = htmlMatch ? htmlMatch[1].trim() : ''

  const isValid = subject.length > 0 && html.length > 0

  return { subject, html, isValid }
}

async function handleSdrDraft(isDryRun: boolean): Promise<SdrDraftResult> {
  const result: SdrDraftResult = {
    success: false,
    drafted: 0,
    inserted: 0,
    errors: [],
  }

  try {
    console.log(`[SDR Draft Cron] Starting... (dry_run=${isDryRun})`)

    const supabase = createAdminClient()

    // Step 1: agents_config から SDR設定を取得
    const { data: configRow, error: configErr } = await supabase
      .from('agents_config')
      .select('*')
      .eq('agent', AGENT_ID)
      .eq('tenant_id', TENANT_ID)
      .maybeSingle()

    if (configErr) {
      console.error('[SDR Draft Cron] Config fetch error:', configErr)
      return {
        ...result,
        error: 'Failed to fetch agents_config',
      }
    }

    if (!configRow) {
      console.log('[SDR Draft Cron] SDR config not found, skipping')
      return {
        ...result,
        success: true,
        error: 'SDR config not found (expected if disabled)',
      }
    }

    const config = configRow as AgentConfig
    if (!config.enabled) {
      console.log('[SDR Draft Cron] SDR is disabled (enabled=false)')
      return {
        ...result,
        success: true,
        error: 'SDR config disabled',
      }
    }

    // Step 2: salon_prospects から新規＆オプトアウト未設定＆メールアドレス有を取得
    const { data: prospects, error: fetchErr } = await supabase
      .from('salon_prospects')
      .select('*')
      .eq('status', 'new')
      .eq('opted_out', false)
      .not('email', 'is', null)
      .limit(config.daily_cap)

    if (fetchErr || !prospects) {
      console.error('[SDR Draft Cron] Fetch prospects error:', fetchErr)
      return {
        ...result,
        error: 'Failed to fetch prospects',
      }
    }

    console.log(`[SDR Draft Cron] Found ${prospects.length} prospects to draft (cap=${config.daily_cap})`)
    result.drafted = prospects.length

    // Step 3-7: 各prospect ごとに処理
    for (const prospect of prospects) {
      try {
        const p = prospect as SalonProspect

        // 重複チェック（未実装但し future-proof）
        const { data: existing } = await supabase
          .from('agent_actions')
          .select('id')
          .eq('salon_id', p.id)
          .eq('agent', AGENT_ID)
          .eq('status', 'pending')
          .limit(1)

        if (existing && existing.length > 0) {
          console.log(`[SDR Draft Cron] Prospect ${p.id} already has pending action, skip`)
          result.errors?.push(`Prospect ${p.id}: Duplicate pending action`)
          continue
        }

        // Step 3: Claude Haiku でドラフト生成
        let draftText: string | null = null
        try {
          draftText = await generateSdrDraft(p)
        } catch (genErr) {
          const errMsg = genErr instanceof Error ? genErr.message : String(genErr)
          console.error(`[SDR Draft Cron] generateSdrDraft threw for prospect ${p.id}:`, errMsg)
          result.errors?.push(`Prospect ${p.id}: Draft generation failed: ${errMsg}`)
          continue
        }

        if (!draftText) {
          console.warn(`[SDR Draft Cron] Prospect ${p.id}: Draft generation returned null`)
          result.errors?.push(`Prospect ${p.id}: Draft generation returned null`)
          continue
        }

        console.log(`[SDR Draft Cron] Generated draft for prospect ${p.id}`)

        // Step 4: Parse draft
        const { subject, html, isValid } = parseSdrDraft(draftText)

        if (!isValid || !subject || !html) {
          console.warn(
            `[SDR Draft Cron] Prospect ${p.id}: Invalid draft (isValid=${isValid}, subject=${!!subject}, html=${!!html})`
          )
          result.errors?.push(`Prospect ${p.id}: Invalid draft format`)
          continue
        }

        // Step 5: Lint check（禁止語フィルタ）
        const prohibitedInSubject = PROHIBITED_WORDS.find((word) => subject.includes(word))
        const prohibitedInHtml = PROHIBITED_WORDS.find((word) => html.includes(word))

        if (prohibitedInSubject || prohibitedInHtml) {
          const prohibitedWord = prohibitedInSubject || prohibitedInHtml
          console.warn(
            `[SDR Draft Cron] Prospect ${p.id}: Prohibited word '${prohibitedWord}' detected, discarding`
          )
          result.errors?.push(`Prospect ${p.id}: Prohibited word detected: ${prohibitedWord}`)
          continue
        }

        // Step 6: agent_actions に挿入
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        const payload: OutboundEmailPayload = {
          prospect_id: p.id,
          email: p.email,
          salon_name: p.salon_name,
          contact_name: p.contact_name,
          subject,
          html,
          expires_at: expiresAt,
        }

        if (isDryRun) {
          console.log(`[SDR Draft Cron] DRY-RUN: Would insert agent_action for prospect ${p.id}`)
          console.log(`[SDR Draft Cron]   subject: ${subject}`)
          console.log(`[SDR Draft Cron]   email: ${p.email}`)
          console.log(`[SDR Draft Cron]   html (first 100 chars): ${html.substring(0, 100)}...`)
          result.inserted++
          continue
        }

        const { data: inserted, error: insertErr } = await supabase
          .from('agent_actions')
          .insert({
            tenant_id: TENANT_ID,
            salon_id: p.id,
            agent: AGENT_ID,
            tier: 'B',
            type: 'outbound_email',
            title: subject,
            payload,
            status: 'pending',
            result: null,
            expires_at: expiresAt,
          } as any)
          .select('id')
          .maybeSingle()

        if (insertErr || !inserted) {
          console.error(`[SDR Draft Cron] Insert error for prospect ${p.id}:`, insertErr)
          result.errors?.push(`Prospect ${p.id}: Failed to insert agent_actions`)
          continue
        }

        console.log(`[SDR Draft Cron] Inserted agent_action ${inserted.id} for prospect ${p.id}`)

        // Step 7: salon_prospects.status を 'drafted' に更新
        const { error: updateErr } = await supabase
          .from('salon_prospects')
          .update({
            status: 'drafted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', p.id)

        if (updateErr) {
          console.error(`[SDR Draft Cron] Failed to update prospect status for ${p.id}:`, updateErr)
          result.errors?.push(`Prospect ${p.id}: Failed to update status`)
          continue
        }

        // Step 8: owner へ承認Flex push
        try {
          const { pushFlexSdrApproval } = await import('@/lib/approval/push-flex-sdr-approval')
          await pushFlexSdrApproval(inserted.id, p, subject)
          console.log(`[SDR Draft Cron] Flex pushed for agent_action ${inserted.id}`)
        } catch (pushErr) {
          console.error(`[SDR Draft Cron] Flex push failed for agent_action ${inserted.id}:`, pushErr)
          result.errors?.push(`Agent action ${inserted.id}: Flex push failed`)
        }

        result.inserted++
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error(`[SDR Draft Cron] Error processing prospect ${prospect.id}:`, errMsg)
        result.errors?.push(`Prospect ${prospect.id}: ${errMsg}`)
      }
    }

    result.success = true
    console.log(`[SDR Draft Cron] Complete: drafted=${result.drafted}, inserted=${result.inserted}`)

    return result
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[SDR Draft Cron] Fatal error:', errMsg)
    return {
      ...result,
      error: errMsg,
    }
  }
}

export async function GET(request: Request) {
  if (!validateCronSecret(request)) {
    console.error('[SDR Draft Cron] Invalid CRON_SECRET')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const isDryRun = url.searchParams.get('dry') === '1'

  const response = await handleSdrDraft(isDryRun)
  return new Response(JSON.stringify(response), {
    status: response.success ? 200 : 500,
  })
}

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    console.error('[SDR Draft Cron] Invalid CRON_SECRET')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const isDryRun = url.searchParams.get('dry') === '1'

  const response = await handleSdrDraft(isDryRun)
  return new Response(JSON.stringify(response), {
    status: response.success ? 200 : 500,
  })
}
