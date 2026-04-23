'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type LoginState = { ok: boolean; message: string }

const translateAuthError = (message: string): string => {
  if (message.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません。'
  }
  if (message.includes('Email not confirmed')) {
    return 'メールアドレスの確認が必要です。登録時のメールをご確認ください。'
  }
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
  return '操作に失敗しました。もう一度お試しください。'
}

export async function signInWithPassword(
  _prev: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !email.includes('@')) {
    return { ok: false, message: '有効なメールアドレスを入力してください' }
  }
  if (!password) {
    return { ok: false, message: 'パスワードを入力してください' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { ok: false, message: translateAuthError(error.message) }
  }

  redirect('/dashboard')
}

export async function sendPasswordReset(
  _prev: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return { ok: false, message: '有効なメールアドレスを入力してください' }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  })

  if (error) {
    return { ok: false, message: translateAuthError(error.message) }
  }
  return { ok: true, message: 'パスワードリセットリンクをメールで送信しました。メールをご確認ください。' }
}
