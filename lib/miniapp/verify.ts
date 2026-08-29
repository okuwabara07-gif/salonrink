/**
 * lib/miniapp/verify.ts
 *
 * 顧客向けミニアプリ用の LIFF IDトークン検証ユーティリティ。
 * クライアントが自己申告する line_user_id は信用せず、
 * LINE の verify エンドポイントで IDトークンを検証して sub(line_user_id) を得る。
 *
 * owner-liff-auth/route.ts と同じ検証方式を顧客チャネル用に分離したもの。
 */

const CUSTOMER_CHANNEL_ID = process.env.CUSTOMER_LIFF_CHANNEL_ID

export type VerifyResult =
  | { ok: true; lineUserId: string; name?: string; picture?: string }
  | { ok: false; status: number; error: string }

/**
 * LIFF IDトークンを検証し、line_user_id を返す。
 */
export async function verifyCustomerIdToken(idToken: unknown): Promise<VerifyResult> {
  if (!idToken || typeof idToken !== 'string') {
    return { ok: false, status: 400, error: 'Invalid request' }
  }

  if (!CUSTOMER_CHANNEL_ID) {
    console.error('[miniapp/verify] CUSTOMER_LIFF_CHANNEL_ID not configured')
    return { ok: false, status: 500, error: 'Server configuration error' }
  }

  const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: CUSTOMER_CHANNEL_ID,
    }).toString(),
  })

  if (!verifyRes.ok) {
    console.warn('[miniapp/verify] LINE verification failed:', verifyRes.status)
    return { ok: false, status: 401, error: 'Token verification failed' }
  }

  const verified = await verifyRes.json()
  const lineUserId = verified.sub

  if (!lineUserId || typeof lineUserId !== 'string') {
    console.error('[miniapp/verify] Invalid verified token')
    return { ok: false, status: 401, error: 'Invalid token' }
  }

  return {
    ok: true,
    lineUserId,
    name: typeof verified.name === 'string' ? verified.name : undefined,
    picture: typeof verified.picture === 'string' ? verified.picture : undefined,
  }
}

/**
 * キレイ鶴見店の salon_id。当面1店舗運用のため env で固定。
 * 複数店舗対応時はこの解決ロジックを差し替える。
 */
export function getKireiTsurumiSalonId(): string | null {
  return process.env.MINIAPP_SALON_ID || null
}
