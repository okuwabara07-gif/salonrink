'use client'
import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { sendMagicLink, type LoginState } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState | null, FormData>(
    sendMagicLink,
    null
  )
  const [cooldown, setCooldown] = useState(0)
  const [email, setEmail] = useState('')

  // レート制限エラーを検出してcooldownを設定
  useEffect(() => {
    if (state && !state.ok && state.message) {
      const match = state.message.match(/(\d+)秒後/)
      if (match) {
        const seconds = parseInt(match[1])
        setCooldown(seconds)
      }
    }
  }, [state])

  // カウントダウン処理
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cooldown > 0}
            style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,background:cooldown > 0 ? '#F5F5F5' : '#FAFAFA',outline:'none',boxSizing:'border-box',marginBottom:12,opacity:cooldown > 0 ? 0.6 : 1,cursor:cooldown > 0 ? 'not-allowed' : 'text'}}
          />
          <button
            type="submit"
            disabled={pending || cooldown > 0 || !email}
            style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:(pending || cooldown > 0)?'#E0D8D0':'#1A1018',color:(pending || cooldown > 0)?'#999':'#FAF6EE',fontSize:14,cursor:(pending || cooldown > 0)?'not-allowed':'pointer'}}
          >
            {cooldown > 0 ? `${cooldown}秒後に再送信可能` : pending ? '送信中...' : 'ログインリンクを送る'}
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
