import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('LINE credentials: No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('LINE credentials: User authenticated:', user.id)

    const body = await req.json()
    const { channel_id, channel_access_token, channel_secret } = body

    if (!channel_id || !channel_access_token || !channel_secret) {
      console.error('LINE credentials: Missing fields', {
        channel_id: !!channel_id,
        channel_access_token: !!channel_access_token,
        channel_secret: !!channel_secret,
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('LINE credentials: Fetching salon for user:', user.id)
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError) {
      console.error('LINE credentials: Salon fetch error:', salonError)
      return NextResponse.json(
        { error: 'Failed to fetch salon', details: salonError.message },
        { status: 500 }
      )
    }

    if (!salon) {
      console.error('LINE credentials: Salon not found for user:', user.id)
      return NextResponse.json(
        { error: 'Salon not found for your account' },
        { status: 404 }
      )
    }

    console.log('LINE credentials: Salon found:', salon.id)

    const channel_access_token_enc = encrypt(channel_access_token)
    const channel_secret_enc = encrypt(channel_secret)

    console.log('LINE credentials: Encrypting and upserting to table')
    const { error: upsertError } = await supabase
      .from('line_accounts')
      .upsert({
        salon_id: salon.id,
        channel_id: channel_id.trim(),
        channel_access_token_enc,
        channel_secret_enc,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'salon_id',
      })

    if (upsertError) {
      console.error('LINE credentials: Upsert failed', {
        code: upsertError.code,
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
      })
      const errorMessage = upsertError.code === 'PGRST116'
        ? 'Supabaseで line_accounts テーブルを確認してください。'
        : upsertError.message || 'Failed to save credentials'
      return NextResponse.json(
        { error: errorMessage, code: upsertError.code },
        { status: upsertError.code === 'PGRST116' ? 501 : 500 }
      )
    }

    console.log('LINE credentials: Successfully saved for salon:', salon.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    console.error('LINE credentials: Catch error:', { message: errorMsg, stack: errorStack })
    return NextResponse.json(
      { error: 'Internal server error', details: errorMsg },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    const { data: credentials } = await supabase
      .from('line_accounts')
      .select('id, channel_id')
      .eq('salon_id', salon.id)
      .maybeSingle()

    return NextResponse.json({
      exists: !!credentials,
      channel_id: credentials?.channel_id || null,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('LINE credentials GET error:', errorMsg)
    return NextResponse.json(
      { error: 'Internal server error', details: errorMsg },
      { status: 500 }
    )
  }
}
