import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { classifyEmail } from '@/lib/ai/classify-email'
import { generateReply } from '@/lib/ai/generate-reply'
import { Resend } from 'resend'

interface ImprovMXPayload {
  headers?: Record<string, any>
  to?: Array<{ name?: string; email: string }>
  from?: { name?: string; email: string }
  subject?: string
  text?: string
  html?: string
}

async function sendAutoReply(
  toEmail: string,
  toName: string | null,
  originalSubject: string,
  replyText: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  const resend = new Resend(apiKey)
  const subjectPrefix = originalSubject.startsWith('Re:') ? '' : 'Re: '
  const html = replyText.split('\n').map(line => `<p>${line}</p>`).join('')

  try {
    const { error } = await resend.emails.send({
      from: 'noreply@salonrink.com',
      to: toEmail,
      subject: `${subjectPrefix}${originalSubject}`,
      html,
    })
    return !error
  } catch {
    return false
  }
}

async function notifySlack(eventType: string, data: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  let text = ''

  if (eventType === 'classification-failed') {
    text = `*⚠️ メール分類失敗*\nFrom: ${data.fromEmail}\nSubject: ${data.subject}\n手動対応が必要です。`
  } else if (eventType === 'email-received') {
    const emoji = data.autoReplied ? '✅' : (data.needsHumanReview ? '🚨' : '📧')
    text = `*${emoji} メール受信: ${data.classification}* (信頼度: ${(data.confidence * 100).toFixed(0)}%)\n` +
           `From: ${data.fromName || data.fromEmail} ${data.salonName ? `(${data.salonName})` : ''}\n` +
           `Subject: ${data.subject}\n` +
           (data.autoReplied ? '→ 自動返信送信済み' : '') +
           (data.needsHumanReview ? '→ 🚨 手動対応が必要です' : '')
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch (error) {
    console.error('[slack] Failed:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ImprovMXPayload
    console.log('[email-reply] Received webhook:', { from: payload.from?.email, subject: payload.subject })

    const supabase = createAdminClient()

    const fromEmail = payload.from?.email || ''
    const fromName = payload.from?.name || null
    const toEmail = payload.to?.[0]?.email || ''
    const subject = payload.subject || ''
    const bodyText = payload.text || ''
    const bodyHtml = payload.html || ''

    if (!fromEmail) {
      console.error('[email-reply] Missing from email')
      return NextResponse.json({ error: 'Missing from email' }, { status: 400 })
    }

    // リード検索
    const { data: lead } = await supabase
      .from('lp_leads')
      .select('id, contact_name, salon_name, opted_out')
      .eq('email', fromEmail)
      .maybeSingle()

    // AI 分類
    const classification = await classifyEmail(bodyText || subject)

    if (!classification) {
      await supabase.from('email_replies').insert({
        lead_id: lead?.id,
        from_email: fromEmail,
        from_name: fromName,
        to_email: toEmail,
        subject,
        body_text: bodyText,
        body_html: bodyHtml,
        needs_human_review: true,
        raw_headers: payload.headers,
      })
      await notifySlack('classification-failed', { fromEmail, subject })
      return NextResponse.json({ status: 'classification_failed' })
    }

    const salesEnabled = process.env.SALES_AGENTS_ENABLED === 'true'

    let aiResponseText: string | null = null
    let aiResponseSentAt: string | null = null
    let needsHumanReview = false

    if (classification.classification === 'question' && classification.confidence >= 0.7 && salesEnabled) {
      const reply = await generateReply(bodyText)
      if (reply && reply.confidence >= 0.7) {
        aiResponseText = reply.reply_text
        const sent = await sendAutoReply(fromEmail, fromName, subject, reply.reply_text)
        if (sent) aiResponseSentAt = new Date().toISOString()
        else needsHumanReview = true
      } else {
        needsHumanReview = true
      }
    } else if (classification.classification === 'unsubscribe' && lead) {
      await supabase.from('lp_leads').update({ opted_out: true }).eq('id', lead.id)
      aiResponseText = '配信停止を承りました。'
    } else if (classification.classification === 'unknown' || classification.confidence < 0.7) {
      needsHumanReview = true
    }

    await supabase.from('email_replies').insert({
      lead_id: lead?.id,
      from_email: fromEmail,
      from_name: fromName,
      to_email: toEmail,
      subject,
      body_text: bodyText,
      body_html: bodyHtml,
      classification: classification.classification,
      confidence: classification.confidence,
      ai_response_text: aiResponseText,
      ai_response_sent_at: aiResponseSentAt,
      needs_human_review: needsHumanReview,
      raw_headers: payload.headers,
    })

    await notifySlack('email-received', {
      fromEmail,
      fromName,
      salonName: lead?.salon_name,
      subject,
      classification: classification.classification,
      confidence: classification.confidence,
      autoReplied: !!aiResponseSentAt,
      needsHumanReview,
    })

    return NextResponse.json({
      status: 'ok',
      classification: classification.classification,
      auto_replied: !!aiResponseSentAt,
      needs_review: needsHumanReview,
    })
  } catch (error) {
    console.error('[email-reply] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
