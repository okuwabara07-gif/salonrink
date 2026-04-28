'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type RegisterInput = {
  salonName: string
  hotpepperUrl: string
  icalUrl: string
  ownerName: string
  phone: string
  email: string
  // plan: Stripe内部名 (basic/small/medium/free)
  // → DB salons.plan に保存される際は lib/plans.ts のマッピング参照
  plan: string
  ownerUserId?: string
  inviteCodeUsed?: boolean
}

export type RegisterResult =
  | { ok: true; salonId: string; freePlanActivated: boolean }
  | { ok: false; message: string }

export async function registerSalon(input: RegisterInput): Promise<RegisterResult> {
  const email = input.email.trim().toLowerCase()
  if (!email || !input.salonName.trim() || !input.ownerName.trim()) {
    return { ok: false, message: '必須項目が未入力です' }
  }

  const admin = createAdminClient()
  const isFreeplan = input.plan === 'free'

  // 既存の pending salon があれば再利用（同じメールでの再登録）
  const { data: existing } = await admin
    .from('salons')
    .select('id, status')
    .eq('email', email)
    .maybeSingle()

  if (existing?.status === 'active') {
    return { ok: false, message: 'このメールアドレスは既に登録済みです。ログインページからサインインしてください。' }
  }

  const salonsInsertData = {
    name: input.salonName,
    hotpepper_url: input.hotpepperUrl || null,
    ical_url: input.icalUrl || null,
    owner_name: input.ownerName,
    phone: input.phone || null,
    email,
    plan: input.plan,
    status: isFreeplan ? 'active' : 'pending',
    trial_ends_at: isFreeplan ? null : undefined,
    owner_user_id: input.ownerUserId || null,
  }

  let salonId: string
  if (existing?.id) {
    const { error } = await admin.from('salons').update(salonsInsertData).eq('id', existing.id)
    if (error) {
      return { ok: false, message: error.message ?? '登録に失敗しました' }
    }
    salonId = existing.id
  } else {
    const { data, error } = await admin
      .from('salons')
      .insert(salonsInsertData)
      .select('id')
      .single()

    if (error || !data) {
      return { ok: false, message: error?.message ?? '登録に失敗しました' }
    }
    salonId = data.id
  }

  // Free Plan: send Magic Link
  if (isFreeplan) {
    try {
      const supabase = await createClient()
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
        },
      })
    } catch (err) {
      console.error('Magic Link sending failed:', err)
      return { ok: false, message: 'Magic Linkの送信に失敗しました' }
    }
  }

  // Increment invite code usage if provided
  if (input.inviteCodeUsed) {
    try {
      const { data: code } = await admin
        .from('invite_codes')
        .select('id, usage_count')
        .eq('code', input.plan)
        .maybeSingle()

      if (code?.id) {
        await admin
          .from('invite_codes')
          .update({ usage_count: (code.usage_count || 0) + 1 })
          .eq('id', code.id)
      }
    } catch (err) {
      console.error('Failed to increment invite code usage:', err)
    }
  }

  return { ok: true, salonId, freePlanActivated: isFreeplan }
}

export async function sendRegistrationOtp(email: string): Promise<{ ok: boolean; message?: string }> {
  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail) {
    return { ok: false, message: 'メールアドレスを入力してください' }
  }

  try {
    const supabase = await createClient()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent('/register?step=2')}`

    await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })
    return { ok: true }
  } catch (err) {
    console.error('OTP sending error:', err)
    return { ok: false, message: 'メール送信に失敗しました' }
  }
}
