import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function RegisterCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ salon_id?: string; session_id?: string }>
}) {
  const { salon_id } = await searchParams

  if (!salon_id) {
    return <Message title="リンクが無効です" body="register ページから再度お試しください。" />
  }

  const admin = createAdminClient()
  const { data: salon } = await admin
    .from('salons')
    .select('id, email, status')
    .eq('id', salon_id)
    .maybeSingle()

  if (!salon) {
    return <Message title="登録情報が見つかりません" body="register ページから再度お試しください。" />
  }

  if (salon.status !== 'pending') {
    return <Message
      title="既に登録済みです"
      body="ログインページからサインインしてください。"
      cta={{ href:'/login', label:'ログインへ' }}
    />
  }

  const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  await admin.from('salons').update({
    status: 'active',
    trial_ends_at: trialEnds,
  }).eq('id', salon.id)

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error } = await supabase.auth.signInWithOtp({
    email: salon.email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })

  if (error) {
    return <Message
      title="メール送信に失敗しました"
      body={`もう一度お試しいただくか、サポート（aokae2020@gmail.com）までご連絡ください。エラー: ${error.message}`}
    />
  }

  return <Message
    title="決済完了！"
    body={`ログインリンクを ${salon.email} にお送りしました。メールをご確認ください。`}
  />
}

function Message({ title, body, cta }: { title: string; body: string; cta?: { href: string; label: string } }) {
  return (
    <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',padding:'40px 20px',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{maxWidth:520,width:'100%',background:'#fff',borderRadius:16,padding:'48px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)',textAlign:'center'}}>
        <div style={{marginBottom:16,lineHeight:1}}>
          <div style={{fontSize:22,fontWeight:400,letterSpacing:8,color:'#1A1018'}}>SALOMÉ</div>
          <div style={{fontSize:9,letterSpacing:4,color:'#B8966A',marginTop:4}}>SalonRink</div>
        </div>
        <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:16}}>{title}</h2>
        <p style={{fontSize:13,color:'#888',lineHeight:1.8,marginBottom:24}}>{body}</p>
        {cta && (
          <a href={cta.href} style={{display:'inline-block',padding:'12px 24px',borderRadius:10,background:'#1A1018',color:'#FAF6EE',textDecoration:'none',fontSize:13}}>
            {cta.label}
          </a>
        )}
      </div>
    </main>
  )
}
