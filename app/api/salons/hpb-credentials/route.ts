import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { hpb_login_id, hpb_password, hpb_salon_id } = body

    if (!hpb_login_id || !hpb_password || !hpb_salon_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (!salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    const hpb_login_id_enc = encrypt(hpb_login_id)
    const hpb_password_enc = encrypt(hpb_password)

    const { error: upsertError } = await supabase
      .from('salon_hpb_credentials')
      .upsert({
        salon_id: salon.id,
        hpb_login_id_enc,
        hpb_password_enc,
        hpb_salon_id: hpb_salon_id.trim(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'salon_id',
      })

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save credentials' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
