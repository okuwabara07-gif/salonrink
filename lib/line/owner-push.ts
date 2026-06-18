import https from 'https'
import type { FlexMessage } from '@/lib/line-messages/owner-morning-flex'

// テスト用: 最小bubble を owner に push
export async function pushMinimalBubbleToOwner(ownerLineUserId: string): Promise<void> {
  const minimalBubble: FlexMessage = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: 'test',
        },
      ],
    },
  }

  await pushFlexToOwner(ownerLineUserId, 'minimal test', minimalBubble)
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
