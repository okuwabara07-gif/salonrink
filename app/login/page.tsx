'use client'
import { useState } from 'react'
import { useActionState } from 'react'
import { signInWithPassword, type LoginState } from './actions'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  // Mode切り替えなし: パスワードリセットは /auth/reset-password ページで処理
  const [formState, formAction, pending] = useActionState<LoginState | null, FormData>(
    signInWithPassword,
    null
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
  }


  return (
    <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:440,background:'#fff',borderRadius:16,padding:'40px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
        <div style={{textAlign:'center',marginBottom:24,lineHeight:1}}>
          <div style={{fontSize:26,fontWeight:400,letterSpacing:8,color:'#1A1018'}}>SalonRink</div>
          <div style={{fontSize:10,letterSpacing:4,color:'#B8966A',marginTop:4}}>SalonRink</div>
        </div>
        <h1 style={{fontSize:16,fontWeight:400,color:'#1A1018',textAlign:'center',marginBottom:24}}>ログイン</h1>

        <button type="button" onClick={handleGoogle} disabled={pending} style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'1px solid #E0D8D0',background:'#fff',color:'#1A1018',fontSize:14,fontWeight:500,cursor:pending?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:18,opacity:pending?0.6:1}}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
          Googleでログイン
        </button>
        <div style={{display:'flex',alignItems:'center',gap:12,margin:'0 0 18px'}}>
          <span style={{flex:1,height:1,background:'#E0D8D0'}}></span>
          <span style={{fontSize:11,color:'#B8966A'}}>または</span>
          <span style={{flex:1,height:1,background:'#E0D8D0'}}></span>
        </div>

        <p style={{fontSize:12,color:'#888',lineHeight:1.8,marginBottom:24,textAlign:'center'}}>
          メールアドレスとパスワードでログイン
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
            disabled={pending}
            style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,background:'#FAFAFA',outline:'none',boxSizing:'border-box',marginBottom:12,opacity:pending ? 0.6 : 1,cursor:pending ? 'not-allowed' : 'text'}}
          />
          <div style={{position:'relative',marginBottom:12}}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              style={{width:'100%',padding:'12px 14px',paddingRight:40,borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,background:'#FAFAFA',outline:'none',boxSizing:'border-box',opacity:pending ? 0.6 : 1,cursor:pending ? 'not-allowed' : 'text'}}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={pending}
              style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:12,padding:0}}
            >
              {showPassword ? '隠す' : '表示'}
            </button>
          </div>
          <button
            type="submit"
            disabled={pending || !email || !password}
            style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:pending?'#D4B884':'#C9A961',color:pending?'#999':'#FAF6EE',fontSize:14,fontWeight:500,cursor:pending?'not-allowed':'pointer',transition:'all 0.2s ease'}}
          >
            {pending ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        <div style={{marginTop:20,paddingTop:20,borderTop:'1px solid #E0D8D0',textAlign:'center'}}>
          <p style={{fontSize:12,color:'#888',marginBottom:12}}>パスワードをお忘れですか？</p>
          <a
            href="/auth/reset-password"
            style={{background:'none',border:'none',color:'#B8966A',fontSize:12,cursor:'pointer',textDecoration:'underline',padding:0,display:'inline-block'}}
          >
            パスワードリセット
          </a>
        </div>

        {formState && (
          <p style={{marginTop:16,fontSize:13,textAlign:'center',color:formState.ok?'#3B6D11':'#A32D2D'}}>
            {formState.message}
          </p>
        )}
      </div>
      <div style={{textAlign:'center', marginTop:'24px'}}>
        <a href="/" style={{fontSize:13, color:'#C9A961', textDecoration:'none'}}>
          ← ホームに戻る
        </a>
      </div>
    </main>
  )
}
