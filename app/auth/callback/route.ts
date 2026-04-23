import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`)
  }

  const supabase = await createClient()
  const { error, data } = await supabase.auth.verifyOtp({ token_hash, type: type as any })

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`)
  }

  // Magic Link クリック後、セッションを確立して owner_user_id を埋める
  const admin = createAdminClient()
  const { error: updateError } = await admin
    .from('salons')
    .update({ owner_user_id: data.user.id })
    .eq('email', data.user.email)
    .is('owner_user_id', null)

  return NextResponse.redirect(`${origin}${next}`)
}
