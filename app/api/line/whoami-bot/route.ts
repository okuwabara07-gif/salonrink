/**
 * GET /api/line/whoami-bot
 * LINE bot自身の情報を取得（トークンとuserIdが同じOAか確認用）
 *
 * エンドポイント: GET https://api.line.me/v2/bot/info
 * Authorization: Bearer <LINE_OWNER_CHANNEL_ACCESS_TOKEN>
 *
 * レスポンス例: { basicId, displayName, userId, ... }
 *
 * 認証: Supabase セッション（admin推奨）
 */

import { NextResponse } from 'next/server'
import https from 'https'
import { errorResponse } from '@/lib/api/response'

export async function GET(): Promise<NextResponse> {
  try {
    // Step 1: 認証チェック
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: LINE_OWNER_CHANNEL_ACCESS_TOKEN を確認
    const channelToken = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN
    if (!channelToken) {
      console.error('[whoami-bot] LINE_OWNER_CHANNEL_ACCESS_TOKEN not configured')
      return errorResponse('LINE_OWNER_CHANNEL_ACCESS_TOKEN not configured', 500)
    }

    // Step 3: LINE bot info を取得
    const botInfo = await getLineBotInfo(channelToken)

    console.log('[whoami-bot] Bot info retrieved:', botInfo)

    return new NextResponse(JSON.stringify(botInfo), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[whoami-bot] ERROR:', errMsg)
    return errorResponse(`Failed to get bot info: ${errMsg}`, 500)
  }
}

async function getLineBotInfo(channelToken: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.line.me',
      path: '/v2/bot/info',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${channelToken}`,
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        if (res.statusCode !== 200) {
          const errMsg = `LINE bot info request failed: HTTP ${res.statusCode}`
          console.error(`[getLineBotInfo] ${errMsg}`, {
            status: res.statusCode,
            responseBody: data,
          })
          reject(new Error(`${errMsg}: ${data}`))
        } else {
          try {
            const botInfo = JSON.parse(data) as Record<string, unknown>
            console.log('[getLineBotInfo] Success')
            resolve(botInfo)
          } catch (parseErr) {
            reject(new Error(`Failed to parse bot info response: ${parseErr}`))
          }
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}
