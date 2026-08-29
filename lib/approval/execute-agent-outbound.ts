/**
 * executeAgentOutbound
 * 承認済み SDR営業メールを送信（Resend + 特電法フッター）
 *
 * Flow:
 * 1. agent_actions.payload から prospect_id, email, subject, html 抽出
 * 2. HTML に特電法フッターを追加（AOKAE合同会社 / 配信停止リンク）
 * 3. Resend で送信（from=検証済みドメイン）
 * 4. 成功 → agent_actions.status='executed', result={ sent_at, email }
 * 5. エラー → agent_actions.status='failed', result={ error, email }
 * 6. salon_prospects.status='sent', last_outreach_at=now に更新
 */

import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AgentAction, OutboundEmailPayload } from '@/lib/types/agent'

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

function addLegalFooter(html: string, prospectEmail: string): string {
  // 配信停止リンク（unsubscribe）
  const unsubscribeUrl = `https://salonrink.com/unsubscribe?email=${encodeURIComponent(prospectEmail)}`

  const footer = `
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 32px 0;">
    <div style="font-size: 12px; color: #999; text-align: center; font-family: Arial, sans-serif;">
      <p>このメールは SalonRink より自動で送信されています。</p>
      <p>AOKAE 合同会社 <br>
      〒150-0001 東京都渋谷区神宮前1-1-1</p>
      <p><a href="${unsubscribeUrl}" style="color: #06C755; text-decoration: none;">配信停止する</a></p>
    </div>
  `

  // HTML の </body> の直前にフッターを挿入
  if (html.includes('</body>')) {
    return html.replace('</body>', footer + '\n</body>')
  }

  // </body> が無い場合は末尾に追加
  return html + footer
}

export async function executeAgentOutbound(
  agentActionId: string,
  agentAction: AgentAction,
  isDryRun: boolean = false
): Promise<void> {
  const admin = createAdminClient()

  try {
    const payload = agentAction.payload as unknown as OutboundEmailPayload
    const email = payload.email
    const subject = payload.subject
    const html = payload.html
    const prospectId = payload.prospect_id

    if (!email || !subject || !html) {
      console.error('[executeAgentOutbound] Missing email, subject, or html in payload')
      await admin
        .from('agent_actions')
        .update({
          status: 'failed',
          result: { error: 'Missing email, subject, or html in payload' },
        })
        .eq('id', agentActionId)
      return
    }

    const now = new Date().toISOString()

    if (isDryRun) {
      console.log(`[executeAgentOutbound] DRY-RUN: Would send email to ${email}`)
      console.log(`[executeAgentOutbound]   subject: ${subject}`)
      console.log(`[executeAgentOutbound]   html length: ${html.length}`)
      return
    }

    // HTML にフッターを追加
    const htmlWithFooter = addLegalFooter(html, email)

    // Resend で送信
    try {
      const result = await getResend().emails.send({
        from: 'noreply@salonrink.com',
        to: email,
        subject,
        html: htmlWithFooter,
      })

      if ('error' in result && result.error) {
        console.error('[executeAgentOutbound] Resend error:', result.error)
        await admin
          .from('agent_actions')
          .update({
            status: 'failed',
            result: {
              error: String(result.error),
              email,
              sent_at: now,
            },
          })
          .eq('id', agentActionId)
        return
      }

      // 成功
      console.log(`[executeAgentOutbound] Email sent successfully to ${email}`)

      // agent_actions を executed に更新
      const resendId = 'data' in result && result.data && typeof result.data === 'object' && 'id' in result.data ? (result.data as any).id : null
      await admin
        .from('agent_actions')
        .update({
          status: 'executed',
          result: {
            sent_at: now,
            email,
            resend_id: resendId,
          },
          executed_at: now,
        })
        .eq('id', agentActionId)

      // salon_prospects を updated
      await admin
        .from('salon_prospects')
        .update({
          status: 'sent',
          last_outreach_at: now,
          updated_at: now,
        })
        .eq('id', prospectId)
    } catch (sendErr) {
      console.error('[executeAgentOutbound] Send exception:', sendErr)
      const errMsg = sendErr instanceof Error ? sendErr.message : String(sendErr)
      await admin
        .from('agent_actions')
        .update({
          status: 'failed',
          result: {
            error: errMsg,
            email,
            sent_at: now,
          },
        })
        .eq('id', agentActionId)
    }
  } catch (error) {
    console.error('[executeAgentOutbound] Unexpected error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    await admin
      .from('agent_actions')
      .update({
        status: 'failed',
        result: {
          error: errMsg,
        },
      })
      .eq('id', agentActionId)
  }
}
