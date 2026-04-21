import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirect') ?? '/pricing'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`)
  }

  // 初回ログイン: email で pending salon を探して owner_user_id を埋める
  const admin = createAdminClient()
  await admin
    .from('salons')
    .update({ owner_user_id: data.user.id })
    .eq('email', data.user.email)
    .is('owner_user_id', null)

  return NextResponse.redirect(`${origin}${redirectTo}`)
}
