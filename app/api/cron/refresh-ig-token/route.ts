/**
 * GET/POST /api/cron/refresh-ig-token
 * Vercel Cron: 月1回実行（毎月1日 03:00 UTC 等）
 *
 * 役割:
 * - Supabase ig_tokens から現在の長期トークンを読む
 * - fb_exchange_token で新しい60日トークンに無条件で再交換
 * - 新トークンと expires_at を Supabase に書き戻す
 * - 結果を Slack 通知
 *
 * 長期トークンは発行から24h経過後ならいつでも再交換可・再交換で新たに60日有効。
 * 月次無条件リフレッシュにより実質無期限で維持される。
 */

import { NextRequest, NextResponse } from 'next/server'

function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return authHeader === `Bearer ${secret}`
}

async function notifySlack(text: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch {
    // Slack失敗はリフレッシュ自体の成否に影響させない
  }
}

async function handleCronRequest(request: NextRequest): Promise<NextResponse> {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const FB_APP_ID = process.env.META_APP_ID
  const FB_APP_SECRET = process.env.META_APP_SECRET

  if (!SUPA_URL || !SUPA_KEY || !FB_APP_ID || !FB_APP_SECRET) {
    const msg = 'refresh-ig-token: missing env (SUPA_URL/SUPA_KEY/META_APP_ID/META_APP_SECRET)'
    await notifySlack(`🔴 ${msg}`)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  try {
    // 1. Supabase から現在のトークンを読む
    const readRes = await fetch(
      `${SUPA_URL}/rest/v1/ig_tokens?id=eq.salonrink&select=access_token,ig_business_id`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    )
    const rows = await readRes.json()
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('ig_tokens row not found')
    }
    const currentToken = rows[0].access_token as string

    // 2. fb_exchange_token で新しい60日トークンに再交換
    const exUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token')
    exUrl.searchParams.set('grant_type', 'fb_exchange_token')
    exUrl.searchParams.set('client_id', FB_APP_ID)
    exUrl.searchParams.set('client_secret', FB_APP_SECRET)
    exUrl.searchParams.set('fb_exchange_token', currentToken)

    const exRes = await fetch(exUrl.toString())
    const exData = await exRes.json()
    if (!exData.access_token) {
      throw new Error(`token exchange failed: ${JSON.stringify(exData).slice(0, 200)}`)
    }
    const newToken = exData.access_token as string

    // 3. expires_at を60日後に設定して Supabase に書き戻す
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

    const updRes = await fetch(`${SUPA_URL}/rest/v1/ig_tokens?id=eq.salonrink`, {
      method: 'PATCH',
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        access_token: newToken,
        refreshed_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }),
    })
    if (!updRes.ok) {
      throw new Error(`supabase update failed: ${updRes.status}`)
    }

    await notifySlack(
      `✅ IGトークン リフレッシュ成功 (${now.toISOString().slice(0, 10)})\n次回失効: ${expiresAt.toISOString().slice(0, 10)}`
    )
    return NextResponse.json(
      { success: true, refreshed_at: now.toISOString(), expires_at: expiresAt.toISOString() },
      { status: 200 }
    )
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    await notifySlack(`🔴 IGトークン リフレッシュ失敗: ${errMsg}`)
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleCronRequest(request)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleCronRequest(request)
}