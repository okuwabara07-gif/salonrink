import { decrypt } from '@/lib/crypto'
import https from 'https'
import type { SupabaseClient } from '@supabase/supabase-js'

interface PushMessageResult {
  success: boolean
  error?: string
  fallback?: boolean
}

export async function pushMessage(
  supabase: SupabaseClient,
  salonId: string,
  userId: string,
  messages: unknown[]
): Promise<PushMessageResult> {
  const { data: lineAccount } = await supabase
    .from('line_accounts')
    .select('channel_access_token_enc, line_status')
    .eq('salon_id', salonId)
    .maybeSingle()

  let token: string
  let usedFallback = false

  if (lineAccount?.line_status === 'active' && lineAccount?.channel_access_token_enc) {
    try {
      token = decrypt(lineAccount.channel_access_token_enc)
    } catch {
      console.error(`Token decrypt failed for salon: ${salonId}`)
      token = process.env.LINE_CHANNEL_TOKEN || ''
      usedFallback = true
    }
  } else {
    token = process.env.LINE_CHANNEL_TOKEN || ''
    usedFallback = true
  }

  if (!token) {
    return { success: false, error: 'no_token_available' }
  }

  return new Promise((resolve) => {
    const payload = JSON.stringify({ to: userId, messages })
    const req = https.request({
      hostname: 'api.line.me',
      path: '/v2/bot/message/push',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, fallback: usedFallback })
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}`, fallback: usedFallback })
        }
      })
    })
    req.on('error', (err) => {
      resolve({ success: false, error: err.message, fallback: usedFallback })
    })
    req.write(payload)
    req.end()
  })
}

