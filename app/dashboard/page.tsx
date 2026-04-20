import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const { data: salon } = await supabase
    .from('salons')
    .select('id, name, owner_name, plan, trial_ends_at, ical_url')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  if (!salon) {
    return (
      <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F8F4EF',fontFamily:'Georgia, serif',padding:24}}>
        <div style={{maxWidth:420,textAlign:'center'}}>
          <p style={{fontSize:16,color:'#1A1018',marginBottom:12}}>サロンがリンクされていません</p>
          <p style={{fontSize:13,color:'#888',lineHeight:1.8}}>
            登録が完了していない可能性があります。<br/>
            サポート（aokae2020@gmail.com）までご連絡ください。
          </p>
          <form action="/auth/signout" method="post" style={{marginTop:20}}>
            <button type="submit" style={{padding:'8px 20px',fontSize:12,border:'1px solid #ccc',background:'#fff',borderRadius:6,cursor:'pointer'}}>ログアウト</button>
          </form>
        </div>
      </main>
    )
  }

  const [{ data: reservations }, { data: customers }] = await Promise.all([
    supabase.from('reservations').select('id, customer_name, datetime, menu, status').eq('salon_id', salon.id).order('datetime', { ascending: false }).limit(50),
    supabase.from('customers').select('id, name, visit_count, last_visit').eq('salon_id', salon.id).order('last_visit', { ascending: false, nullsFirst: false }).limit(50),
  ])

  return (
    <DashboardClient
      salon={salon}
      reservations={reservations ?? []}
      customers={customers ?? []}
    />
  )
}
