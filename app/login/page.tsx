'use client'
import { useActionState } from 'react'
import { sendMagicLink, type LoginState } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState | null, FormData>(
    sendMagicLink,
    null
  )

  return (
    <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:440,background:'#fff',borderRadius:16,padding:'40px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
        <div style={{textAlign:'center',marginBottom:24,lineHeight:1}}>
          <div style={{fontSize:26,fontWeight:400,letterSpacing:8,color:'#1A1018'}}>SALOMÉ</div>
          <div style={{fontSize:10,letterSpacing:4,color:'#B8966A',marginTop:4}}>SalonRink</div>
        </div>
        <h1 style={{fontSize:16,fontWeight:400,color:'#1A1018',textAlign:'center',marginBottom:24}}>ログイン</h1>
        <p style={{fontSize:12,color:'#888',lineHeight:1.8,marginBottom:24,textAlign:'center'}}>
          登録済みのメールアドレスを入力してください。<br/>
          ログイン用リンクをメールでお送りします。
        </p>
        <form action={formAction}>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,background:'#FAFAFA',outline:'none',boxSizing:'border-box',marginBottom:12}}
          />
          <button
            type="submit"
            disabled={pending}
            style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:pending?'#E0D8D0':'#1A1018',color:pending?'#999':'#FAF6EE',fontSize:14,cursor:pending?'not-allowed':'pointer'}}
          >
            {pending ? '送信中...' : 'ログインリンクを送る'}
          </button>
        </form>
        {state && (
          <p style={{marginTop:16,fontSize:13,textAlign:'center',color:state.ok?'#3B6D11':'#A32D2D'}}>
            {state.message}
          </p>
        )}
      </div>
    </main>
  )
}
