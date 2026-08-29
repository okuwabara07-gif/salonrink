import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'

export interface OwnerNotificationSettings {
  morning_enabled: boolean
  morning_send_hour_jst: number
  evening_enabled: boolean
  evening_send_hour_jst: number
}

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: ownerLink, error } = await adminClient
      .from('owner_line_links')
      .select('morning_enabled, morning_send_hour_jst, evening_enabled, evening_send_hour_jst')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[owner-notification-settings GET] Error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), { status: 500 })
    }

    if (!ownerLink) {
      return new Response(
        JSON.stringify({
          morning_enabled: true,
          morning_send_hour_jst: 7,
          evening_enabled: true,
          evening_send_hour_jst: 21,
        }),
        { status: 200 }
      )
    }

    return new Response(JSON.stringify(ownerLink), { status: 200 })
  } catch (e) {
    console.error('[owner-notification-settings GET] Fatal:', e)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const body = await request.json()
    const { morning_enabled, morning_send_hour_jst, evening_enabled, evening_send_hour_jst } = body

    if (
      typeof morning_enabled !== 'boolean' ||
      typeof evening_enabled !== 'boolean' ||
      typeof morning_send_hour_jst !== 'number' ||
      typeof evening_send_hour_jst !== 'number' ||
      morning_send_hour_jst < 0 || morning_send_hour_jst > 23 ||
      evening_send_hour_jst < 0 || evening_send_hour_jst > 23
    ) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('owner_line_links')
      .update({
        morning_enabled,
        morning_send_hour_jst,
        evening_enabled,
        evening_send_hour_jst,
        updated_at: new Date().toISOString(),
      })
      .eq('owner_user_id', user.id)

    if (error) {
      console.error('[owner-notification-settings PATCH] Error:', error)
      return new Response(JSON.stringify({ error: 'Failed to update settings' }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (e) {
    console.error('[owner-notification-settings PATCH] Fatal:', e)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
