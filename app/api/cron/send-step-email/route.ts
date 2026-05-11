/**
 * POST /api/cron/send-step-email
 * Vercel Cron: 毎日 09:00 JST (00:00 UTC) 実行
 *
 * 役割:
 * - lp_leads から配信対象を抽出（Day 1/3/7/14）
 * - Resend でメール送信
 * - lead_events にイベント記録
 * - lp_leads の配信状況を更新
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface Lead {
  id: string
  contact_name: string
  email: string
  created_at: string
  step_email_count: number
}

interface SendResult {
  success: boolean
  sent: {
    day1: number
    day3: number
    day7: number
    day14: number
  }
  failed: number
  error?: string
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

// ───── Helper: Lead 抽出関数 ─────

async function getLeadsByDay(
  supabase: any,
  day: 1 | 3 | 7 | 14
): Promise<Lead[]> {
  const now = new Date()
  let hoursAgo_start: number
  let hoursAgo_end: number
  let stepEmailCount: number

  switch (day) {
    case 1:
      hoursAgo_start = 12
      hoursAgo_end = 36
      stepEmailCount = 0
      break
    case 3:
      hoursAgo_start = 60
      hoursAgo_end = 84
      stepEmailCount = 1
      break
    case 7:
      hoursAgo_start = 156
      hoursAgo_end = 180
      stepEmailCount = 2
      break
    case 14:
      hoursAgo_start = 324
      hoursAgo_end = 348
      stepEmailCount = 3
      break
    default:
      return []
  }

  const startDate = new Date(now.getTime() - hoursAgo_start * 60 * 60 * 1000)
  const endDate = new Date(now.getTime() - hoursAgo_end * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('lp_leads')
    .select('id, contact_name, email, created_at, step_email_count')
    .eq('opted_out', false)
    .eq('step_email_count', stepEmailCount)
    .lte('created_at', startDate.toISOString())
    .gte('created_at', endDate.toISOString())

  if (error) {
    console.error(`getLeadsByDay(${day}) error:`, error)
    return []
  }

  return data || []
}

// ───── Helper: メールテンプレ生成 ─────

function buildEmailHtml(day: 1 | 3 | 7 | 14, contactName: string): {
  subject: string
  html: string
} {
  const templates: Record<
    1 | 3 | 7 | 14,
    { subject: string; html: (name: string) => string }
  > = {
    1: {
      subject: '【SalonRink】昨日はAI体験ありがとうございました',
      html: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #2c2825; }
    .content { font-size: 14px; margin-bottom: 20px; }
    .cta { background: #C9A961; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">AI体験ありがとうございました</div>

    <div class="content">
      <p>${name} 様</p>

      <p>このたびはSalonRinkのAI体験を試していただき、ありがとうございました。</p>

      <p>体験の中で感じていただいたように、SalonRinkは単なるAIツールではなく、
      <strong>美容師の経験 × AIの記憶</strong>で、
      お客様を継続的に「覚えてくれるサロン」を実現します。</p>

      <p><strong>毎回ゼロから話す</strong>のではなく、
      <strong>あなたを大切に覚えていてくれる</strong>—<br>
      その体験の先に、SalonRinkがあります。</p>

      <p><strong>【サービス概要】</strong><br>
      月額¥1,980(税込¥2,178〜)<br>
      • AI カルテで、お客様の好みを一元管理<br>
      • 事前LINE カウンセリングで、当日の時間短縮<br>
      • 施術後も継続的に「覚えてくれる」関係を構築<br>
      <br>
      • 14日間無料お試し<br>
      • クレジットカード不要<br>
      • 解約はいつでも</p>

      <p><a href="https://salonrink.com/signup" class="cta">今すぐ14日間無料で試す</a></p>

      <p>ご質問やご不明な点がございましたら、本メールにご返信ください。</p>
    </div>

    <div class="footer">
      <p>SalonRink 運営事務局<br>
      AOKAE合同会社<br>
      <a href="https://salonrink.com">https://salonrink.com</a></p>
    </div>
  </div>
</body>
</html>
      `,
    },
    3: {
      subject: '【SalonRink】お客様のカルテ管理、何時間使っていますか?',
      html: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #2c2825; }
    .content { font-size: 14px; margin-bottom: 20px; }
    .highlight { background: #FFF9E6; padding: 15px; border-left: 4px solid #C9A961; margin: 15px 0; }
    .cta { background: #C9A961; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">美容師さんの時間を取り戻す</div>

    <div class="content">
      <p>${name} 様</p>

      <p>AI体験後のアンケートを見ていて気づいたことがあります。</p>

      <p>美容師さんが、毎月<strong>カウンセリングと事務作業に約25時間</strong>を費やしているということです。</p>

      <div class="highlight">
        <strong>月25時間 × 12ヶ月 = 年間300時間</strong><br>
        これは、ほぼ2ヶ月分の労働時間に相当します。
      </div>

      <p>SalonRinkを導入すれば、その時間の大半を<br>
      <strong>「本当に大切な施術と、お客様との関係構築」</strong>に充てられます。</p>

      <p><strong>【導入後に得られる体験(イメージ)】</strong><br>
      • カウンセリングが半分の時間で完了する<br>
      • 施術の質に集中できるようになる<br>
      • お客様との会話時間が、月25時間取り戻せる<br>
      • スタッフの満足度が向上する</p>

      <p><strong>【月額¥1,980(税込¥2,178〜)で実現】</strong><br>
      年間で計算すると、削減時間の時給以上の投資対効果が出ます。</p>

      <p><a href="https://salonrink.com/signup" class="cta">14日間無料で試してみる</a></p>

      <p>質問や詳細なお見積りご希望の場合は、本メールへのご返信をお願いします。</p>
    </div>

    <div class="footer">
      <p>SalonRink 運営事務局<br>
      AOKAE合同会社<br>
      <a href="https://salonrink.com">https://salonrink.com</a></p>
    </div>
  </div>
</body>
</html>
      `,
    },
    7: {
      subject: '【SalonRink】14日間、リスクゼロでお試しいただけます',
      html: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #2c2825; }
    .content { font-size: 14px; margin-bottom: 20px; }
    .feature-list { padding: 15px; background: #F0F8F5; border-radius: 8px; margin: 15px 0; }
    .cta { background: #C9A961; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">リスクゼロで、まずは試してみませんか?</div>

    <div class="content">
      <p>${name} 様</p>

      <p>導入を迷われている理由の多くは、<br>
      <strong>「本当に業務が改善されるのか?」</strong>という不安ではないでしょうか。</p>

      <p>だからこそ、SalonRinkは<strong>14日間の完全無料お試し</strong>をご用意しました。</p>

      <div class="feature-list">
        <strong>✓ クレジットカード不要</strong><br>
        <strong>✓ 14日後、自動課金なし</strong><br>
        <strong>✓ いつでも解約可能</strong><br>
        <strong>✓ 専門サポートチーム対応</strong>
      </div>

      <p>実際に使ってみて、<br>
      「これなら続けたい」と感じたら、その後も月額¥1,980(税込¥2,178〜)でお使いいただけます。</p>

      <p><strong>【よくあるご質問例】</strong><br>
      • 導入までの期間は?<br>
      • 既存システムとの連携は?<br>
      • スタッフ教育は必要?<br>
      <br>
      こうしたご質問も、無料期間中にサポートチームがサポートいたします。</p>

      <p><a href="https://salonrink.com/signup" class="cta">今すぐ始める(クレカ不要)</a></p>

      <p>何かご質問があれば、本メールへのご返信でお気軽にお問い合わせください。</p>
    </div>

    <div class="footer">
      <p>SalonRink 運営事務局<br>
      AOKAE合同会社<br>
      <a href="https://salonrink.com">https://salonrink.com</a></p>
    </div>
  </div>
</body>
</html>
      `,
    },
    14: {
      subject: '【SalonRink】最後のご案内です',
      html: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #2c2825; }
    .content { font-size: 14px; margin-bottom: 20px; }
    .cta { background: #C9A961; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">最後のご案内です</div>

    <div class="content">
      <p>${name} 様</p>

      <p>このシリーズのメール配信は、本メールが最終となります。</p>

      <p>SalonRinkを導入いただく場合は、<br>
      以下のボタンより<strong>14日間無料トライアル</strong>をお始めください。</p>

      <p>本当にお客様を<strong>「覚えてくれるサロン」</strong>にしたいなら、<br>
      今が行動する時です。</p>

      <p><a href="https://salonrink.com/signup" class="cta">今すぐ14日間無料で試す</a></p>

      <p><strong>ご不明な点や導入のご相談</strong>がございましたら、<br>
      本メールへのご返信いただければ、<br>
      サポートチームが対応させていただきます。</p>

      <p>何のご質問もなく、配信が不要の場合は、<br>
      本メール下部の配信停止をお選びください。<br>
      <br>
      ご返信がなかった場合、自動でこの配信シリーズは終了いたします。</p>
    </div>

    <div class="footer">
      <p>SalonRink 運営事務局<br>
      AOKAE合同会社<br>
      <a href="https://salonrink.com">https://salonrink.com</a></p>
    </div>
  </div>
</body>
</html>
      `,
    },
  }

  const template = templates[day]
  return {
    subject: template.subject,
    html: template.html(contactName),
  }
}

// ───── Helper: メール送信 + DB更新 ─────

async function sendStepEmail(
  supabase: any,
  lead: Lead,
  day: 1 | 3 | 7 | 14
): Promise<{ success: boolean; error?: string }> {
  try {
    const { subject, html } = buildEmailHtml(day, lead.contact_name)

    // Resend で送信
    const result = await resend.emails.send({
      from: 'noreply@salonrink.com',
      to: lead.email,
      subject,
      html,
    })

    if (result.error) {
      console.error(`sendStepEmail failed for lead ${lead.id}:`, result.error)
      return { success: false, error: result.error.message }
    }

    // lead_events に記録
    await supabase.from('lead_events').insert({
      lead_id: lead.id,
      event_type: 'email_sent',
      event_data: {
        template_id: `day${day}`,
        subject,
        sent_at: new Date().toISOString(),
      },
    })

    // lp_leads 更新
    await supabase
      .from('lp_leads')
      .update({
        last_emailed_at: new Date().toISOString(),
        step_email_count: lead.step_email_count + 1,
      })
      .eq('id', lead.id)

    return { success: true }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`sendStepEmail exception for lead ${lead.id}:`, errMsg)
    return { success: false, error: errMsg }
  }
}

// ───── Main Handler ─────

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
    console.warn('Unauthorized cron request')
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing authorization' },
      { status: 401 }
    )
  }

  const supabase = createAdminClient()
  const result: SendResult = {
    success: true,
    sent: { day1: 0, day3: 0, day7: 0, day14: 0 },
    failed: 0,
  }

  try {
    // 各 day の配信対象を並列取得
    const [day1Leads, day3Leads, day7Leads, day14Leads] = await Promise.all([
      getLeadsByDay(supabase, 1),
      getLeadsByDay(supabase, 3),
      getLeadsByDay(supabase, 7),
      getLeadsByDay(supabase, 14),
    ])

    console.log(`[send-step-email] Found leads: Day1=${day1Leads.length}, Day3=${day3Leads.length}, Day7=${day7Leads.length}, Day14=${day14Leads.length}`)

    // 各 day のメール送信（順次実行、throttle）
    const dayConfigs = [
      { day: 1 as const, leads: day1Leads },
      { day: 3 as const, leads: day3Leads },
      { day: 7 as const, leads: day7Leads },
      { day: 14 as const, leads: day14Leads },
    ]

    for (const { day, leads } of dayConfigs) {
      for (const lead of leads) {
        const sendResult = await sendStepEmail(supabase, lead, day)

        if (sendResult.success) {
          result.sent[`day${day}` as keyof typeof result.sent]++
          console.log(`[send-step-email] Day ${day} sent to ${lead.email}`)
        } else {
          result.failed++
          console.error(`[send-step-email] Day ${day} failed for ${lead.email}: ${sendResult.error}`)
        }
      }
    }

    console.log(`[send-step-email] Complete. Sent: ${JSON.stringify(result.sent)}, Failed: ${result.failed}`)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[send-step-email] Fatal error:', errMsg)

    return NextResponse.json(
      {
        success: false,
        error: errMsg,
        sent: result.sent,
        failed: result.failed,
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
