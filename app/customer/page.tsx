export default function CustomerPage() {
  return (
    <main style={{minHeight:'100vh',background:'#FAF6EE',fontFamily:'sans-serif'}}>
      <header style={{padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#fff',borderBottom:'1px solid rgba(184,150,106,.2)'}}>
        <div style={{lineHeight:1}}>
          <div style={{fontSize:20,fontWeight:300,letterSpacing:6,color:'#1A1018'}}>SalonRink</div>
          <div style={{fontSize:9,letterSpacing:3,color:'#B8966A',marginTop:3}}>SalonRink</div>
        </div>
        <nav style={{display:'flex',gap:24,fontSize:13,color:'#7A6E64'}}>
          <a href="#reserve" style={{textDecoration:'none',color:'#7A3550',fontWeight:500}}>予約</a>
          <a href="#history" style={{textDecoration:'none',color:'inherit'}}>履歴</a>
          <a href="#point" style={{textDecoration:'none',color:'inherit'}}>ポイント</a>
        </nav>
      </header>
      <div style={{maxWidth:600,margin:'0 auto',padding:'32px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
          {[
            {label:'次回予約',value:'4/22 (水)',sub:'10:00 カラー'},
            {label:'ポイント',value:'320pt',sub:'次回500ptで割引'},
            {label:'来店回数',value:'12回',sub:'前回 4/1'},
          ].map(c => (
            <div key={c.label} style={{background:'#fff',borderRadius:12,padding:'16px 14px',border:'1px solid rgba(184,150,106,.15)'}}>
              <div style={{fontSize:11,color:'#A89E94',marginBottom:6}}>{c.label}</div>
              <div style={{fontSize:18,fontWeight:500,color:'#1A1018'}}>{c.value}</div>
              <div style={{fontSize:11,color:'#A89E94',marginTop:4}}>{c.sub}</div>
            </div>
          ))}
        </div>
        <div id="reserve" style={{background:'#fff',borderRadius:12,padding:20,border:'1px solid rgba(184,150,106,.15)',marginBottom:16}}>
          <h2 style={{fontSize:14,fontWeight:500,color:'#1A1018',marginBottom:16}}>次回予約を取る</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
            {[
              {date:'4/20',status:'○',available:true},
              {date:'4/22',status:'選択中',selected:true},
              {date:'4/24',status:'○',available:true},
              {date:'4/25',status:'×',available:false},
            ].map(d => (
              <div key={d.date} style={{
                textAlign:'center',padding:'10px 4px',borderRadius:8,fontSize:12,
                background:d.selected?'#FBEAF0':'#FAF6EE',
                border:d.selected?'1px solid #D4537E':'1px solid rgba(184,150,106,.2)',
                color:d.selected?'#7A3550':d.available?'#1A1018':'#A89E94',
                fontWeight:d.selected?500:400,
              }}>
                <div>{d.date}</div>
                <div style={{marginTop:4}}>{d.status}</div>
              </div>
            ))}
          </div>
          <button style={{width:'100%',padding:'14px',background:'#7A3550',color:'#FAF6EE',border:'none',borderRadius:8,fontSize:14,letterSpacing:2,cursor:'pointer'}}>
            この日程で予約する
          </button>
        </div>
        <div style={{background:'#fff',borderRadius:12,padding:20,border:'1px solid rgba(184,150,106,.15)',marginBottom:16}}>
          <h2 style={{fontSize:14,fontWeight:500,color:'#1A1018',marginBottom:12}}>前回の施術メモ</h2>
          <div style={{fontSize:13,color:'#7A6E64',lineHeight:2}}>
            カラー：7トーン・アッシュブラウン<br/>
            トリートメント：オラプレックスNo.3<br/>
            担当：田中スタイリスト
          </div>
        </div>
        <div style={{background:'#fff',borderRadius:12,padding:20,border:'1px solid rgba(184,150,106,.15)'}}>
          <h2 style={{fontSize:14,fontWeight:500,color:'#1A1018',marginBottom:12}}>来店履歴</h2>
          {[
            {date:'2026/04/01',menu:'カラー + トリートメント',point:'+50pt'},
            {date:'2026/02/15',menu:'白髪染め',point:'+40pt'},
            {date:'2025/12/20',menu:'カット + カラー',point:'+60pt'},
          ].map(h => (
            <div key={h.date} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(184,150,106,.1)',fontSize:13}}>
              <div>
                <div style={{color:'#1A1018'}}>{h.menu}</div>
                <div style={{color:'#A89E94',fontSize:11,marginTop:2}}>{h.date}</div>
              </div>
              <div style={{color:'#B8966A',fontWeight:500}}>{h.point}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
