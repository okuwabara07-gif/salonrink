import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()
  let userId: string | null = null
  let userEmail: string | null = null

  // PKCE code 交換（signInWithOtp の新しい形式）
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=invalid_link`)
    }
    userId = data.user.id
    userEmail = data.user.email ?? null
  }
  // token_hash & type による従来形式（後方互換）
  else if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=invalid_link`)
    }
    userId = data.user.id
    userEmail = data.user.email ?? null
  }
  // どちらもない場合はエラー
  else {
    return NextResponse.redirect(`${origin}/login?error=missing_token`)
  }

  // Magic Link クリック後、セッションを確立して owner_user_id を埋める
  const admin = createAdminClient()
  await admin
    .from('salons')
    .update({ owner_user_id: userId })
    .eq('email', userEmail)
    .is('owner_user_id', null)

  return NextResponse.redirect(`${origin}${next}`)
}
