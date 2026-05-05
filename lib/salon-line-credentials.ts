import { createClient } from '@supabase/supabase-js'
import { encrypt, decrypt } from './crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export type LineCredentials = {
  channelId: string
  channelSecret: string
  channelToken: string
}

/**
 * salonのLINE資格情報を保存（暗号化）
 * line_accountsテーブルにupsert
 */
export async function saveLineCredentials(
  salonId: string,
  creds: LineCredentials
): Promise<void> {
  // salon_codeを取得
  const { data: salon, error: salonError } = await supabaseAdmin
    .from('salons')
    .select('salon_code')
    .eq('id', salonId)
    .single()

  if (salonError || !salon?.salon_code) {
    throw new Error(`Salon not found or salon_code missing: ${salonId}`)
  }

  const { error } = await supabaseAdmin
    .from('line_accounts')
    .upsert(
      {
        salon_id: salonId,
        salon_code: salon.salon_code,
        channel_id: creds.channelId,
        channel_secret_enc: encrypt(creds.channelSecret),
        channel_access_token_enc: encrypt(creds.channelToken),
        line_status: 'active',
        line_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'salon_id' }
    )

  if (error) throw new Error(`Failed to save LINE credentials: ${error.message}`)
}

/**
 * salonのLINE資格情報を取得（復号）
 * 未設定の場合は null を返す
 */
export async function getLineCredentials(
  salonId: string
): Promise<LineCredentials | null> {
  const { data, error } = await supabaseAdmin
    .from('line_accounts')
    .select('channel_id, channel_secret_enc, channel_access_token_enc')
    .eq('salon_id', salonId)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch LINE credentials: ${error.message}`)
  if (!data?.channel_id || !data?.channel_secret_enc || !data?.channel_access_token_enc) {
    return null
  }

  return {
    channelId: data.channel_id,
    channelSecret: decrypt(data.channel_secret_enc),
    channelToken: decrypt(data.channel_access_token_enc),
  }
}

/**
 * Channel ID から salon を逆引き（将来用・現在Webhookは [salonId] 方式）
 */
export async function getSalonIdByChannelId(
  channelId: string
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('line_accounts')
    .select('salon_id')
    .eq('channel_id', channelId)
    .maybeSingle()

  if (error) throw new Error(`Failed to lookup salon: ${error.message}`)
  return data?.salon_id ?? null
}

/**
 * salonのLINE資格情報を削除（連携解除）
 */
export async function clearLineCredentials(salonId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('line_accounts')
    .update({
      channel_id: null,
      channel_secret_enc: null,
      channel_access_token_enc: null,
      line_status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('salon_id', salonId)

  if (error) throw new Error(`Failed to clear LINE credentials: ${error.message}`)
}
