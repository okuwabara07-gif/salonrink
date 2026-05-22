import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken || typeof idToken !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
    }

    const channelId = process.env.OWNER_LIFF_CHANNEL_ID
    if (!channelId) {
      console.error('[owner-liff-auth] OWNER_LIFF_CHANNEL_ID not configured')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
    }

    // Verify ID token with LINE
    const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: channelId,
      }).toString(),
    })

    if (!verifyRes.ok) {
      console.warn('[owner-liff-auth] LINE verification failed:', verifyRes.status)
      return new Response(JSON.stringify({ error: 'Token verification failed' }), { status: 401 })
    }

    const verified = await verifyRes.json()
    const lineUserId = verified.sub

    if (!lineUserId || typeof lineUserId !== 'string') {
      console.error('[owner-liff-auth] Invalid verified token:', verified)
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: ownerLink, error: lookupErr } = await adminClient
      .from('owner_line_links')
      .select('owner_user_id')
      .eq('status', 'active')
      .eq('line_user_id', lineUserId)
      .maybeSingle()

    if (lookupErr) {
      console.error('[owner-liff-auth] Lookup error:', lookupErr)
      return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
    }

    if (!ownerLink) {
      console.warn('[owner-liff-auth] No active owner found for lineUserId:', lineUserId)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const ownerUserId = ownerLink.owner_user_id
    if (!ownerUserId) {
      return new Response(JSON.stringify({ error: 'Owner user ID not configured' }), { status: 500 })
    }

    // Generate magic link for passwordless sign-in
    const { data, error: generateErr } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: `owner-${ownerUserId}@salonrink.internal`,
      options: {
        redirectTo: 'https://salonrink.com/dashboard',
      },
    })

    if (generateErr || !data?.properties?.action_link) {
      console.error('[owner-liff-auth] Generate link error:', generateErr)
      return new Response(JSON.stringify({ error: 'Failed to create session' }), { status: 500 })
    }

    // Extract session token from action link and set as cookie
    const linkUrl = new URL(data.properties.action_link)
    const token = linkUrl.searchParams.get('token')

    if (!token) {
      return new Response(JSON.stringify({ error: 'Failed to extract token' }), { status: 500 })
    }

    const response = new Response(
      JSON.stringify({ success: true, owner_user_id: ownerUserId }),
      { status: 200 }
    )

    // Set secure cookie with token
    response.headers.set(
      'Set-Cookie',
      `sb-auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
    )

    return response
  } catch (e) {
    console.error('[owner-liff-auth] Fatal error:', e)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
