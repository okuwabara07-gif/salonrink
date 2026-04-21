'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerSalon } from './actions'
import { CheckoutButton } from '@/app/pricing/checkout-button'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    salonName: '',
    hotpepperUrl: '',
    icalUrl: '',
    ownerName: '',
    phone: '',
    email: '',
    plan: 'basic',
  })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const plans = [
    { id: 'basic', name: 'ベーシック', price: '¥980', desc: '予約同期・リマインド自動送信' },
    { id: 'small', name: 'スモール', price: '¥2,480', desc: '＋顧客カルテ・失客アラート' },
    { id: 'medium', name: 'ミディアム', price: '¥3,980', desc: '＋売上レポート・スタッフ管理' },
  ]

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    const result = await registerSalon({
      salonName: form.salonName,
      hotpepperUrl: form.hotpepperUrl,
      icalUrl: form.icalUrl,
      ownerName: form.ownerName,
      phone: form.phone,
      email: form.email,
      plan: form.plan,
    })
    if (!result.ok) {
      setLoading(false)
      setError(result.message)
      return
    }
    setRegistered(true)
  }

  if (registered) {
    return (
      <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',padding:'40px 20px',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{maxWidth:520,width:'100%',background:'#fff',borderRadius:16,padding:'48px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)',textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:16}}>🎉</div>
          <h2 style={{fontSize:20,fontWeight:400,color:'#1A1018',marginBottom:12}}>登録完了！</h2>
          <p style={{fontSize:13,color:'#888',marginBottom:32,lineHeight:1.8}}>
            {form.ownerName}様、ご登録ありがとうございます。<br/>
            次にプランを選択して決済を完了してください。
          </p>
          <CheckoutButton plan={form.plan as 'basic' | 'small' | 'medium'} style={{marginBottom:16}} />
          <a href="/" style={{fontSize:13,color:'#888',textDecoration:'none'}}>トップページに戻る</a>
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
        {['サロン情報','プラン選択','LINE連携'].map((label,i) => (
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
              {name:'email',label:'メールアドレス',placeholder:'例：info@salon.com'},
            ].map(f=>(
              <div key={f.name} style={{marginBottom:16}}>
                <label style={{fontSize:12,color:'#666',display:'block',marginBottom:6}}>{f.label}</label>
                <input name={f.name} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                  style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,color:'#1A1018',background:'#FAFAFA',outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            <button onClick={()=>setStep(2)} disabled={!form.salonName||!form.ownerName||!form.email}
              style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:(!form.salonName||!form.ownerName||!form.email)?'#E0D8D0':'#1A1018',color:(!form.salonName||!form.ownerName||!form.email)?'#999':'#FAF6EE',fontSize:14,cursor:'pointer',marginTop:8}}>
              次へ：プランを選択 →
            </button>
          </div>
        )}

        {step===2&&(
          <div>
            <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:6}}>プランを選択</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:24}}>14日間無料トライアル後に課金開始。いつでも解約可能。</p>
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
            <div style={{display:'flex',gap:12,marginTop:8}}>
              <button onClick={()=>setStep(1)} style={{padding:'14px 20px',borderRadius:10,border:'1px solid #E0D8D0',background:'#fff',color:'#666',fontSize:14,cursor:'pointer'}}>← 戻る</button>
              <button onClick={()=>setStep(3)} style={{flex:1,padding:'14px',borderRadius:10,border:'none',background:'#1A1018',color:'#FAF6EE',fontSize:14,cursor:'pointer'}}>次へ：LINE連携 →</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div>
            <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:6}}>確認して登録</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:24}}>内容を確認して登録を完了してください</p>
            <div style={{background:'#F8F4EF',borderRadius:10,padding:16,border:'1px solid #EAE0D5',marginBottom:24}}>
              <p style={{fontSize:12,color:'#7A6E64',marginBottom:10,fontWeight:500}}>登録内容</p>
              <p style={{margin:'4px 0',fontSize:13}}>サロン名：{form.salonName}</p>
              <p style={{margin:'4px 0',fontSize:13}}>担当者：{form.ownerName}</p>
              <p style={{margin:'4px 0',fontSize:13}}>メール：{form.email}</p>
              <p style={{margin:'4px 0',fontSize:13}}>プラン：{plans.find(p=>p.id===form.plan)?.name} {plans.find(p=>p.id===form.plan)?.price}/月</p>
              <p style={{margin:'8px 0 0',fontSize:11,color:'#B8966A'}}>✅ 14日間無料トライアル付き</p>
            </div>
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setStep(2)} style={{padding:'14px 20px',borderRadius:10,border:'1px solid #E0D8D0',background:'#fff',color:'#666',fontSize:14,cursor:'pointer'}}>← 戻る</button>
              <button onClick={handleSubmit} disabled={loading}
                style={{flex:1,padding:'14px',borderRadius:10,border:'none',background:loading?'#E0D8D0':'#1A1018',color:loading?'#999':'#FAF6EE',fontSize:14,cursor:loading?'not-allowed':'pointer'}}>
                {loading?'登録中...':'登録してStripeで決済へ →'}
              </button>
            </div>
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
