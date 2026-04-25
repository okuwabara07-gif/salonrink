'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage({ ok: false, text: 'パスワードが一致しません' })
      return
    }
    if (password.length < 8) {
      setMessage({ ok: false, text: 'パスワードは8文字以上である必要があります' })
      return
    }

    setLoading(true)
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage({ ok: false, text: error.message })
    } else {
      setMessage({ ok: true, text: 'パスワードをリセットしました。ログインページからログインしてください。' })
      setPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:440,background:'#fff',borderRadius:16,padding:'40px 32px',boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
        <div style={{textAlign:'center',marginBottom:24,lineHeight:1}}>
          <div style={{fontSize:26,fontWeight:400,letterSpacing:8,color:'#1A1018'}}>SalonRink</div>
          <div style={{fontSize:10,letterSpacing:4,color:'#B8966A',marginTop:4}}>SalonRink</div>
        </div>
        <h1 style={{fontSize:16,fontWeight:400,color:'#1A1018',textAlign:'center',marginBottom:24}}>パスワードをリセット</h1>
        <p style={{fontSize:12,color:'#888',lineHeight:1.8,marginBottom:24,textAlign:'center'}}>
          新しいパスワードを入力してください
        </p>

        <form onSubmit={handleResetPassword}>
          <div style={{position:'relative',marginBottom:12}}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="新しいパスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{width:'100%',padding:'12px 14px',paddingRight:40,borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,background:'#FAFAFA',outline:'none',boxSizing:'border-box',marginBottom:12,opacity:loading ? 0.6 : 1}}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:12,padding:0}}
            >
              {showPassword ? '隠す' : '表示'}
            </button>
          </div>

          <div style={{position:'relative',marginBottom:12}}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="パスワード（確認）"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              style={{width:'100%',padding:'12px 14px',paddingRight:40,borderRadius:8,border:'1px solid #E0D8D0',fontSize:14,background:'#FAFAFA',outline:'none',boxSizing:'border-box',marginBottom:12,opacity:loading ? 0.6 : 1}}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:(loading || !password || !confirmPassword)?'#E0D8D0':'#1A1018',color:(loading || !password || !confirmPassword)?'#999':'#FAF6EE',fontSize:14,fontWeight:500,cursor:(loading || !password || !confirmPassword)?'not-allowed':'pointer',transition:'all 0.2s ease'}}
          >
            {loading ? '更新中...' : 'パスワードを更新'}
          </button>
        </form>

        {message && (
          <p style={{marginTop:16,fontSize:13,textAlign:'center',color:message.ok?'#3B6D11':'#A32D2D'}}>
            {message.text}
          </p>
        )}

        {message?.ok && (
          <div style={{marginTop:20,paddingTop:20,borderTop:'1px solid #E0D8D0',textAlign:'center'}}>
            <a href="/login" style={{background:'none',border:'none',color:'#B8966A',fontSize:12,cursor:'pointer',textDecoration:'underline',padding:0,display:'inline-block'}}>
              ログインページに戻る
            </a>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <ResetPasswordContent />
  )
}
