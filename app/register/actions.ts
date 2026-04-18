'use server'
import { createAdminClient } from '@/lib/supabase/admin'

export type RegisterInput = {
  salonName: string
  hotpepperUrl: string
  icalUrl: string
  ownerName: string
  phone: string
  email: string
  plan: string
}

export type RegisterResult =
  | { ok: true; salonId: string }
  | { ok: false; message: string }

export async function registerSalon(input: RegisterInput): Promise<RegisterResult> {
  const email = input.email.trim().toLowerCase()
  if (!email || !input.salonName.trim() || !input.ownerName.trim()) {
    return { ok: false, message: '必須項目が未入力です' }
  }

  const admin = createAdminClient()

  // 既存の pending salon があれば再利用（同じメールでの再登録）
  const { data: existing } = await admin
    .from('salons')
    .select('id, status')
    .eq('email', email)
    .maybeSingle()

  if (existing?.status === 'active') {
    return { ok: false, message: 'このメールアドレスは既に登録済みです。ログインページからサインインしてください。' }
  }

  if (existing?.id) {
    await admin.from('salons').update({
      name: input.salonName,
      hotpepper_url: input.hotpepperUrl || null,
      ical_url: input.icalUrl || null,
      owner_name: input.ownerName,
      phone: input.phone || null,
      plan: input.plan,
    }).eq('id', existing.id)
    return { ok: true, salonId: existing.id }
  }

  const { data, error } = await admin
    .from('salons')
    .insert({
      name: input.salonName,
      hotpepper_url: input.hotpepperUrl || null,
      ical_url: input.icalUrl || null,
      owner_name: input.ownerName,
      phone: input.phone || null,
      email,
      plan: input.plan,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) {
    return { ok: false, message: error?.message ?? '登録に失敗しました' }
  }
  return { ok: true, salonId: data.id }
}
