export default function Home() {
  return (
    <main style={{fontFamily:"'Helvetica Neue',sans-serif",margin:0,padding:0}}>

      {/* HERO - ダーク */}
      <section style={{background:"#1A1018",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 24px",textAlign:"center"}}>
        <div style={{fontSize:11,letterSpacing:8,color:"rgba(255,255,255,0.4)",marginBottom:24,textTransform:"uppercase"}}>美容師のための予約管理</div>
        <h1 style={{fontSize:42,fontWeight:200,letterSpacing:8,color:"#FAF6EE",margin:"0 0 16px",lineHeight:1.2}}>SALOM<span style={{color:"#B8966A"}}>É</span></h1>
        <div style={{width:40,height:1,background:"#B8966A",margin:"0 auto 32px"}}></div>
        <p style={{fontSize:22,fontWeight:300,color:"#FAF6EE",letterSpacing:3,margin:"0 0 12px",lineHeight:1.5}}>
          あなたの<span style={{color:"#4CC764"}}>LINE</span>が、<br/>予約システムになる。
        </p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",margin:"24px 0 36px"}}>
          {["アプリ不要","初期費用ゼロ","今日から使える","30日間無料"].map(t=>(
            <span key={t} style={{fontSize:12,color:"rgba(255,255,255,0.6)",padding:"4px 12px",border:"0.5px solid rgba(255,255,255,0.2)",borderRadius:20}}>{t}</span>
          ))}
        </div>
        <a href="https://line.me/R/ti/p/@545fncvi" style={{display:"flex",alignItems:"center",gap:10,padding:"16px 32px",background:"#06C755",borderRadius:4,textDecoration:"none",fontSize:15,color:"#fff",letterSpacing:2,fontWeight:500}}>
          <span style={{width:20,height:20,background:"#fff",borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{width:10,height:10,background:"#06C755",borderRadius:"50%"}}></span>
          </span>
          LINEで無料登録する
        </a>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:12,letterSpacing:1}}>クレジットカード不要・いつでも解約可能</p>
        <div style={{marginTop:48,fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:3}}>SCROLL ↓</div>
      </section>

      {/* BEFORE / AFTER */}
      <section style={{background:"#FAF6EE",padding:"80px 24px"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:10,letterSpacing:6,color:"#B8966A",marginBottom:12}}>BEFORE / AFTER</div>
          <h2 style={{fontSize:28,fontWeight:300,color:"#1A1018",letterSpacing:4,margin:0}}>今日、変わります。</h2>
        </div>
        <div style={{maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"#fff",borderRadius:12,padding:24,border:"1px solid #E8E0D8"}}>
            <div style={{fontSize:11,color:"#C0392B",letterSpacing:3,marginBottom:12}}>BEFORE — よくある1日</div>
            {["お客様「来週空いてますか？」","手帳を見て、LINEで返信","別のお客様から同じ時間に予約"].map(t=>(
              <div key={t} style={{fontSize:13,color:"#7A6E64",marginBottom:8}}>→ {t}</div>
            ))}
            <div style={{fontSize:13,color:"#C0392B",marginBottom:8}}>→ ダブルブッキング発生。謝罪。</div>
            <div style={{fontSize:13,color:"#C0392B"}}>→ 信頼が少しずつ、削られていく。</div>
          </div>
          <div style={{textAlign:"center",fontSize:20,color:"#B8966A"}}>↓</div>
          <div style={{background:"#1A1018",borderRadius:12,padding:24}}>
            <div style={{fontSize:11,color:"#B8966A",letterSpacing:3,marginBottom:12}}>AFTER — SALOMÉがあれば</div>
            {["お客様がLINEのメニューをタップ","空き時間が自動で表示される","お客様が日時を選んで完了","予約が自動でカレンダーに登録","前日にリマインドも自動送信。"].map(t=>(
              <div key={t} style={{fontSize:13,color:t.includes("自動")?"#B8966A":"rgba(255,255,255,0.7)",marginBottom:8}}>→ {t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{background:"#fff",padding:"80px 24px"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:10,letterSpacing:6,color:"#B8966A",marginBottom:12}}>FEATURES</div>
          <h2 style={{fontSize:28,fontWeight:300,color:"#1A1018",letterSpacing:3,margin:"0 0 8px"}}>美容師の仕事を、<br/>もっとシンプルに。</h2>
          <p style={{fontSize:13,color:"#A89E94",margin:0}}>予約・カルテ・物販・売上管理まで。スマホ1台で、全部完結します。</p>
        </div>
        <div style={{maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",gap:12}}>
          {[
            {icon:"📅",title:"LINE予約が自動でカレンダーに登録",desc:"お客様がLINEから予約した瞬間、自動でカレンダーに反映。ダブルブッキングを完全ブロック。",badge:"フリーランス・サロン共通"},
            {icon:"🔗",title:"ホットペッパーと自動同期",desc:"SALON BOARDのiCalと連携。ホットペッパーから予約が入ると、SALOMÉの空き枠も自動でブロック。",badge:"サロンプラン"},
            {icon:"📋",title:"顧客カルテをLINEで管理",desc:"施術履歴・カラーレシピ・アレルギー情報をデジタル保存。次回来店時にすぐ確認できます。",badge:"アドオン +¥300"},
            {icon:"🛍",title:"店販商品をLINEで販売・郵送",desc:"シャンプー・トリートメントをLINEから注文・決済・郵送まで完結。来店しなくてもリピート購入。",badge:"アドオン +¥300"},
            {icon:"📊",title:"売上・確定申告を自動管理",desc:"月の売上を自動集計。確定申告用データ出力にも対応。フリーランスが経理から解放されます。",badge:"アドオン +¥200"},
          ].map(f=>(
            <div key={f.title} style={{padding:20,background:"#FAF6EE",borderRadius:12,border:"1px solid rgba(184,150,106,.15)",display:"flex",gap:16,alignItems:"flex-start"}}>
              <div style={{width:44,height:44,background:"#F5F0E8",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{f.icon}</div>
              <div>
                <div style={{fontSize:14,fontWeight:500,color:"#1A1018",marginBottom:6}}>{f.title}</div>
                <div style={{fontSize:12,color:"#7A6E64",lineHeight:1.7,marginBottom:8}}>{f.desc}</div>
                <span style={{fontSize:10,padding:"2px 10px",background:"#F5F0E8",color:"#B8966A",borderRadius:20}}>{f.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{background:"#1A1018",padding:"80px 24px"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:10,letterSpacing:6,color:"#B8966A",marginBottom:12}}>HOW IT WORKS</div>
          <h2 style={{fontSize:28,fontWeight:300,color:"#FAF6EE",letterSpacing:3,margin:"0 0 8px"}}>始め方は、4ステップだけ。</h2>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",margin:0}}>難しい設定は不要。今日登録して、今日から使えます。</p>
        </div>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          {[
            {n:1,title:"LINEで友だち追加",desc:"QRコードを読み取るだけ。アプリのインストール不要。"},
            {n:2,title:"サロン情報を入力",desc:"営業時間・メニュー・担当者を5分で設定。"},
            {n:3,title:"お客様にQRコードを渡す",desc:"名刺・チラシ・Instagramに貼るだけで集客開始。"},
            {n:4,title:"あとはSALOMÉにおまかせ",desc:"予約・リマインド・カルテ・物販。全部自動で動きます。"},
          ].map((s,i)=>(
            <div key={s.n}>
              <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#B8966A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#FAF6EE",fontWeight:500,flexShrink:0}}>{s.n}</div>
                <div style={{paddingBottom:24}}>
                  <div style={{fontSize:15,fontWeight:400,color:"#FAF6EE",marginBottom:6}}>{s.title}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.7}}>{s.desc}</div>
                </div>
              </div>
              {i<3&&<div style={{width:1,height:16,background:"rgba(184,150,106,.3)",marginLeft:16,marginBottom:0}}></div>}
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{background:"#FAF6EE",padding:"80px 24px"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:10,letterSpacing:6,color:"#B8966A",marginBottom:12}}>PRICING</div>
          <h2 style={{fontSize:28,fontWeight:300,color:"#1A1018",letterSpacing:3,margin:"0 0 8px"}}>シンプルな料金体系</h2>
          <p style={{fontSize:13,color:"#A89E94",margin:0}}>まず30日間、無料でお試しください。</p>
        </div>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          {/* ベースプラン */}
          <div style={{background:"#fff",borderRadius:12,padding:24,border:"1px solid rgba(184,150,106,.3)",marginBottom:12}}>
            <div style={{fontSize:10,letterSpacing:3,color:"#B8966A",marginBottom:4}}>FREELANCE</div>
            <div style={{fontSize:20,fontWeight:300,color:"#1A1018",letterSpacing:2,marginBottom:8}}>フリーランスプラン</div>
            <div style={{fontSize:36,fontWeight:200,color:"#B8966A",marginBottom:12}}>¥980<span style={{fontSize:13,color:"#A89E94"}}>/月</span></div>
            {["LINE予約受付（無制限）","予約カレンダー自動管理","前日リマインド自動送信","売上自動集計・確定申告データ出力","複数サロン対応（3サロンまで）"].map(f=>(
              <div key={f} style={{fontSize:13,color:"#7A6E64",marginBottom:6,display:"flex",alignItems:"center",gap:8}}><span style={{color:"#B8966A"}}>✓</span>{f}</div>
            ))}
          </div>
          {/* サロンプラン */}
          <div style={{background:"#1A1018",borderRadius:12,padding:24,border:"1px solid rgba(184,150,106,.3)",marginBottom:12}}>
            <div style={{fontSize:10,letterSpacing:3,color:"#B8966A",marginBottom:4}}>SALON — 人気 No.1</div>
            <div style={{fontSize:20,fontWeight:300,color:"#FAF6EE",letterSpacing:2,marginBottom:8}}>サロンプラン</div>
            <div style={{fontSize:36,fontWeight:200,color:"#B8966A",marginBottom:12}}>¥4,980<span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>/月</span></div>
            {["フリーランスプランの全機能","スタッフ複数人対応","SALON BOARD iCal同期","ホットペッパー連動・重複ブロック","顧客カルテ管理","店販商品のLINE販売・郵送","サロンブログ・記事発信"].map(f=>(
              <div key={f} style={{fontSize:13,color:"rgba(255,255,255,0.65)",marginBottom:6,display:"flex",alignItems:"center",gap:8}}><span style={{color:"#B8966A"}}>✓</span>{f}</div>
            ))}
          </div>
          {/* FCプラン */}
          <div style={{background:"#fff",borderRadius:12,padding:24,border:"1px solid rgba(184,150,106,.3)",marginBottom:24}}>
            <div style={{fontSize:10,letterSpacing:3,color:"#B8966A",marginBottom:4}}>ENTERPRISE</div>
            <div style={{fontSize:20,fontWeight:300,color:"#1A1018",letterSpacing:2,marginBottom:8}}>FCチェーンプラン</div>
            <div style={{fontSize:28,fontWeight:200,color:"#1A1018",marginBottom:12}}>要相談</div>
            {["サロンプランの全機能","複数店舗の一括管理","本部ダッシュボード","専任サポート担当"].map(f=>(
              <div key={f} style={{fontSize:13,color:"#7A6E64",marginBottom:6,display:"flex",alignItems:"center",gap:8}}><span style={{color:"#B8966A"}}>✓</span>{f}</div>
            ))}
          </div>
          <div style={{textAlign:"center",padding:16,background:"#fff",borderRadius:10,fontSize:12,color:"#7A6E64",border:"0.5px solid rgba(184,150,106,.2)"}}>
            すべてのプランに <strong style={{color:"#1A1018"}}>30日間無料トライアル</strong> が含まれます。<br/>クレジットカード不要・いつでも解約可能。
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{background:"#FAF6EE",padding:"80px 24px",textAlign:"center"}}>
        <h2 style={{fontSize:28,fontWeight:300,color:"#1A1018",letterSpacing:3,margin:"0 0 12px",lineHeight:1.5}}>まず、試してみてください。</h2>
        <p style={{fontSize:13,color:"#A89E94",margin:"0 0 32px",lineHeight:1.8}}>登録は1分。今日から使えます。<br/>難しい設定は一切ありません。</p>
        <a href="https://line.me/R/ti/p/@545fncvi" style={{display:"inline-flex",alignItems:"center",gap:10,padding:"16px 40px",background:"#06C755",borderRadius:4,textDecoration:"none",fontSize:15,color:"#fff",letterSpacing:2,fontWeight:500}}>
          <span style={{width:20,height:20,background:"#fff",borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{width:10,height:10,background:"#06C755",borderRadius:"50%"}}></span>
          </span>
          LINEで無料登録する
        </a>
        <div style={{marginTop:16}}>
          <a href="mailto:info@aokae.jp" style={{fontSize:12,color:"#A89E94",textDecoration:"underline"}}>サロン・法人のお問い合わせはこちら</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:"#1A1018",padding:"40px 24px",textAlign:"center"}}>
        <div style={{fontSize:18,fontWeight:200,letterSpacing:6,color:"#FAF6EE",marginBottom:16}}>SALOM<span style={{color:"#B8966A"}}>É</span></div>
        <div style={{display:"flex",justifyContent:"center",gap:24,marginBottom:16}}>
          {["プライバシーポリシー","特定商取引法に基づく表記","お問い合わせ"].map(l=>(
            <a key={l} href="#" style={{fontSize:11,color:"rgba(255,255,255,0.3)",textDecoration:"none"}}>{l}</a>
          ))}
        </div>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.2)",margin:0}}>© 2026 SALOMÉ by AOKAE合同会社</p>
      </footer>
    </main>
  )
}
