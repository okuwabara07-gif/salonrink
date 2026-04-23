'use client'
import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { signInWithPassword, sendPasswordReset, type LoginState } from './actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'forgot'>('password')
  const [formState, formAction, pending] = useActionState<LoginState | null, FormData>(
    mode === 'password' ? signInWithPassword : sendPasswordReset,
    null
  )
  const [cooldown, setCooldown] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (formState && !formState.ok && formState.message) {
      const match = formState.message.match(/(\d+)秒後/)
      if (match) {
        const seconds = parseInt(match[1])
        setCooldown(seconds)
      }
    }
  }, [formState])

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

  const handleModeChange = (newMode: 'password' | 'forgot') => {
    setMode(newMode)
    setPassword('')
    setEmail('')
  }

  return (
    <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:440,background:'#fff',borderRadius:16,padding:'40px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
        <div style={{textAlign:'center',marginBottom:24,lineHeight:1}}>
          <div style={{fontSize:26,fontWeight:400,letterSpacing:8,color:'#1A1018'}}>SALOMÉ</div>
          <div style={{fontSize:10,letterSpacing:4,color:'#B8966A',marginTop:4}}>SalonRink</div>
        </div>
        <h1 style={{fontSize:16,fontWeight:400,color:'#1A1018',textAlign:'center',marginBottom:24}}>ログイン</h1>

        {mode === 'password' ? (
          <>
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
                disabled={pending || cooldown > 0}
                style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,background:'#FAFAFA',outline:'none',boxSizing:'border-box',marginBottom:12,opacity:pending || cooldown > 0 ? 0.6 : 1,cursor:pending || cooldown > 0 ? 'not-allowed' : 'text'}}
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
                  disabled={pending || cooldown > 0}
                  style={{width:'100%',padding:'12px 14px',paddingRight:40,borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,background:'#FAFAFA',outline:'none',boxSizing:'border-box',opacity:pending || cooldown > 0 ? 0.6 : 1,cursor:pending || cooldown > 0 ? 'not-allowed' : 'text'}}
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
                disabled={pending || cooldown > 0 || !email || !password}
                style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:(pending || cooldown > 0)?'#E0D8D0':'#1A1018',color:(pending || cooldown > 0)?'#999':'#FAF6EE',fontSize:14,fontWeight:500,cursor:(pending || cooldown > 0)?'not-allowed':'pointer',transition:'all 0.2s ease'}}
              >
                {pending ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>
            <div style={{marginTop:20,paddingTop:20,borderTop:'1px solid #E0D8D0',textAlign:'center'}}>
              <p style={{fontSize:12,color:'#888',marginBottom:12}}>パスワードをお忘れですか？</p>
              <button
                type="button"
                onClick={() => handleModeChange('forgot')}
                style={{background:'none',border:'none',color:'#B8966A',fontSize:12,cursor:'pointer',textDecoration:'underline',padding:0}}
              >
                パスワードリセット
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{fontSize:12,color:'#888',lineHeight:1.8,marginBottom:24,textAlign:'center'}}>
              登録済みのメールアドレスを入力してください。<br/>
              パスワードリセットリンクをメールでお送りします。
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
                style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:(pending || cooldown > 0)?'#E0D8D0':'#1A1018',color:(pending || cooldown > 0)?'#999':'#FAF6EE',fontSize:14,fontWeight:500,cursor:(pending || cooldown > 0)?'not-allowed':'pointer',transition:'all 0.2s ease'}}
              >
                {cooldown > 0 ? `${cooldown}秒後に再送信可能` : pending ? '送信中...' : 'リセットリンクを送る'}
              </button>
            </form>
            <div style={{marginTop:20,paddingTop:20,borderTop:'1px solid #E0D8D0',textAlign:'center'}}>
              <button
                type="button"
                onClick={() => handleModeChange('password')}
                style={{background:'none',border:'none',color:'#B8966A',fontSize:12,cursor:'pointer',textDecoration:'underline',padding:0}}
              >
                ログイン画面に戻る
              </button>
            </div>
          </>
        )}

        {formState && (
          <p style={{marginTop:16,fontSize:13,textAlign:'center',color:formState.ok?'#3B6D11':'#A32D2D'}}>
            {formState.message}
          </p>
        )}
      </div>
    </main>
  )
}
