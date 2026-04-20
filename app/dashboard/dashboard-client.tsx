'use client'
import { useState, useMemo } from 'react'
import { saveIcalUrl } from './actions'

type Salon = {
  id: string
  name: string | null
  owner_name: string | null
  plan: string | null
  trial_ends_at: string | null
  ical_url: string | null
}
type Reservation = {
  id: string
  customer_name: string | null
  datetime: string
  menu: string | null
  status: string | null
}
type Customer = {
  id: string
  name: string | null
  visit_count: number | null
  last_visit: string | null
}

export default function DashboardClient({
  salon,
  reservations,
  customers,
}: {
  salon: Salon
  reservations: Reservation[]
  customers: Customer[]
}) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [icalUrl, setIcalUrl] = useState(salon.ical_url ?? '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveMsg(null)
    const result = await saveIcalUrl(icalUrl)
    setSaving(false)
    setSaveMsg(result.ok ? '保存しました' : `エラー: ${result.message}`)
  }

  const today = new Date().toDateString()
  const todayReservations = reservations.filter(
    r => new Date(r.datetime).toDateString() === today
  )

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    const monthReservations = reservations.filter(r => {
      const d = new Date(r.datetime)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })

    const confirmedCount = reservations.filter(r => r.status === 'confirmed').length
    const pendingCount = reservations.filter(r => r.status === 'pending').length
    const cancelledCount = reservations.filter(r => r.status === 'cancelled').length

    const avgVisits = customers.length > 0
      ? (customers.reduce((sum, c) => sum + (c.visit_count || 0), 0) / customers.length).toFixed(1)
      : 0

    const repeatCustomers = customers.filter(c => (c.visit_count || 0) >= 3).length

    return {
      monthReservations,
      confirmedCount,
      pendingCount,
      cancelledCount,
      avgVisits,
      repeatCustomers
    }
  }, [reservations, customers])

  return (
    <main style={{minHeight:'100vh',background:'#F5F1EC',fontFamily:'sans-serif',display:'flex'}}>
      <aside style={{width:220,background:'#1A1018',padding:'24px 0',flexShrink:0,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'0 20px',marginBottom:32,fontFamily:'Georgia, serif',lineHeight:1}}>
          <div style={{fontSize:18,fontWeight:300,letterSpacing:6,color:'#FAF6EE'}}>SALOMÉ</div>
          <div style={{fontSize:9,letterSpacing:3,color:'#B8966A',marginTop:4,fontFamily:'sans-serif'}}>SalonRink</div>
        </div>
        {[
          {id:'dashboard',label:'ダッシュボード'},
          {id:'reservations',label:'予約管理'},
          {id:'customers',label:'顧客管理'},
          {id:'settings',label:'設定'},
        ].map(item => (
          <div key={item.id} onClick={() => setActiveTab(item.id)}
            style={{padding:'12px 20px',fontSize:13,cursor:'pointer',
              color:activeTab===item.id?'#FAF6EE':'rgba(255,255,255,0.45)',
              background:activeTab===item.id?'rgba(184,150,106,.15)':'transparent',
              borderLeft:activeTab===item.id?'2px solid #B8966A':'2px solid transparent',
            }}>
            {item.label}
          </div>
        ))}
        <div style={{marginTop:'auto',padding:'20px',borderTop:'1px solid rgba(255,255,255,.08)'}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:4}}>{salon.name || 'サロン名未設定'}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:12}}>{salon.owner_name || ''}</div>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{width:'100%',padding:'8px',border:'1px solid rgba(255,255,255,.15)',background:'transparent',color:'rgba(255,255,255,.6)',fontSize:11,borderRadius:6,cursor:'pointer'}}>
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      <div style={{flex:1,padding:28,overflowY:'auto'}}>
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{fontSize:18,fontWeight:500,color:'#1A1018',marginBottom:24}}>ダッシュボード</h1>

            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
              {[
                {label:'今日の予約',value:`${todayReservations.length}`,sub:'本日',icon:'📅'},
                {label:'確認済み',value:`${stats.confirmedCount}`,sub:'確定',icon:'✓'},
                {label:'保留中',value:`${stats.pendingCount}`,sub:'対応待ち',icon:'⏳'},
                {label:'リピーター',value:`${stats.repeatCustomers}`,sub:'3回以上',icon:'⭐'},
              ].map(c => (
                <div key={c.label} style={{background:'#fff',borderRadius:10,padding:'16px',border:'1px solid #E8E8E8',position:'relative'}}>
                  <div style={{fontSize:24,position:'absolute',right:12,top:12,opacity:0.3}}>{c.icon}</div>
                  <div style={{fontSize:11,color:'#888',marginBottom:6}}>{c.label}</div>
                  <div style={{fontSize:32,fontWeight:500,color:'#1A1018',marginBottom:4}}>{c.value}</div>
                  <div style={{fontSize:11,color:'#A89E94'}}>{c.sub}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
              <div style={{background:'#fff',borderRadius:10,padding:20,border:'1px solid #E8E8E8'}}>
                <h2 style={{fontSize:14,fontWeight:500,marginBottom:16,color:'#1A1018'}}>今月の統計</h2>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    {label:'今月の予約',value:stats.monthReservations.length,color:'#7A3550'},
                    {label:'顧客数',value:customers.length,color:'#B8966A'},
                    {label:'平均来店回数',value:stats.avgVisits,color:'#3B6D11'},
                  ].map(item => (
                    <div key={item.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:12,borderBottom:'1px solid #F5F5F5'}}>
                      <span style={{fontSize:13,color:'#888'}}>{item.label}</span>
                      <span style={{fontSize:18,fontWeight:500,color:item.color}}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:'#fff',borderRadius:10,padding:20,border:'1px solid #E8E8E8'}}>
                <h2 style={{fontSize:14,fontWeight:500,marginBottom:16,color:'#1A1018'}}>予約ステータス</h2>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    {status:'確認済み',count:stats.confirmedCount,color:'#3B6D11',bg:'#EAF3DE'},
                    {status:'保留中',count:stats.pendingCount,color:'#9B8E3C',bg:'#F5F2DC'},
                    {status:'キャンセル',count:stats.cancelledCount,color:'#8B4A4A',bg:'#F5EDEE'},
                  ].map(item => (
                    <div key={item.status} style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:12,height:12,background:item.color,borderRadius:2}}></div>
                      <div style={{flex:1,display:'flex',justifyContent:'space-between'}}>
                        <span style={{fontSize:13,color:'#888'}}>{item.status}</span>
                        <span style={{fontSize:13,fontWeight:500,color:item.color}}>{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{background:'#fff',borderRadius:10,padding:20,border:'1px solid #E8E8E8'}}>
              <h2 style={{fontSize:14,fontWeight:500,marginBottom:16,color:'#1A1018'}}>本日の予約</h2>
              {todayReservations.length === 0 ? (
                <p style={{fontSize:13,color:'#888',textAlign:'center',padding:'20px 0'}}>本日の予約はありません</p>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:0}}>
                  {todayReservations.map((r, idx) => (
                    <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:idx<todayReservations.length-1?'1px solid #F5F5F5':'none',fontSize:13}}>
                      <div>
                        <div style={{fontWeight:500,color:'#1A1018',marginBottom:2}}>{r.customer_name}</div>
                        <div style={{fontSize:12,color:'#888'}}>{r.menu || 'メニュー未定'}</div>
                      </div>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span style={{color:'#1A1018',fontWeight:500}}>{new Date(r.datetime).getHours()}:{String(new Date(r.datetime).getMinutes()).padStart(2,'0')}</span>
                        <span style={{padding:'2px 8px',background:r.status==='confirmed'?'#EAF3DE':r.status==='pending'?'#F5F2DC':'#F5EDEE',color:r.status==='confirmed'?'#3B6D11':r.status==='pending'?'#9B8E3C':'#8B4A4A',borderRadius:20,fontSize:11}}>{r.status==='confirmed'?'確定':r.status==='pending'?'保留中':'キャンセル'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div>
            <h1 style={{fontSize:18,fontWeight:500,color:'#1A1018',marginBottom:20}}>予約管理</h1>
            <div style={{background:'#fff',borderRadius:10,padding:20,border:'1px solid #E8E8E8'}}>
              {reservations.length === 0 ? (
                <p style={{fontSize:13,color:'#888',textAlign:'center',padding:'20px 0'}}>予約データがありません</p>
              ) : reservations.map(r => (
                <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #F5F5F5',fontSize:13}}>
                  <div>
                    <div style={{fontWeight:500,color:'#1A1018',marginBottom:2}}>{r.customer_name || '名前未設定'}</div>
                    <div style={{fontSize:12,color:'#888'}}>{r.menu || 'メニュー未定'}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{color:'#1A1018'}}>{new Date(r.datetime).toLocaleDateString('ja-JP')}</div>
                    <div style={{fontSize:12,color:'#888'}}>{new Date(r.datetime).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h1 style={{fontSize:18,fontWeight:500,color:'#1A1018',marginBottom:20}}>顧客管理</h1>
            <div style={{background:'#fff',borderRadius:10,padding:20,border:'1px solid #E8E8E8'}}>
              {customers.length === 0 ? (
                <p style={{fontSize:13,color:'#888',textAlign:'center',padding:'20px 0'}}>顧客データがありません</p>
              ) : customers.map(c => (
                <div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #F5F5F5',fontSize:13}}>
                  <div>
                    <div style={{fontWeight:500,color:'#1A1018',marginBottom:2}}>{c.name || '名前未設定'}</div>
                    <div style={{fontSize:12,color:'#888'}}>来店回数：{c.visit_count}回</div>
                  </div>
                  <div style={{fontSize:12,color:'#888'}}>
                    {c.last_visit ? `最終来店：${new Date(c.last_visit).toLocaleDateString('ja-JP')}` : '来店記録なし'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 style={{fontSize:18,fontWeight:500,color:'#1A1018',marginBottom:20}}>設定</h1>
            <div style={{background:'#fff',borderRadius:10,padding:24,border:'1px solid #E8E8E8',marginBottom:16}}>
              <h2 style={{fontSize:14,fontWeight:500,marginBottom:16,color:'#1A1018'}}>サロンボード iCal連携</h2>
              <p style={{fontSize:12,color:'#888',marginBottom:12,lineHeight:1.6}}>
                サロンボードの「iCalカレンダー連携」からURLをコピーして入力してください。<br/>
                30分ごとに予約データを自動同期します。
              </p>
              <input
                value={icalUrl}
                onChange={e => setIcalUrl(e.target.value)}
                placeholder="webcal://..."
                style={{width:'100%',padding:'12px',borderRadius:8,border:'1px solid #E0D8D0',fontSize:13,boxSizing:'border-box',marginBottom:12}}
              />
              <button onClick={handleSave} disabled={saving}
                style={{padding:'12px 24px',borderRadius:8,border:'none',background:saving?'#E0D8D0':'#1A1018',color:saving?'#999':'#FAF6EE',fontSize:13,cursor:'pointer'}}>
                {saving ? '保存中...' : '保存する'}
              </button>
              {saveMsg && <p style={{marginTop:10,fontSize:12,color:saveMsg.startsWith('エラー')?'#A32D2D':'#3B6D11'}}>{saveMsg}</p>}
            </div>
            <div style={{background:'#fff',borderRadius:10,padding:24,border:'1px solid #E8E8E8'}}>
              <h2 style={{fontSize:14,fontWeight:500,marginBottom:16,color:'#1A1018'}}>サロン情報</h2>
              <p style={{fontSize:13,color:'#444',marginBottom:4}}>サロン名：{salon.name}</p>
              <p style={{fontSize:13,color:'#444',marginBottom:4}}>担当者：{salon.owner_name}</p>
              <p style={{fontSize:13,color:'#444',marginBottom:4}}>プラン：{salon.plan}</p>
              <p style={{fontSize:13,color:'#444'}}>トライアル終了：{salon.trial_ends_at ? new Date(salon.trial_ends_at).toLocaleDateString('ja-JP') : '未設定'}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
