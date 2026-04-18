'use client'
import { useState, useEffect } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function DashboardPage() {
  const [salon, setSalon] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [icalUrl, setIcalUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // サロン情報取得（最初のサロン）
      const salonRes = await fetch(`${SUPABASE_URL}/rest/v1/salons?limit=1`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      })
      const salons = await salonRes.json()
      if (salons.length > 0) {
        setSalon(salons[0])
        setIcalUrl(salons[0].ical_url || '')

        // 予約取得
        const resRes = await fetch(`${SUPABASE_URL}/rest/v1/reservations?salon_id=eq.${salons[0].id}&order=datetime.asc&limit=20`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        })
        setReservations(await resRes.json())

        // 顧客取得
        const custRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?salon_id=eq.${salons[0].id}&order=last_visit.desc&limit=20`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        })
        setCustomers(await custRes.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function saveIcalUrl() {
    if (!salon) return
    setSaving(true)
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/salons?id=eq.${salon.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ical_url: icalUrl })
      })
      alert('iCal URLを保存しました！')
    } catch (e) {
      alert('エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const today = new Date().toDateString()
  const todayReservations = reservations.filter(r => new Date(r.datetime).toDateString() === today)

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F8F4EF',fontFamily:'Georgia, serif'}}>
      <p style={{color:'#B8966A'}}>読み込み中...</p>
    </div>
  )

  return (
    <main style={{minHeight:'100vh',background:'#F5F1EC',fontFamily:'sans-serif',display:'flex'}}>
      {/* サイドバー */}
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
          <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:4}}>{salon?.name || 'サロン名未設定'}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>{salon?.owner_name || ''}</div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div style={{flex:1,padding:28,overflowY:'auto'}}>

        {/* ダッシュボード */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{fontSize:18,fontWeight:500,color:'#1A1018',marginBottom:20}}>ダッシュボード</h1>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
              {[
                {label:'今日の予約',value:`${todayReservations.length}件`,sub:'本日'},
                {label:'総予約数',value:`${reservations.length}件`,sub:'全期間'},
                {label:'顧客数',value:`${customers.length}名`,sub:'登録済み'},
              ].map(c => (
                <div key={c.label} style={{background:'#fff',borderRadius:10,padding:'16px',border:'1px solid #E8E8E8'}}>
                  <div style={{fontSize:11,color:'#888',marginBottom:6}}>{c.label}</div>
                  <div style={{fontSize:24,fontWeight:500,color:'#1A1018'}}>{c.value}</div>
                  <div style={{fontSize:11,color:'#A89E94',marginTop:4}}>{c.sub}</div>
                </div>
              ))}
            </div>
            <div style={{background:'#fff',borderRadius:10,padding:20,border:'1px solid #E8E8E8'}}>
              <h2 style={{fontSize:14,fontWeight:500,marginBottom:16,color:'#1A1018'}}>今日の予約</h2>
              {todayReservations.length === 0 ? (
                <p style={{fontSize:13,color:'#888',textAlign:'center',padding:'20px 0'}}>今日の予約はありません</p>
              ) : todayReservations.map(r => (
                <div key={r.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #F5F5F5',fontSize:13}}>
                  <span style={{color:'#1A1018'}}>{r.customer_name}</span>
                  <div style={{display:'flex',gap:8}}>
                    <span style={{color:'#888'}}>{new Date(r.datetime).getHours()}:{String(new Date(r.datetime).getMinutes()).padStart(2,'0')}</span>
                    <span style={{padding:'2px 8px',background:'#EAF3DE',color:'#3B6D11',borderRadius:20,fontSize:11}}>{r.menu || 'メニュー未定'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 予約管理 */}
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

        {/* 顧客管理 */}
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

        {/* 設定 */}
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
              <button onClick={saveIcalUrl} disabled={saving}
                style={{padding:'12px 24px',borderRadius:8,border:'none',background:saving?'#E0D8D0':'#1A1018',color:saving?'#999':'#FAF6EE',fontSize:13,cursor:'pointer'}}>
                {saving ? '保存中...' : '保存する'}
              </button>
            </div>
            <div style={{background:'#fff',borderRadius:10,padding:24,border:'1px solid #E8E8E8'}}>
              <h2 style={{fontSize:14,fontWeight:500,marginBottom:16,color:'#1A1018'}}>サロン情報</h2>
              <p style={{fontSize:13,color:'#444',marginBottom:4}}>サロン名：{salon?.name}</p>
              <p style={{fontSize:13,color:'#444',marginBottom:4}}>担当者：{salon?.owner_name}</p>
              <p style={{fontSize:13,color:'#444',marginBottom:4}}>プラン：{salon?.plan}</p>
              <p style={{fontSize:13,color:'#444'}}>トライアル終了：{salon?.trial_ends_at ? new Date(salon.trial_ends_at).toLocaleDateString('ja-JP') : '未設定'}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
