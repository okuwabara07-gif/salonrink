import https from 'https'
import type { FlexMessage } from '@/lib/line-messages/owner-morning-flex'

export async function pushFlexToOwner(
  lineUserId: string,
  altText: string,
  flex: FlexMessage
): Promise<void> {
  const channelToken = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN

  if (!channelToken) {
    throw new Error('LINE_OWNER_CHANNEL_ACCESS_TOKEN not configured')
  }

  const payload = JSON.stringify({
    to: lineUserId,
    messages: [
      {
        type: 'flex',
        altText,
        contents: flex,
      },
    ],
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
          reject(
            new Error(`pushFlex failed: ${res.statusCode} ${data}`)
          )
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
