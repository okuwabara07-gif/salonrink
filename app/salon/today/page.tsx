import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TodayBoard from './_components/TodayBoard'

export const metadata = { title: '本日の来店 | SalonRink' }

export default async function SalonTodayPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: salons } = await supabase
    .from('salons')
    .select('id, name')
    .eq('owner_user_id', user.id)
    .limit(1)

  const salon = salons?.[0]
  if (!salon) {
    return (
      <main style={{ padding: '48px', fontSize: '16px', color: '#3B4656' }}>
        このアカウントに紐付いたサロンが見つかりませんでした。
      </main>
    )
  }

  return <TodayBoard salonId={salon.id as string} salonName={(salon.name as string | null) ?? ''} />
}
