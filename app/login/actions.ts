'use server'

import { createClient } from '@/lib/supabase/server'

export type LoginState = { ok: boolean; message: string }

export async function sendMagicLink(
  _prev: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return { ok: false, message: '有効なメールアドレスを入力してください' }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { ok: false, message: `送信に失敗しました: ${error.message}` }
  }
  return { ok: true, message: 'ログインリンクをメールで送信しました。メールをご確認ください。' }
}
