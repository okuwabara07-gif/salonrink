import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const { salonId } = await params

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: syncStatus, error: statusError } = await supabase
      .from('sync_status')
      .select('status, maintenance_mode')
      .eq('salon_id', salonId)
      .maybeSingle()

    if (statusError) {
      console.error('Error fetching sync status:', statusError)
      const errorMessage = statusError.code === 'PGRST116'
        ? 'Supabase tables not yet created. See HPB_SETUP_INSTRUCTIONS.md'
        : 'Failed to fetch sync status'
      return NextResponse.json(
        { error: errorMessage },
        { status: statusError.code === 'PGRST116' ? 501 : 500 }
      )
    }

    if (!syncStatus) {
      return NextResponse.json(
        { error: 'Sync status not found', reason: 'not_configured' },
        { status: 404 }
      )
    }

    if (syncStatus.maintenance_mode || syncStatus.status !== 'healthy') {
      return NextResponse.json(
        {
          available: false,
          error: 'unavailable',
          reason: syncStatus.maintenance_mode ? 'maintenance' : 'sync_unhealthy',
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      available: true,
      slots: [],
      lastSync: new Date().toISOString(),
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
