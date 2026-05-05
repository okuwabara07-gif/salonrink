import { decrypt } from '@/lib/crypto'
import https from 'https'
import type { SupabaseClient } from '@supabase/supabase-js'

interface PushMessageResult {
  success: boolean
  error?: string
}

/**
 * salonに紐づくLINEアカウントから、指定ユーザーへpushメッセージを送信
 * line_accounts.line_status='active' かつ token_enc が設定されている必要あり
 */
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

  if (!lineAccount) {
    return { success: false, error: 'line_account_not_configured' }
  }

  if (lineAccount.line_status !== 'active') {
    return { success: false, error: `line_account_inactive (status=${lineAccount.line_status})` }
  }

  if (!lineAccount.channel_access_token_enc) {
    return { success: false, error: 'channel_access_token_missing' }
  }

  let token: string
  try {
    token = decrypt(lineAccount.channel_access_token_enc)
  } catch (err) {
    console.error(`Token decrypt failed for salon: ${salonId}`, err)
    return { success: false, error: 'token_decrypt_failed' }
  }

  return new Promise((resolve) => {
    const payload = JSON.stringify({ to: userId, messages })
    const req = https.request(
      {
        hostname: 'api.line.me',
        path: '/v2/bot/message/push',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'Authorization': `Bearer ${token}`,
        },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true })
          } else {
            resolve({ success: false, error: `HTTP ${res.statusCode}: ${data}` })
          }
        })
      }
    )
    req.on('error', (err) => {
      resolve({ success: false, error: err.message })
    })
    req.write(payload)
    req.end()
  })
}
