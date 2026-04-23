'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function openCustomerPortal(): Promise<{ ok: boolean; url?: string; message?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: '未ログイン' }

  const { data: salon } = await supabase
    .from('salons')
    .select('id, stripe_customer_id')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  if (!salon?.stripe_customer_id) {
    return { ok: false, message: 'Stripe Customer ID が見つかりません' }
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/billing/portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: salon.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      }).toString(),
    })

    if (!response.ok) {
      return { ok: false, message: 'ポータルセッション作成に失敗しました' }
    }

    const data = (await response.json()) as { url?: string }
    return { ok: true, url: data.url }
  } catch (error) {
    return { ok: false, message: 'エラーが発生しました' }
  }
}
