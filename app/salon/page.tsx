export default function SalonPage() {
  return (
    <main style={{minHeight:'100vh',background:'#F5F5F5',fontFamily:'sans-serif',display:'flex'}}>
      <aside style={{width:200,background:'#1A1018',padding:'24px 0',flexShrink:0}}>
        <div style={{fontSize:16,fontWeight:300,letterSpacing:4,color:'#FAF6EE',padding:'0 20px',marginBottom:32}}>
          Salon<span style={{color:'#B8966A'}}>Rink</span>
        </div>
        {[
          {label:'ダッシュボード',active:true},
          {label:'予約管理'},
          {label:'顧客カルテ'},
          {label:'売上レポート'},
          {label:'スタッフ管理'},
          {label:'LINE自動化'},
          {label:'EC・商品'},
          {label:'設定'},
        ].map(item => (
          <div key={item.label} style={{
            padding:'10px 20px',fontSize:13,cursor:'pointer',
            color:item.active?'#FAF6EE':'rgba(255,255,255,0.45)',
            background:item.active?'rgba(184,150,106,.15)':'transparent',
            borderLeft:item.active?'2px solid #B8966A':'2px solid transparent',
          }}>
            {item.label}
          </div>
        ))}
        <div style={{marginTop:'auto',padding:'20px',borderTop:'1px solid rgba(255,255,255,.08)',marginTop:32}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:4}}>キレイ鶴見店</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>田中オーナー</div>
        </div>
      </aside>
      <div style={{flex:1,padding:24,overflowY:'auto'}}>
        <h1 style={{fontSize:18,fontWeight:500,color:'#1A1018',marginBottom:20}}>ダッシュボード</h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'今日の予約',value:'8件',sub:'うち新規 2名'},
            {label:'今月売上',value:'¥412,000',sub:'先月比 +12%'},
            {label:'新規顧客',value:'3名',sub:'今月累計'},
            {label:'失客アラート',value:'2名',sub:'60日以上未来店'},
          ].map(c => (
            <div key={c.label} style={{background:'#fff',borderRadius:10,padding:'16px',border:'1px solid #E8E8E8'}}>
              <div style={{fontSize:11,color:'#888',marginBottom:6}}>{c.label}</div>
              <div style={{fontSize:20,fontWeight:500,color:'#1A1018'}}>{c.value}</div>
              <div style={{fontSize:11,color:'#A89E94',marginTop:4}}>{c.sub}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:'#fff',borderRadius:10,padding:16,border:'1px solid #E8E8E8'}}>
            <h2 style={{fontSize:14,fontWeight:500,marginBottom:12,color:'#1A1018'}}>本日の予約</h2>
            {[
              {name:'山田 花子',time:'10:00',menu:'カラー',color:'#FBEAF0',text:'#7A3550'},
              {name:'鈴木 美咲',time:'11:30',menu:'カット',color:'#E6F1FB',text:'#185FA5'},
              {name:'佐藤 由美',time:'13:00',menu:'白髪染め',color:'#EAF3DE',text:'#3B6D11'},
              {name:'高橋 恵',time:'14:30',menu:'パーマ',color:'#FAEEDA',text:'#854F0B'},
            ].map(a => (
              <div key={a.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #F5F5F5',fontSize:13}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:a.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:a.text,fontWeight:500}}>
                    {a.name[0]}
                  </div>
                  <span style={{color:'#1A1018'}}>{a.name}</span>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{color:'#888',fontSize:12}}>{a.time}</span>
                  <span style={{padding:'2px 8px',background:a.color,color:a.text,borderRadius:20,fontSize:11}}>{a.menu}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{background:'#fff',borderRadius:10,padding:16,border:'1px solid #E8E8E8',marginBottom:16}}>
              <h2 style={{fontSize:14,fontWeight:500,marginBottom:12,color:'#1A1018'}}>失客アラート</h2>
              {[
                {name:'田中 良子',days:68,status:'要フォロー'},
                {name:'中村 さゆり',days:72,status:'緊急'},
              ].map(a => (
                <div key={a.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #F5F5F5',fontSize:13}}>
                  <span style={{color:'#1A1018'}}>{a.name}</span>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{color:'#888',fontSize:11}}>{a.days}日未来店</span>
                    <span style={{padding:'2px 8px',background:a.status==='緊急'?'#FCEBEB':'#FAEEDA',color:a.status==='緊急'?'#A32D2D':'#854F0B',borderRadius:20,fontSize:11}}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:'#fff',borderRadius:10,padding:16,border:'1px solid #E8E8E8'}}>
              <h2 style={{fontSize:14,fontWeight:500,marginBottom:12,color:'#1A1018'}}>LINE自動送信（今日）</h2>
              {[
                {type:'予約リマインド',count:'3件送信済み'},
                {type:'来店後フォロー',count:'2件送信済み'},
                {type:'失客防止DM',count:'1件送信済み'},
              ].map(l => (
                <div key={l.type} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #F5F5F5',fontSize:13}}>
                  <span style={{color:'#7A6E64'}}>{l.type}</span>
                  <span style={{color:'#1D9E75',fontWeight:500,fontSize:12}}>{l.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
