import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { saveLineCredentials, getLineCredentials } from '@/lib/salon-line-credentials'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { channel_id, channel_access_token, channel_secret } = body

    if (!channel_id || !channel_access_token || !channel_secret) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ユーザーのsalonを特定
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError || !salon) {
      return NextResponse.json(
        { error: 'Salon not found for your account' },
        { status: 404 }
      )
    }

    // libを通じて暗号化保存
    await saveLineCredentials(salon.id, {
      channelId: channel_id.trim(),
      channelSecret: channel_secret,
      channelToken: channel_access_token,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('LINE credentials POST error:', errorMsg)
    return NextResponse.json(
      { error: 'Internal server error', details: errorMsg },
      { status: 500 }
    )
  }
}

export async function GET(_req: NextRequest) {
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

    // libを通じて取得（復号した値は返さず、存在チェックのみ）
    const creds = await getLineCredentials(salon.id)

    return NextResponse.json({
      exists: !!creds,
      channel_id: creds?.channelId || null,
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
