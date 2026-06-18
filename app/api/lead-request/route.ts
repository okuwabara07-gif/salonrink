/**
 * POST /api/lead-request
 * LP リード取得エンドポイント
 *
 * 責務:
 * - Zod でバリデーション
 * - lp_leads テーブルに INSERT
 * - Resend で 2 通並列送信（ユーザ宛資料 + Osamu 宛通知）
 * - エラーハンドリング
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { readFileSync } from 'fs'
import { join } from 'path'

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

// Zod スキーマ定義
const leadRequestSchema = z.object({
  contact_name: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  salon_name: z.string().max(100).optional(),
  salon_size: z.enum(['1人', '2-3人', '4人以上', 'シェアサロン']).optional(),
  cta_type: z.enum(['document_request', 'consultation_booking', 'free_trial', 'line_contact', 'ai_experience']),
  source: z.string(),
  ai_experience_result: z.object({}).passthrough().optional(),
})

type LeadRequest = z.infer<typeof leadRequestSchema>

// PDF 読み込みヘルパー
function getPdfBase64(): string | null {
  try {
    const pdfPath = join(process.cwd(), 'public', 'docs', 'SalonRink_lp_doc_v1.pdf')
    const buffer = readFileSync(pdfPath)
    return buffer.toString('base64')
  } catch (err) {
    console.warn('PDF read failed:', err)
    return null
  }
}

// ユーザ宛メールテンプレート
function buildUserEmailHtml(name: string): string {
  return `
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
    .cta { background: #d4a955; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; }
    .footer { font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">SalonRink AI体験ありがとうございました</div>

    <div class="content">
      <p>${name} 様</p>

      <p>このたびはSalonRinkのAI体験を試していただき、ありがとうございました。</p>

      <p>ご希望のサービス資料を添付いたしました。</p>

      <p><strong>【今回体験いただいたこと】</strong><br>
      お客様の LINE 事前カウンセリングから、AI が美容師さんへの<br>
      引き継ぎメモを作成する流れを体験いただきました。</p>

      <p>AI は記録と整理の助手。<br>
      施術の最終判断は、いつも美容師さんの経験と感性です。</p>

      <p><strong>【SalonRink について】</strong><br>
      月額¥1,980〜(税込¥2,178〜)<br>
      • LINE × AIカルテで、美容師さんの仕事を支えます<br>
      • お客様1人1人を、ちゃんと「覚えている」サロンへ<br>
      • 14日間無料お試し</p>

      <p><strong>【次の一歩】</strong><br>
      <a href="https://salonrink.com/signup" class="cta">14日間無料で試す</a></p>

      <p>ご不明な点がございましたら、本メールにご返信ください。</p>
    </div>

    <div class="footer">
      <p>SalonRink 運営事務局<br>
      AOKAE合同会社<br>
      <a href="https://salonrink.com">https://salonrink.com</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Osamu 宛通知メール
function buildNotificationEmailHtml(
  name: string,
  email: string,
  phone: string | undefined,
  salonName: string | undefined,
  salonSize: string | undefined,
  ctaType: string,
  source: string,
  aiResult?: any
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { font-size: 16px; font-weight: bold; margin-bottom: 20px; color: #d4a955; }
    .field { margin: 10px 0; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">【SalonRink 新規リード】${name}様</div>

    <p>新規リードを受信しました。</p>

    <div class="field"><span class="label">ご担当者:</span> ${name}</div>
    <div class="field"><span class="label">メール:</span> ${email}</div>
    <div class="field"><span class="label">電話:</span> ${phone || '未入力'}</div>
    <div class="field"><span class="label">サロン名:</span> ${salonName || '未入力'}</div>
    <div class="field"><span class="label">規模:</span> ${salonSize || '未入力'}</div>
    <div class="field"><span class="label">種別:</span> ${ctaType}</div>
    <div class="field"><span class="label">ソース:</span> ${source}</div>
    <div class="field"><span class="label">受信日時:</span> ${new Date().toISOString()}</div>

    ${aiResult ? `<div class="field"><span class="label">AI体験サマリー:</span><br><pre>${aiResult.customer_summary || 'N/A'}</pre></div>` : ''}
  </div>
</body>
</html>
  `.trim()
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: body パース
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'validation_error', message: 'Invalid JSON' },
        { status: 400 }
      )
    }

    // Step 2: Zod バリデーション
    const validation = leadRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          issues: validation.error.issues.map(i => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }

    const data: LeadRequest = validation.data

    // Step 3: Admin クライアント初期化
    const admin = createAdminClient()

    // Step 4: lp_leads テーブルに INSERT
    const { data: insertedLead, error: dbError } = await admin
      .from('lp_leads')
      .insert({
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        salon_name: data.salon_name,
        salon_size: data.salon_size,
        cta_type: data.cta_type,
        source: data.source,
        ai_experience_result: data.ai_experience_result,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (dbError || !insertedLead) {
      console.error('DB insert failed:', dbError)
      return NextResponse.json(
        { error: 'database_error', message: 'Failed to save lead' },
        { status: 500 }
      )
    }

    const leadId = insertedLead.id

    // Step 5: PDF 読み込み試行
    const pdfBase64 = getPdfBase64()
    const pdfMissing = !pdfBase64

    // Step 6: Resend で 2 通並列送信
    const userEmailPromise = getResend().emails.send({
      from: 'noreply@salonrink.com',
      to: data.email,
      subject: '【SalonRink】AI体験ありがとうございました(資料を添付しました)',
      html: buildUserEmailHtml(data.contact_name),
      ...(pdfBase64 && {
        attachments: [
          {
            filename: 'SalonRink_サービス資料.pdf',
            content: pdfBase64,
          },
        ],
      }),
    })

    const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL
    const notificationPromise = notificationEmail
      ? getResend().emails.send({
          from: 'noreply@salonrink.com',
          to: notificationEmail,
          subject: `【SalonRink 新規リード(${data.cta_type})】${data.contact_name}様`,
          html: buildNotificationEmailHtml(
            data.contact_name,
            data.email,
            data.phone,
            data.salon_name,
            data.salon_size,
            data.cta_type,
            data.source,
            data.ai_experience_result
          ),
        })
      : Promise.resolve(null)

    const [userResult, notificationResult] = await Promise.all([
      userEmailPromise,
      notificationPromise,
    ])

    // Step 7: Resend エラーハンドリング(非致命的)
    let mailFailed = false
    if (userResult && 'error' in userResult && userResult.error) {
      console.error('User email send failed:', userResult.error)
      mailFailed = true
    }
    if (notificationResult && 'error' in notificationResult && notificationResult.error) {
      console.error('Notification email send failed:', notificationResult.error)
    }

    // Step 8: レスポンス返却
    return NextResponse.json(
      {
        success: true,
        leadId,
        message: 'リードを受け取りました。メールをご確認ください。',
        ...(pdfMissing && { pdf_missing: true }),
        ...(mailFailed && { mail_failed: true }),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('lead-request error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
