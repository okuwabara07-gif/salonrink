import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** ログイン中オーナーが所有するサロンの先頭。未ログインは /login へ */
export async function getOwnerSalon(): Promise<{ id: string; name: string } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('salons').select('id, name').eq('owner_user_id', user.id).limit(1)
  const s = data?.[0]
  return s ? { id: s.id as string, name: (s.name as string | null) ?? '' } : null
}

export const NO_SALON_MESSAGE = 'このアカウントに紐付いたサロンが見つかりませんでした。'
