import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VPS_SCRAPER_URL = process.env.VPS_SCRAPER_URL || 'http://160.251.213.197'
const VPS_SYNC_ENDPOINT = `${VPS_SCRAPER_URL}/sync`
const VPS_REQUEST_TIMEOUT = 30000 // 30秒

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get salon info
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError || !salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    const salonId = salon.id

    // Check if HPB credentials exist
    const { data: credentials, error: credError } = await supabase
      .from('salon_hpb_credentials')
      .select('id')
      .eq('salon_id', salonId)
      .maybeSingle()

    if (credError || !credentials) {
      return NextResponse.json(
        { error: 'HPB credentials not configured' },
        { status: 400 }
      )
    }

    // Send sync request to VPS scraper
    console.log(`Initiating HPB sync for salon ${salonId} to ${VPS_SYNC_ENDPOINT}`)

    let vpsResponse
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), VPS_REQUEST_TIMEOUT)
      const syncApiKey = process.env.VPS_SYNC_API_KEY || 'default-sync-key'

      vpsResponse = await fetch(VPS_SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${syncApiKey}`,
        },
        body: JSON.stringify({ salon_id: salonId }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
    } catch (fetchError) {
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown error'
      console.error(`VPS sync request failed for salon ${salonId}:`, errorMsg)

      // Update sync status with error
      await supabase
        .from('hpb_integrations')
        .update({
          last_sync_error: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq('salon_id', salonId)

      return NextResponse.json(
        { error: 'VPS sync failed', details: errorMsg },
        { status: 503 }
      )
    }

    if (!vpsResponse.ok) {
      const vpsErrorData = await vpsResponse.json().catch(() => ({}))
      const vpsErrorMsg = vpsErrorData.error || `VPS returned status ${vpsResponse.status}`

      console.error(`VPS sync error for salon ${salonId}:`, vpsErrorMsg)

      // Update sync status with error
      await supabase
        .from('hpb_integrations')
        .update({
          last_sync_error: vpsErrorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq('salon_id', salonId)

      return NextResponse.json(
        { error: 'VPS sync failed', details: vpsErrorMsg },
        { status: 503 }
      )
    }

    const vpsData = await vpsResponse.json()

    // Update last_synced_at
    const { error: updateError } = await supabase
      .from('hpb_integrations')
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('salon_id', salonId)

    if (updateError) {
      console.error(`Failed to update sync status for salon ${salonId}:`, updateError)
      return NextResponse.json(
        { error: 'Failed to update sync status', details: updateError.message },
        { status: 500 }
      )
    }

    console.log(`HPB sync completed successfully for salon ${salonId}`)

    return NextResponse.json({
      success: true,
      message: 'HPB sync initiated',
      salon_id: salonId,
      synced_at: new Date().toISOString(),
      vps_response: vpsData,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('HPB sync error:', errorMessage)

    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
