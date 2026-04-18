export default function AgencyPage() {
  return (
    <main style={{minHeight:'100vh',background:'#F5F5F5',fontFamily:'sans-serif'}}>
      <header style={{padding:'14px 32px',background:'#1A1018',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:14}}>
          <div style={{lineHeight:1}}>
            <div style={{fontSize:20,fontWeight:300,letterSpacing:6,color:'#FAF6EE'}}>SALOMÉ</div>
            <div style={{fontSize:9,letterSpacing:3,color:'#B8966A',marginTop:3}}>SalonRink</div>
          </div>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',letterSpacing:1,fontWeight:400,paddingBottom:2}}>代理店管理</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>AOKAE LLC</span>
          <div style={{width:32,height:32,borderRadius:'50%',background:'#E6F1FB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:500,color:'#185FA5'}}>AO</div>
        </div>
      </header>
      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
          {[
            {label:'契約サロン数',value:'12件',sub:'先月比 +2'},
            {label:'今月手数料',value:'¥48,000',sub:'見込み'},
            {label:'トライアル中',value:'3件',sub:'期限切れ注意 1件'},
            {label:'累計紹介料',value:'¥320,000',sub:'2026年度'},
          ].map(c => (
            <div key={c.label} style={{background:'#fff',borderRadius:10,padding:'16px',border:'1px solid #E8E8E8'}}>
              <div style={{fontSize:11,color:'#888',marginBottom:6}}>{c.label}</div>
              <div style={{fontSize:18,fontWeight:500,color:'#1A1018'}}>{c.value}</div>
              <div style={{fontSize:11,color:'#A89E94',marginTop:4}}>{c.sub}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
          <div style={{background:'#fff',borderRadius:10,padding:20,border:'1px solid #E8E8E8'}}>
            <h2 style={{fontSize:14,fontWeight:500,marginBottom:16,color:'#1A1018'}}>契約サロン一覧</h2>
            {[
              {name:'キレイ鶴見店',plan:'Standard',status:'正常',fee:'¥5,980'},
              {name:'ヘアサロン Bloom',plan:'Starter',status:'正常',fee:'¥2,980'},
              {name:'NALU Hair',plan:'トライアル',status:'期限3日',fee:'¥0'},
              {name:'Hair Studio 渋谷',plan:'Premium',status:'正常',fee:'¥9,800'},
              {name:'美容室 ナチュラル',plan:'Standard',status:'正常',fee:'¥5,980'},
            ].map(s => (
              <div key={s.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #F5F5F5',fontSize:13}}>
                <div>
                  <div style={{color:'#1A1018',fontWeight:500}}>{s.name}</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{
                    padding:'2px 10px',borderRadius:20,fontSize:11,
                    background:s.plan==='Premium'?'#1A1018':s.plan==='Standard'?'#FBEAF0':s.plan==='Starter'?'#E6F1FB':'#FAEEDA',
                    color:s.plan==='Premium'?'#FAF6EE':s.plan==='Standard'?'#7A3550':s.plan==='Starter'?'#185FA5':'#854F0B',
                  }}>{s.plan}</span>
                  <span style={{
                    padding:'2px 10px',borderRadius:20,fontSize:11,
                    background:s.status==='正常'?'#EAF3DE':'#FAEEDA',
                    color:s.status==='正常'?'#3B6D11':'#854F0B',
                  }}>{s.status}</span>
                  <span style={{color:'#1A1018',fontWeight:500,minWidth:60,textAlign:'right'}}>{s.fee}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{background:'#fff',borderRadius:10,padding:20,border:'1px solid #E8E8E8',marginBottom:16}}>
              <h2 style={{fontSize:14,fontWeight:500,marginBottom:16,color:'#1A1018'}}>新規サロンを招待</h2>
              <input type="text" placeholder="サロン名" style={{width:'100%',padding:'10px 12px',border:'1px solid #E8E8E8',borderRadius:8,fontSize:13,marginBottom:8,boxSizing:'border-box'}}/>
              <input type="text" placeholder="担当者メール" style={{width:'100%',padding:'10px 12px',border:'1px solid #E8E8E8',borderRadius:8,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
              <button style={{width:'100%',padding:12,background:'#7A3550',color:'#FAF6EE',border:'none',borderRadius:8,fontSize:13,cursor:'pointer'}}>
                招待リンクを送る
              </button>
            </div>
            <div style={{background:'#fff',borderRadius:10,padding:20,border:'1px solid #E8E8E8'}}>
              <h2 style={{fontSize:14,fontWeight:500,marginBottom:12,color:'#1A1018'}}>手数料内訳</h2>
              {[
                {plan:'Premium × 1',fee:'¥8,000'},
                {plan:'Standard × 8',fee:'¥32,000'},
                {plan:'Starter × 3',fee:'¥8,000'},
              ].map(f => (
                <div key={f.plan} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #F5F5F5',fontSize:13}}>
                  <span style={{color:'#7A6E64'}}>{f.plan}</span>
                  <span style={{color:'#1A1018',fontWeight:500}}>{f.fee}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontSize:14}}>
                <span style={{fontWeight:500,color:'#1A1018'}}>合計</span>
                <span style={{fontWeight:500,color:'#7A3550'}}>¥48,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
