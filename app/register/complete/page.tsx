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
    title="お申し込みありがとうございます"
    email={salon.email}
    salonId={salon_id}
  />
}

function Message({
  title,
  body,
  email,
  salonId,
  cta,
}: {
  title: string
  body?: string
  email?: string
  salonId?: string
  cta?: { href: string; label: string }
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F2EAD8 0%, #FAF6EE 50%, #F2EAD8 100%)',
        fontFamily: 'Georgia, serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: '100%',
          background: '#fff',
          borderRadius: 8,
          padding: '60px 40px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 40, lineHeight: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: 8, color: '#1A1018' }}>SALOMÉ</div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: '#B8966A', marginTop: 4, fontFamily: 'sans-serif' }}>
            SalonRink
          </div>
        </div>

        {/* Success Icon */}
        <div style={{ fontSize: 60, marginBottom: 24 }}>✓</div>

        <h1 style={{ fontSize: 28, fontWeight: 400, color: '#1A1018', marginBottom: 16, letterSpacing: 2 }}>
          {title}
        </h1>

        {email && (
          <p style={{ fontSize: 14, color: '#7A6E64', lineHeight: 1.8, marginBottom: 32, fontFamily: 'sans-serif' }}>
            ログインリンクを <strong>{email}</strong> にお送りしました。<br />
            メールをご確認ください。
          </p>
        )}

        {body && <p style={{ fontSize: 14, color: '#7A6E64', lineHeight: 1.8, marginBottom: 32, fontFamily: 'sans-serif' }}>{body}</p>}

        {/* Next Steps */}
        <div
          style={{
            background: '#FAF6EE',
            borderLeft: '3px solid #B8966A',
            padding: '20px 24px',
            marginBottom: 32,
            textAlign: 'left',
          }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1018', marginBottom: 12, letterSpacing: 1, fontFamily: 'sans-serif' }}>
            次のステップ
          </h3>
          <ol
            style={{
              fontSize: 13,
              color: '#7A6E64',
              lineHeight: 1.8,
              paddingLeft: 20,
              fontFamily: 'sans-serif',
            }}
          >
            <li style={{ marginBottom: 8 }}>メール内のリンクをクリックしてログイン</li>
            <li style={{ marginBottom: 8 }}>ダッシュボードで LINE 連携を設定</li>
            <li>リッチメニューから予約管理を開始</li>
          </ol>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#7A3550',
              color: '#FAF6EE',
              textDecoration: 'none',
              fontSize: 13,
              letterSpacing: 1,
              fontFamily: 'sans-serif',
              borderRadius: 4,
            }}
          >
            ダッシュボードへ →
          </a>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              border: '1px solid #B8966A',
              color: '#7A6E64',
              textDecoration: 'none',
              fontSize: 13,
              letterSpacing: 1,
              fontFamily: 'sans-serif',
              borderRadius: 4,
            }}
          >
            トップページに戻る
          </a>
        </div>

        {cta && (
          <a
            href={cta.href}
            style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '12px 24px',
              borderRadius: 4,
              background: '#1A1018',
              color: '#FAF6EE',
              textDecoration: 'none',
              fontSize: 13,
              fontFamily: 'sans-serif',
            }}
          >
            {cta.label}
          </a>
        )}
      </div>
    </main>
  )
}
