import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lineUserId } = body

    if (!lineUserId || typeof lineUserId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
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
