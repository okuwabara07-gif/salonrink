import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('HPB credentials: No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('HPB credentials: User authenticated:', user.id)

    const body = await req.json()
    const { hpb_login_id, hpb_password, hpb_salon_id } = body

    if (!hpb_login_id || !hpb_password || !hpb_salon_id) {
      console.error('HPB credentials: Missing fields', { hpb_login_id: !!hpb_login_id, hpb_password: !!hpb_password, hpb_salon_id: !!hpb_salon_id })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('HPB credentials: Fetching salon for user:', user.id)
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError) {
      console.error('HPB credentials: Salon fetch error:', salonError)
      return NextResponse.json(
        { error: 'Failed to fetch salon', details: salonError.message },
        { status: 500 }
      )
    }

    if (!salon) {
      console.error('HPB credentials: Salon not found for user:', user.id)
      return NextResponse.json(
        { error: 'Salon not found for your account' },
        { status: 404 }
      )
    }

    console.log('HPB credentials: Salon found:', salon.id)

    const hpb_login_id_enc = encrypt(hpb_login_id)
    const hpb_password_enc = encrypt(hpb_password)

    console.log('HPB credentials: Encrypting and upserting to table')
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
      console.error('HPB credentials: Upsert failed', {
        code: upsertError.code,
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
      })
      const errorMessage = upsertError.code === 'PGRST116'
        ? 'Supabaseで salon_hpb_credentials テーブルを作成してください。HPB_SETUP_INSTRUCTIONS.md を参照してください。'
        : upsertError.message || 'Failed to save credentials'
      return NextResponse.json(
        { error: errorMessage, code: upsertError.code },
        { status: upsertError.code === 'PGRST116' ? 501 : 500 }
      )
    }

    console.log('HPB credentials: Successfully saved for salon:', salon.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    console.error('HPB credentials: Catch error:', { message: errorMsg, stack: errorStack })
    return NextResponse.json(
      { error: 'Internal server error', details: errorMsg },
      { status: 500 }
    )
  }
}
