'use client'
import { useState } from 'react'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    salonName: '',
    hotpepperUrl: '',
    ownerName: '',
    phone: '',
    email: '',
    plan: 'basic',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const plans = [
    { id: 'basic', name: 'ベーシック', price: '¥980', desc: '予約同期・リマインド自動送信' },
    { id: 'small', name: 'スモール', price: '¥2,480', desc: '＋顧客カルテ・失客アラート' },
    { id: 'medium', name: 'ミディアム', price: '¥3,980', desc: '＋売上レポート・スタッフ管理' },
  ]

  return (
    <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',padding:'40px 20px'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:22,fontWeight:400,letterSpacing:6,color:'#1A1018',marginBottom:8}}>
          Salon<span style={{color:'#B8966A'}}>Rink</span>
        </div>
        <p style={{fontSize:13,color:'#888',letterSpacing:2}}>無料トライアル 14日間</p>
      </div>
      <div style={{maxWidth:520,margin:'0 auto',background:'#fff',borderRadius:16,padding:'36px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
        {step === 1 && (
          <div>
            <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:6}}>サロン情報を入力</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:16}}>ホットペッパービューティーに掲載中のサロン情報を入力してください</p><div style={{background:'#FFF8F0',borderRadius:8,padding:12,border:'1px solid #FFD8A8',marginBottom:20,fontSize:11,color:'#996633',lineHeight:1.7}}>⚠️ 免責事項：SalonRinkはツール提供のみを行います。ホットペッパービューティーの利用規約の遵守はお客様ご自身の責任となります。当サービスはリクルート社とは一切関係ありません。</div>
            {[
              {name:'salonName',label:'サロン名',placeholder:'例：ヘアサロン キレイ 鶴見店'},
              {name:'hotpepperUrl',label:'ホットペッパービューティー サロンページURL',placeholder:'https://beauty.hotpepper.jp/slnH000...'},
              {name:'ownerName',label:'オーナー/担当者名',placeholder:'例：田中 花子'},
              {name:'phone',label:'電話番号',placeholder:'例：090-1234-5678'},
              {name:'email',label:'メールアドレス',placeholder:'例：info@salon.com'},
            ].map(f => (
              <div key={f.name} style={{marginBottom:20}}>
                <label style={{fontSize:12,color:'#666',display:'block',marginBottom:6}}>{f.label} *</label>
                <input name={f.name} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                  style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,color:'#1A1018',background:'#FAFAFA',outline:'none',boxSizing:'border-box'}} />
              </div>
            ))}
            <button onClick={() => setStep(2)} disabled={!form.salonName||!form.hotpepperUrl||!form.ownerName||!form.email}
              style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:(!form.salonName||!form.hotpepperUrl||!form.ownerName||!form.email)?'#E0D8D0':'#1A1018',color:(!form.salonName||!form.hotpepperUrl||!form.ownerName||!form.email)?'#999':'#FAF6EE',fontSize:14,cursor:'pointer'}}>
              次へ：プランを選択 →
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:6}}>プランを選択</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:28}}>14日間無料トライアル後に課金開始。いつでも解約可能。</p>
            {plans.map(plan => (
              <div key={plan.id} onClick={() => setForm({...form,plan:plan.id})}
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
            <div style={{display:'flex',gap:12,marginTop:16}}>
              <button onClick={() => setStep(1)} style={{padding:'14px 20px',borderRadius:10,border:'1px solid #E0D8D0',background:'#fff',color:'#666',fontSize:14,cursor:'pointer'}}>← 戻る</button>
              <button onClick={() => setStep(3)} style={{flex:1,padding:'14px',borderRadius:10,border:'none',background:'#1A1018',color:'#FAF6EE',fontSize:14,cursor:'pointer'}}>次へ：LINE連携 →</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 style={{fontSize:18,fontWeight:400,color:'#1A1018',marginBottom:6}}>LINEと連携する</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:28}}>サロンのLINE公式アカウントと連携します</p>
            <div style={{textAlign:'center',marginBottom:32}}>
              <div style={{width:80,height:80,borderRadius:'50%',background:'#06C755',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:36}}>💬</div>
              <p style={{fontSize:13,color:'#444',lineHeight:1.8}}>LINE公式アカウントのWebhook URLに<br/>SalonRinkのURLを設定するだけで<br/>予約の自動同期が開始されます</p>
            </div>
            <div style={{background:'#F8F4EF',borderRadius:10,padding:16,border:'1px solid #EAE0D5',marginBottom:28}}>
              <p style={{fontSize:12,color:'#7A6E64',marginBottom:8,fontWeight:500}}>登録内容の確認</p>
              <p style={{margin:'4px 0',fontSize:13}}>サロン名：{form.salonName}</p>
              <p style={{margin:'4px 0',fontSize:13}}>担当者：{form.ownerName}</p>
              <p style={{margin:'4px 0',fontSize:13}}>プラン：{plans.find(p=>p.id===form.plan)?.name} {plans.find(p=>p.id===form.plan)?.price}/月</p>
            </div>
            <div style={{display:'flex',gap:12}}>
              <button onClick={() => setStep(2)} style={{padding:'14px 20px',borderRadius:10,border:'1px solid #E0D8D0',background:'#fff',color:'#666',fontSize:14,cursor:'pointer'}}>← 戻る</button>
              <a href="https://lin.ee/545fncvi" target="_blank" rel="noopener noreferrer"
                style={{flex:1,display:'block',textAlign:'center',padding:'14px',borderRadius:10,background:'#06C755',color:'#fff',textDecoration:'none',fontSize:14,fontWeight:500}}>
                LINEで始める →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
// 免責追加済み
