'use client'
import { useState } from 'react'
import { openCustomerPortal } from './actions'

type Salon = {
  id: string
  name: string | null
  owner_name: string | null
  email: string
  plan: string | null
  trial_ends_at: string | null
  status: string | null
  owner_user_id: string | null
  line_business_account_id: string | null
}

export default function DashboardClient({
  salon,
  userId,
  userEmail,
  isPending,
}: {
  salon: Salon
  userId: string
  userEmail: string
  isPending: boolean
}) {
  const [portalLoading, setPortalLoading] = useState(false)

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    const result = await openCustomerPortal()
    setPortalLoading(false)
    if (result.ok && result.url) {
      window.location.href = result.url
    }
  }

  // プラン情報
  const planDisplayName = {
    free: 'フリープラン',
    basic: 'ベーシック',
    small: 'スモール',
    medium: 'メディアム',
  }[salon.plan || 'free'] || salon.plan

  const planPrice = {
    free: '¥0/月',
    basic: '¥2,980/月',
    small: '¥4,980/月',
    medium: '¥7,980/月',
  }[salon.plan || 'free'] || '変更中'

  // 契約日と有効期限計算
  const contractDate = new Date(salon.trial_ends_at || new Date())
  const contractDateStr = contractDate.toLocaleDateString('ja-JP')

  // トライアル残日数
  let trialDaysRemaining = 0
  if (salon.plan !== 'free' && salon.trial_ends_at) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const trialEnd = new Date(salon.trial_ends_at)
    trialEnd.setHours(0, 0, 0, 0)
    trialDaysRemaining = Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const isLineConnected = !!salon.line_business_account_id

  return (
    <main style={{minHeight:'100vh',background:'#F8F4EF',fontFamily:'Georgia, serif',padding:'40px 24px'}}>
      <div style={{maxWidth:920,margin:'0 auto'}}>
        {/* ヘッダー */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:40}}>
          <div>
            <h1 style={{fontSize:32,fontWeight:400,letterSpacing:6,color:'#1A1018',margin:0}}>SALOMÉ</h1>
            <p style={{fontSize:12,color:'#B8966A',letterSpacing:2,margin:'6px 0 0 0'}}>ダッシュボード</p>
          </div>
          <div style={{textAlign:'right'}}>
            <p style={{fontSize:13,color:'#888',margin:'0 0 8px 0'}}>ログイン中：</p>
            <p style={{fontSize:13,fontWeight:500,color:'#1A1018',margin:0}}>{userEmail}</p>
          </div>
        </div>

        {/* 保留中の警告 */}
        {isPending && (
          <div style={{background:'#FFF3CD',border:'1px solid #FFE69C',borderRadius:12,padding:16,marginBottom:32}}>
            <p style={{margin:0,fontSize:13,color:'#856404'}}>
              ⚠️ 支払い完了後にサービスを開始します。Stripe Customer Portalからお支払い手続きをお願いします。
            </p>
          </div>
        )}

        {/* サロン情報カード */}
        <div style={{background:'#fff',borderRadius:16,padding:32,boxShadow:'0 2px 20px rgba(0,0,0,0.06)',marginBottom:32}}>
          <h2 style={{fontSize:18,fontWeight:500,color:'#1A1018',margin:'0 0 24px 0'}}>サロン情報</h2>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:24}}>
            {/* サロン名 */}
            <div>
              <p style={{fontSize:11,fontWeight:500,color:'#888',textTransform:'uppercase',letterSpacing:1,margin:'0 0 6px 0'}}>サロン名</p>
              <p style={{fontSize:16,color:'#1A1018',margin:0}}>{salon.name || '—'}</p>
            </div>

            {/* オーナー名 */}
            <div>
              <p style={{fontSize:11,fontWeight:500,color:'#888',textTransform:'uppercase',letterSpacing:1,margin:'0 0 6px 0'}}>オーナー</p>
              <p style={{fontSize:16,color:'#1A1018',margin:0}}>{salon.owner_name || '—'}</p>
            </div>

            {/* メールアドレス */}
            <div>
              <p style={{fontSize:11,fontWeight:500,color:'#888',textTransform:'uppercase',letterSpacing:1,margin:'0 0 6px 0'}}>メール</p>
              <p style={{fontSize:13,color:'#1A1018',margin:0,wordBreak:'break-all'}}>{salon.email}</p>
            </div>

            {/* プラン */}
            <div>
              <p style={{fontSize:11,fontWeight:500,color:'#888',textTransform:'uppercase',letterSpacing:1,margin:'0 0 6px 0'}}>プラン</p>
              <p style={{fontSize:16,color:'#1A1018',margin:0}}>
                {planDisplayName}
                <br/>
                <span style={{fontSize:12,color:'#888'}}>{planPrice}</span>
              </p>
            </div>

            {/* 契約日 */}
            {salon.plan !== 'free' && (
              <div>
                <p style={{fontSize:11,fontWeight:500,color:'#888',textTransform:'uppercase',letterSpacing:1,margin:'0 0 6px 0'}}>契約日</p>
                <p style={{fontSize:13,color:'#1A1018',margin:0}}>{contractDateStr}</p>
              </div>
            )}

            {/* トライアル残日数 */}
            {salon.plan !== 'free' && salon.trial_ends_at && (
              <div>
                <p style={{fontSize:11,fontWeight:500,color:'#888',textTransform:'uppercase',letterSpacing:1,margin:'0 0 6px 0'}}>トライアル残日数</p>
                <p style={{fontSize:16,color:trialDaysRemaining <= 7 ? '#A32D2D' : '#3B6D11',margin:0}}>
                  {Math.max(0, trialDaysRemaining)}日
                </p>
              </div>
            )}

            {/* LINE連携状況 */}
            <div>
              <p style={{fontSize:11,fontWeight:500,color:'#888',textTransform:'uppercase',letterSpacing:1,margin:'0 0 6px 0'}}>LINE連携</p>
              <p style={{fontSize:13,color:isLineConnected ? '#3B6D11' : '#A32D2D',margin:0}}>
                {isLineConnected ? '✓ 連携中' : '未連携'}
              </p>
            </div>
          </div>

          {/* アクションボタン */}
          <div style={{display:'flex',gap:12,marginTop:32,flexWrap:'wrap'}}>
            {salon.plan !== 'free' && (
              <button
                onClick={handleOpenPortal}
                disabled={portalLoading}
                style={{
                  padding:'12px 24px',
                  fontSize:13,
                  fontWeight:500,
                  border:'none',
                  background:'#1A1018',
                  color:'#FAF6EE',
                  borderRadius:8,
                  cursor:portalLoading ? 'not-allowed' : 'pointer',
                  opacity:portalLoading ? 0.7 : 1,
                  transition:'all 0.2s ease',
                }}
              >
                {portalLoading ? '読込中...' : 'プラン管理（Stripe）'}
              </button>
            )}

            <a
              href="/register"
              style={{
                padding:'12px 24px',
                fontSize:13,
                fontWeight:500,
                border:'1px solid #B8966A',
                background:'transparent',
                color:'#B8966A',
                borderRadius:8,
                textDecoration:'none',
                display:'inline-block',
                cursor:'pointer',
                transition:'all 0.2s ease',
              }}
            >
              設定を編集
            </a>

            <form action="/auth/signout" method="post" style={{display:'inline'}}>
              <button
                type="submit"
                style={{
                  padding:'12px 24px',
                  fontSize:13,
                  fontWeight:500,
                  border:'1px solid #ddd',
                  background:'#fff',
                  color:'#888',
                  borderRadius:8,
                  cursor:'pointer',
                  transition:'all 0.2s ease',
                }}
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>

        {/* 次のステップ */}
        <div style={{background:'#fff',borderRadius:16,padding:32,boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
          <h2 style={{fontSize:18,fontWeight:500,color:'#1A1018',margin:'0 0 20px 0'}}>次のステップ</h2>
          <ul style={{margin:0,paddingLeft:20}}>
            <li style={{fontSize:13,color:'#666',lineHeight:1.8,marginBottom:12}}>
              LINE Official Account と連携して、自動リマインド配信を開始
            </li>
            <li style={{fontSize:13,color:'#666',lineHeight:1.8,marginBottom:12}}>
              予約情報の同期設定（iCal URL）
            </li>
            <li style={{fontSize:13,color:'#666',lineHeight:1.8}}>
              ダッシュボード機能（予約管理、顧客管理）は準備中です
            </li>
          </ul>
        </div>

        {/* フッター */}
        <div style={{marginTop:40,paddingTop:24,borderTop:'1px solid #E0D8D0',textAlign:'center'}}>
          <p style={{fontSize:12,color:'#888',margin:0}}>
            問題がある場合は <a href="mailto:info@aokae.net" style={{color:'#B8966A',textDecoration:'underline'}}>info@aokae.net</a> までお問い合わせください
          </p>
        </div>
      </div>
    </main>
  )
}
