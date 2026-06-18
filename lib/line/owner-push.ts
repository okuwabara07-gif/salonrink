import https from 'https'
import type { FlexMessage } from '@/lib/line-messages/owner-morning-flex'

// 朝cronで実証済みの宛先取得: owner_line_links から active owner の line_user_id を取得（単一）
// 承認タップ・テスト等の「単一宛先」用。朝cronはこれを使わない（morning_enabled等で絞るため）
export async function getActiveOwnerLineUserId(): Promise<string | null> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  const { data: owner, error } = await admin
    .from('owner_line_links')
    .select('line_user_id')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[getActiveOwnerLineUserId] Fetch error:', error.message)
    return null
  }

  return owner?.line_user_id || null
}

// テスト用: シンプルテキストメッセージを owner に push（宛先・トークン検証用）
export async function pushOwnerTextTest(ownerLineUserId: string): Promise<void> {
  const channelToken = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN

  if (!channelToken) {
    throw new Error('LINE_OWNER_CHANNEL_ACCESS_TOKEN not configured')
  }

  const payload = JSON.stringify({
    to: ownerLineUserId,
    messages: [
      {
        type: 'text',
        text: '最小テスト',
      },
    ],
  })

  console.log('[pushOwnerTextTest] Sending text message', {
    to: ownerLineUserId,
    messageType: 'text',
  })

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.line.me',
      path: '/v2/bot/message/push',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
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
          const errMsg = `pushOwnerTextTest failed: HTTP ${res.statusCode}`
          console.error(`[pushOwnerTextTest] ${errMsg}`, {
            status: res.statusCode,
            responseBody: data,
          })
          reject(new Error(`${errMsg}: ${data}`))
        } else {
          console.log('[pushOwnerTextTest] Success')
          resolve()
        }
      })
    })

    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

export async function pushFlexToOwner(
  lineUserId: string,
  altText: string,
  flex: FlexMessage
): Promise<void> {
  const channelToken = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN

  if (!channelToken) {
    throw new Error('LINE_OWNER_CHANNEL_ACCESS_TOKEN not configured')
  }

  const messageObj = {
    type: 'flex',
    altText,
    contents: flex,
  }
  const payload = JSON.stringify({
    to: lineUserId,
    messages: [messageObj],
  })

  console.log('[pushFlexToOwner] Sending to LINE API', {
    to: lineUserId,
    messageType: messageObj.type,
    altText: messageObj.altText,
    contentsType: ((messageObj.contents as unknown) as Record<string, unknown>)?.type || 'unknown',
  })

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.line.me',
      path: '/v2/bot/message/push',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
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
          const errMsg = `pushFlex failed: HTTP ${res.statusCode}`
          console.error(`[pushFlexToOwner] ${errMsg}`, {
            status: res.statusCode,
            responseBody: data,
          })
          reject(new Error(`${errMsg}: ${data}`))
        } else {
          resolve()
        }
      })
    })

    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}
