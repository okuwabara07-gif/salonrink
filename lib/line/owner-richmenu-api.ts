import https from 'https'
import { generateRichMenuAreas } from '@/lib/line-messages/owner-richmenu-svg'

type RichMenuConfig = {
  size: {
    width: number
    height: number
  }
  selected: boolean
  name: string
  chat_bar_text: string
  areas: Array<{
    bounds: {
      x: number
      y: number
      width: number
      height: number
    }
    action: {
      type: 'uri' | 'postback'
      label: string
      uri?: string
      data?: string
    }
  }>
}

export async function createOwnerRichMenu(
  channelToken: string,
  richMenuName: string = 'owner-dashboard-v1'
): Promise<string> {
  const areas = generateRichMenuAreas()

  const menuConfig: RichMenuConfig = {
    size: {
      width: 2500,
      height: 1686,
    },
    selected: true,
    name: richMenuName,
    chat_bar_text: 'メニューを見る',
    areas: areas.map((area) => ({
      bounds: area.bounds,
      action: {
        type: area.action.type,
        label: area.action.label,
        uri: area.action.uri,
        data: area.action.data,
      },
    })),
  }

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(menuConfig)
    const options = {
      hostname: 'api.line.me',
      path: '/v2/bot/richmenu',
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
            new Error(`createRichMenu failed: ${res.statusCode} ${data}`)
          )
        } else {
          try {
            const parsed = JSON.parse(data)
            resolve(parsed.richMenuId)
          } catch (err) {
            reject(new Error(`Failed to parse richMenuId: ${data}`))
          }
        }
      })
    })

    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

export async function uploadOwnerRichMenuImage(
  richMenuId: string,
  imageBuffer: Buffer,
  channelToken: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api-data.line.me',
      path: `/v2/bot/richmenu/${richMenuId}/content`,
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length,
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
            new Error(`uploadImage failed: ${res.statusCode} ${data}`)
          )
        } else {
          resolve()
        }
      })
    })

    req.on('error', reject)
    req.write(imageBuffer)
    req.end()
  })
}

export async function setDefaultOwnerRichMenu(
  richMenuId: string,
  channelToken: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.line.me',
      path: `/v2/bot/user/all/richmenu/${richMenuId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0,
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
            new Error(`setDefaultRichMenu failed: ${res.statusCode} ${data}`)
          )
        } else {
          resolve()
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}
