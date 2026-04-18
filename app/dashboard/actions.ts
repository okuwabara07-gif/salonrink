'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveIcalUrl(icalUrl: string): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: '未ログイン' }

  const trimmed = icalUrl.trim()
  if (trimmed && !/^(webcal|https?):\/\//.test(trimmed)) {
    return { ok: false, message: 'webcal:// または https:// で始まるURLを入力してください' }
  }

  const { error } = await supabase
    .from('salons')
    .update({ ical_url: trimmed || null })
    .eq('owner_user_id', user.id)

  if (error) return { ok: false, message: error.message }

  revalidatePath('/dashboard')
  return { ok: true, message: '保存しました' }
}
