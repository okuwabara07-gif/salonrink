'use server'

import { createClient } from '@/lib/supabase/server'

export type LoginState = { ok: boolean; message: string }

const translateAuthError = (message: string): string => {
  if (message.includes('only request this after')) {
    const match = message.match(/after (\d+) seconds/)
    return match
      ? `セキュリティのため、${match[1]}秒後に再度お試しください。`
      : 'しばらく待ってから再度お試しください。'
  }
  if (message.includes('Email rate limit exceeded')) {
    return 'メール送信回数の上限に達しました。しばらく時間をおいてお試しください。'
  }
  if (message.includes('Invalid email')) {
    return 'メールアドレスの形式が正しくありません。'
  }
  if (message.includes('User not found')) {
    return 'このメールアドレスは登録されていません。'
  }
  return '送信に失敗しました。もう一度お試しください。'
}

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
    return { ok: false, message: translateAuthError(error.message) }
  }
  return { ok: true, message: 'ログインリンクをメールで送信しました。メールをご確認ください。' }
}
