'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { registerSalon, sendRegistrationOtp } from './actions'
import { CheckoutButton } from '@/app/pricing/checkout-button'
import { createClient } from '@/lib/supabase/client'

function RegisterFormContent() {
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [freePlanActivated, setFreePlanActivated] = useState(false)
  const [error, setError] = useState('')
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [inviteCodeValidated, setInviteCodeValidated] = useState(false)
  const [inviteCodeChecking, setInviteCodeChecking] = useState(false)
  const [inviteCodeError, setInviteCodeError] = useState('')

  const [form, setForm] = useState({
    salonName: '',
    hotpepperUrl: '',
    icalUrl: '',
    ownerName: '',
    phone: '',
    email: '',
    plan: 'basic',
  })

  // Check for step=2 param and verify session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const stepParam = searchParams.get('step')
      const supabase = createClient()

      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!error && user) {
          setAuthUser({ id: user.id, email: user.email || '' })
          if (stepParam === '2') {
            setStep(2)
          } else if (step === 1) {
            setStep(2)
          }
        }
      } catch (err) {
        console.error('Auth check error:', err)
      }
    }

    checkAuth()
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSendOtp = async () => {
    const email = form.email.trim().toLowerCase()
    if (!email) {
      setError('メールアドレスを入力してください')
      return
    }
    setError('')
    setLoading(true)
    const result = await sendRegistrationOtp(email)
    if (!result.ok) {
      setError(result.message || 'メール送信に失敗しました')
      setLoading(false)
    } else {
      setOtpSent(true)
      setLoading(false)
    }
  }

  const handleValidateInviteCode = async () => {
    const code = inviteCodeInput.trim().toUpperCase()
    if (!code) {
      setInviteCodeError('コードを入力してください')
      return
    }

    setInviteCodeError('')
    setInviteCodeChecking(true)

    try {
      const res = await fetch('/api/validate-invite-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()

      if (data.valid) {
        setInviteCodeValidated(true)
        setInviteCodeError('')
      } else {
        setInviteCodeValidated(false)
        setInviteCodeError(data.error || 'コードが無効です')
      }
    } catch (err) {
      setInviteCodeValidated(false)
      setInviteCodeError('コード検証に失敗しました')
    } finally {
      setInviteCodeChecking(false)
    }
  }

  const handleInviteCodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidateInviteCode()
    }
  }

  const handleSubmit = async () => {
    if (loading || !authUser) return
    setLoading(true)
    setError('')

    const result = await registerSalon({
      salonName: form.salonName,
      hotpepperUrl: form.hotpepperUrl,
      icalUrl: form.icalUrl,
      ownerName: form.ownerName,
      phone: form.phone,
      email: authUser.email,
      plan: inviteCodeValidated ? 'free' : form.plan,
      ownerUserId: authUser.id,
      inviteCodeUsed: inviteCodeValidated,
    })

    if (!result.ok) {
      setLoading(false)
      setError(result.message)
      return
    }

    setFreePlanActivated(result.freePlanActivated)
    setRegistered(true)
  }

  const plans = [
    { id: 'basic', name: 'ベーシック', price: '¥980', desc: '予約同期・リマインド自動送信' },
    { id: 'small', name: 'スモール', price: '¥2,480', desc: '＋顧客カルテ・失客アラート' },
    { id: 'medium', name: 'ミディアム', price: '¥3,980', desc: '＋売上レポート・スタッフ管理' },
  ]

  if (registered) {
    return (
      <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',padding:'40px 20px',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{maxWidth:520,width:'100%',background:'#fff',borderRadius:16,padding:'48px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)',textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:16}}>🎉</div>
          <h2 style={{fontSize:20,fontWeight:400,color:'#1A1018',marginBottom:12}}>登録完了！</h2>
          {freePlanActivated ? (
            <>
              <div style={{background:'#E8F5E9',borderRadius:12,padding:16,border:'2px solid #4CAF50',marginBottom:24}}>
                <p style={{fontSize:13,color:'#228B22',fontWeight:700,margin:0}}>✅ 永久無料プランが適用されました</p>
              </div>
              <p style={{fontSize:13,color:'#888',marginBottom:32,lineHeight:1.8}}>
                {form.ownerName}様、ご登録ありがとうございます。<br/>
                <strong>{authUser?.email}</strong> にログインリンクを送信しました。<br/>
                メールをご確認のうえ、ログインしてください。
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
                <a href="https://line.me/R/ti/p/@545fncvi" target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'12px 20px',borderRadius:6,background:'#00B900',color:'#fff',textDecoration:'none',fontSize:13,fontFamily:'sans-serif',textAlign:'center',fontWeight:500}}>LINE公式アカウントと連携する →</a>
                <a href="/dashboard" style={{display:'block',padding:'12px 20px',borderRadius:6,background:'#1A1018',color:'#FAF6EE',textDecoration:'none',fontSize:13,fontFamily:'sans-serif',textAlign:'center',fontWeight:500}}>ダッシュボードへ →</a>
              </div>
            </>
          ) : (
            <>
              <p style={{fontSize:13,color:'#888',marginBottom:32,lineHeight:1.8}}>
                {form.ownerName}様、ご登録ありがとうございます。<br/>
                次に決済を完了してください。
              </p>
              <CheckoutButton plan={form.plan as 'basic' | 'small' | 'medium' | 'free'} style={{marginBottom:16}} />
            </>
          )}
          <a href="/" style={{fontSize:13,color:'#888',textDecoration:'none',display:'block',marginTop:16,textAlign:'center'}}>トップページに戻る</a>
        </div>
      </main>
    )
  }

  return (
    <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',padding:'40px 20px'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{marginBottom:8,lineHeight:1}}>
          <div style={{fontSize:26,fontWeight:400,letterSpacing:8,color:'#1A1018'}}>SALOMÉ</div>
          <div style={{fontSize:10,letterSpacing:4,color:'#B8966A',marginTop:4}}>SalonRink</div>
        </div>
        <p style={{fontSize:13,color:'#888',letterSpacing:2}}>無料トライアル 14日間</p>
      </div>

      {/* ステップインジケーター */}
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,marginBottom:40}}>
        {['メール認証','サロン情報','プラン選択'].map((label,i) => (
          <div key={label} style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:step>i+1?'#1A1018':step===i+1?'#B8966A':'#E0D8D0',color:step>=i+1?'#fff':'#999',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>
              {step>i+1?'✓':i+1}
            </div>
            <span style={{fontSize:12,color:step===i+1?'#1A1018':'#999'}}>{label}</span>
            {i<2&&<div style={{width:20,height:1,background:'#E0D8D0'}}/>}
          </div>
        ))}
      </div>

      <div style={{maxWidth:520,margin:'0 auto',background:'#fff',borderRadius:16,padding:'36px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>

        {error && (
          <div style={{background:'#FFE8E8',borderRadius:8,padding:16,border:'1px solid #FFB3B3',marginBottom:20}}>
            <p style={{fontSize:13,color:'#C00',margin:'0 0 12px 0'}}>{error}</p>
            <button onClick={()=>{window.location.href='/login'}} style={{padding:'10px 16px',borderRadius:6,border:'none',background:'#1A1018',color:'#FAF6EE',fontSize:13,cursor:'pointer',fontFamily:'sans-serif'}}>ログインする →</button>
          </div>
        )}

        {step===1&&(
          <div>
            <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:6}}>メールアドレスを入力</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:24}}>ログインリンクを送信します</p>

            {!otpSent ? (
              <>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:12,color:'#666',display:'block',marginBottom:6}}>メールアドレス</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="例：info@salon.com"
                    style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,color:'#1A1018',background:'#FAFAFA',outline:'none',boxSizing:'border-box'}}
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading || !form.email.trim()}
                  style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:(loading || !form.email.trim())?'#E0D8D0':'#1A1018',color:(loading || !form.email.trim())?'#999':'#FAF6EE',fontSize:14,cursor:'pointer'}}
                >
                  {loading ? '送信中...' : 'ログインリンクを送信 →'}
                </button>
              </>
            ) : (
              <div>
                <div style={{background:'#E8F5E9',borderRadius:12,padding:16,border:'2px solid #4CAF50',marginBottom:24,textAlign:'center'}}>
                  <p style={{fontSize:13,color:'#228B22',fontWeight:700,margin:'0 0 8px 0'}}>✅ メールを送信しました</p>
                  <p style={{fontSize:12,color:'#666',margin:0}}>
                    <strong>{form.email}</strong><br/>
                    に送信されたリンクをクリックしてログインしてください。
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOtpSent(false)
                    setForm({...form, email: ''})
                  }}
                  style={{width:'100%',padding:'14px',borderRadius:10,border:'1px solid #E0D8D0',background:'#fff',color:'#666',fontSize:14,cursor:'pointer'}}
                >
                  別のメールアドレスで試す
                </button>
              </div>
            )}
          </div>
        )}

        {step===2&&(
          <div>
            <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:6}}>サロン情報を入力</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:16}}>ホットペッパービューティーに掲載中のサロン情報を入力してください</p>
            <div style={{background:'#FFF8F0',borderRadius:8,padding:12,border:'1px solid #FFD8A8',marginBottom:20,fontSize:11,color:'#996633',lineHeight:1.7}}>
              ⚠️ 免責事項：SALOMÉはツール提供のみを行います。ホットペッパービューティーの利用規約の遵守はお客様ご自身の責任となります。当サービスはリクルート社とは一切関係ありません。
            </div>
            {[
              {name:'salonName',label:'サロン名',placeholder:'例：ヘアサロン キレイ 鶴見店'},
              {name:'hotpepperUrl',label:'ホットペッパービューティー サロンページURL',placeholder:'https://beauty.hotpepper.jp/slnH000...'},
              {name:'icalUrl',label:'サロンボード iCalURL（任意）',placeholder:'webcal://...'},
              {name:'ownerName',label:'オーナー/担当者名',placeholder:'例：田中 花子'},
              {name:'phone',label:'電話番号',placeholder:'例：090-1234-5678'},
            ].map(f=>(
              <div key={f.name} style={{marginBottom:16}}>
                <label style={{fontSize:12,color:'#666',display:'block',marginBottom:6}}>{f.label}</label>
                <input name={f.name} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                  style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,color:'#1A1018',background:'#FAFAFA',outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            <div style={{display:'flex',gap:12,marginTop:8}}>
              <button onClick={()=>setStep(1)} style={{padding:'14px 20px',borderRadius:10,border:'1px solid #E0D8D0',background:'#fff',color:'#666',fontSize:14,cursor:'pointer'}}>← 戻る</button>
              <button onClick={()=>setStep(3)} disabled={!form.salonName||!form.ownerName} style={{flex:1,padding:'14px',borderRadius:10,border:'none',background:(!form.salonName||!form.ownerName)?'#E0D8D0':'#1A1018',color:(!form.salonName||!form.ownerName)?'#999':'#FAF6EE',fontSize:14,cursor:'pointer'}}>次へ：プランを選択 →</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div>
            {/* 招待コード確認済みの場合：フリープラン確認画面 */}
            {inviteCodeValidated ? (
              <div>
                <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:6}}>登録内容を確認</h2>
                <p style={{fontSize:13,color:'#888',marginBottom:24}}>永久無料プランで登録を完了します</p>

                <div style={{background:'#E8F5E9',borderRadius:10,padding:16,border:'2px solid #4CAF50',marginBottom:24}}>
                  <p style={{fontSize:12,color:'#228B22',marginBottom:10,fontWeight:500}}>✅ 永久無料プランが適用されます</p>
                  <p style={{margin:'4px 0',fontSize:13}}>サロン名：{form.salonName}</p>
                  <p style={{margin:'4px 0',fontSize:13}}>担当者：{form.ownerName}</p>
                  <p style={{margin:'4px 0',fontSize:13}}>メール：{authUser?.email}</p>
                  <p style={{margin:'4px 0',fontSize:13}}>プラン：永久無料 ¥0/月</p>
                </div>

                <div style={{display:'flex',gap:12}}>
                  <button onClick={()=>{setInviteCodeValidated(false);setInviteCodeInput('')}} style={{padding:'14px 20px',borderRadius:10,border:'1px solid #E0D8D0',background:'#fff',color:'#666',fontSize:14,cursor:'pointer'}}>← 戻る</button>
                  <button onClick={handleSubmit} disabled={loading || !authUser}
                    style={{flex:1,padding:'14px',borderRadius:10,border:'none',background:(loading || !authUser)?'#E0D8D0':'#4CAF50',color:(loading || !authUser)?'#999':'#FAF6EE',fontSize:14,cursor:(loading || !authUser)?'not-allowed':'pointer'}}>
                    {loading?'登録中...':'永久無料で登録する →'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:6}}>プランを選択して登録</h2>
                <p style={{fontSize:13,color:'#888',marginBottom:24}}>プランを選択して登録を完了してください</p>

                {plans.map(plan=>(
                  <div key={plan.id} onClick={()=>setForm({...form,plan:plan.id})}
                    style={{padding:'16px 20px',borderRadius:10,border:`2px solid ${form.plan===plan.id?'#B8966A':'#E8E0D8'}`,background:form.plan===plan.id?'#FBF6F0':'#fff',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:500,color:'#1A1018'}}>{plan.name}</div>
                      <div style={{fontSize:12,color:'#888',marginTop:2}}>{plan.desc}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:18,fontWeight:500,color:'#B8966A'}}>{plan.price}</div>
                      <div style={{fontSize:11,color:'#999'}}>/月（税込）</div>
                    </div>
                  </div>
                ))}

                {/* 招待コード入力欄 */}
                <div style={{background:'#FFF8F0',borderRadius:10,padding:16,border:'1px solid #FFD8A8',marginBottom:24,marginTop:24}}>
                  <label style={{fontSize:12,color:'#996633',display:'block',marginBottom:8,fontWeight:500}}>招待コードをお持ちですか？</label>
                  <div style={{display:'flex',gap:8}}>
                    <input
                      type="password"
                      value={inviteCodeInput}
                      onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                      onKeyPress={handleInviteCodeKeyPress}
                      placeholder="••••••••••"
                      style={{flex:1,padding:'10px 12px',borderRadius:8,border:'1px solid #FFD8A8',fontSize:13,outline:'none',boxSizing:'border-box',background:'#fff',letterSpacing:'0.3em'}}
                    />
                    <button
                      onClick={handleValidateInviteCode}
                      disabled={inviteCodeChecking || !inviteCodeInput.trim()}
                      style={{padding:'10px 16px',borderRadius:8,border:'none',background:'#996633',color:'#fff',fontSize:12,cursor:inviteCodeChecking || !inviteCodeInput.trim()?'not-allowed':'pointer',opacity:inviteCodeChecking || !inviteCodeInput.trim()?0.6:1}}
                    >
                      {inviteCodeChecking?'確認中...':'確認'}
                    </button>
                  </div>
                  {inviteCodeError && <p style={{fontSize:12,color:'#C00',margin:'8px 0 0 0'}}>{inviteCodeError}</p>}
                </div>

                <div style={{background:'#F8F4EF',borderRadius:10,padding:16,border:'1px solid #EAE0D5',marginBottom:24}}>
                  <p style={{fontSize:12,color:'#7A6E64',marginBottom:10,fontWeight:500}}>登録内容</p>
                  <p style={{margin:'4px 0',fontSize:13}}>サロン名：{form.salonName}</p>
                  <p style={{margin:'4px 0',fontSize:13}}>担当者：{form.ownerName}</p>
                  <p style={{margin:'4px 0',fontSize:13}}>メール：{authUser?.email}</p>
                  <p style={{margin:'4px 0',fontSize:13}}>プラン：{plans.find(p=>p.id===form.plan)?.name} {plans.find(p=>p.id===form.plan)?.price}/月</p>
                  <p style={{margin:'8px 0 0',fontSize:11,color:'#B8966A'}}>✅ 14日間無料トライアル付き</p>
                </div>

                <div style={{display:'flex',gap:12}}>
                  <button onClick={()=>setStep(2)} style={{padding:'14px 20px',borderRadius:10,border:'1px solid #E0D8D0',background:'#fff',color:'#666',fontSize:14,cursor:'pointer'}}>← 戻る</button>
                  <button onClick={handleSubmit} disabled={loading || !authUser}
                    style={{flex:1,padding:'14px',borderRadius:10,border:'none',background:(loading || !authUser)?'#E0D8D0':'#1A1018',color:(loading || !authUser)?'#999':'#FAF6EE',fontSize:14,cursor:(loading || !authUser)?'not-allowed':'pointer'}}>
                    {loading?'登録中...':'登録してStripeで決済へ →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <p style={{textAlign:'center',fontSize:12,color:'#AAA',marginTop:32}}>
        <a href="/tokusho" style={{color:'#AAA'}}>特定商取引法</a>　|
        <a href="/privacy" style={{color:'#AAA'}}>プライバシーポリシー</a>
      </p>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',padding:'40px 20px',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{maxWidth:520,width:'100%',background:'#fff',borderRadius:16,padding:'48px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)',textAlign:'center'}}>
          <p style={{fontSize:13,color:'#888'}}>読み込み中...</p>
        </div>
      </main>
    }>
      <RegisterFormContent />
    </Suspense>
  )
}
