/* global React, ReactDOM, Timeline, DetailPanel, SALON_DATA, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect, TweakColor, TweakToggle */
const { useState, useEffect } = React;

/* ---------- New booking modal (lightweight) ---------- */
function NewBookingModal({ open, onClose, onCreate, data }){
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    staffId: data.STAFF[0].id,
    startH: "14",
    startM: "00",
    dur: "60",
    service: "カット",
    source: "phone",
    memo: "",
  });
  if(!open) return null;
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  function submit(){
    if(!form.customer.trim()) return;
    onCreate({
      id: "b" + Date.now(),
      staffId: form.staffId,
      start: parseInt(form.startH)*60 + parseInt(form.startM),
      dur: parseInt(form.dur),
      customer: form.customer.trim(),
      phone: form.phone || "—",
      service: form.service,
      price: 6600,
      source: form.source,
      status: "tentative",
      tags: ["新規"],
      memo: form.memo,
    });
    onClose();
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal__head">
          <div className="modal__title">新規予約を追加</div>
          <button className="detail__close" onClick={onClose} aria-label="閉じる">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="modal__body">
          <div className="field-row">
            <div className="field">
              <label className="field__label">お客様名</label>
              <input value={form.customer} onChange={e=>set("customer",e.target.value)} placeholder="例: 山田 花子" />
            </div>
            <div className="field">
              <label className="field__label">電話番号</label>
              <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="090-0000-0000" />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field__label">担当スタッフ</label>
              <select value={form.staffId} onChange={e=>set("staffId",e.target.value)}>
                {data.STAFF.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field__label">予約経路</label>
              <select value={form.source} onChange={e=>set("source",e.target.value)}>
                {Object.entries(data.SOURCE_LABEL).map(([k,v]) => <option key={k} value={k}>{v.ja}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field__label">開始時刻</label>
              <div style={{display:"flex",gap:6}}>
                <select value={form.startH} onChange={e=>set("startH",e.target.value)} style={{flex:1}}>
                  {Array.from({length:11},(_,i)=>10+i).map(h => <option key={h} value={String(h)}>{h}時</option>)}
                </select>
                <select value={form.startM} onChange={e=>set("startM",e.target.value)} style={{flex:1}}>
                  {["00","15","30","45"].map(m => <option key={m} value={m}>{m}分</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="field__label">所要時間</label>
              <select value={form.dur} onChange={e=>set("dur",e.target.value)}>
                {[30,45,60,75,90,105,120,150,180].map(d => <option key={d} value={String(d)}>{d}分</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field__label">メニュー</label>
            <input value={form.service} onChange={e=>set("service",e.target.value)} placeholder="例: カット + カラー" />
          </div>

          <div className="field">
            <label className="field__label">メモ</label>
            <textarea value={form.memo} onChange={e=>set("memo",e.target.value)} placeholder="希望スタイル、要望、注意事項など" />
          </div>
        </div>
        <div className="modal__foot">
          <button className="ghost-btn" onClick={onClose}>キャンセル</button>
          <button className="primary-btn" onClick={submit}>仮予約として追加</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main App ---------- */
function App(){
  const data = SALON_DATA;
  const [bookings, setBookings] = useState(data.BOOKINGS);
  const [selectedId, setSelectedId] = useState("b03");
  const [view, setView] = useState("day"); // day/week/month
  const [filterSource, setFilterSource] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStaff, setFilterStaff] = useState("all");
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [date, setDate] = useState(new Date(2026,4,14)); // May 14, 2026 (Thu)

  // Tweaks
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "density": "standard",
    "cardStyle": "solid",
    "accent": "#5a6b3f",
    "showNowLine": true,
    "showSummary": true
  }/*EDITMODE-END*/);

  // Current time line — let's pretend it's 13:42 today
  const nowMin = 13*60 + 42;

  // filtered bookings
  const filtered = bookings.filter(b => {
    if(filterSource !== "all" && b.source !== filterSource) return false;
    if(filterStatus !== "all" && b.status !== filterStatus) return false;
    if(filterStaff  !== "all" && b.staffId !== filterStaff) return false;
    if(query.trim()){
      const q = query.trim().toLowerCase();
      if(!b.customer.toLowerCase().includes(q) && !b.service.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredData = { ...data, BOOKINGS: filtered };
  const selected = bookings.find(b => b.id === selectedId);

  // Date display
  const days = ["日","月","火","水","木","金","土"];
  const dateLabel = `${date.getMonth()+1}月${date.getDate()}日`;
  const dayLabel = days[date.getDay()];

  function nudgeDate(delta){
    const d = new Date(date); d.setDate(d.getDate()+delta); setDate(d);
  }

  // overall today stats
  const todayStats = {
    total: filtered.filter(b => b.status !== "canceled").length,
    confirmed: filtered.filter(b => b.status === "confirmed").length,
    inprogress: filtered.filter(b => b.status === "inprogress").length,
    revenue: filtered.filter(b => b.status !== "canceled").reduce((s,b)=>s+b.price,0),
    newCustomers: filtered.filter(b => b.tags.includes("新規")).length,
  };

  function updateStatus(id, status){
    setBookings(prev => prev.map(b => b.id === id ? {...b, status} : b));
  }

  function createBooking(b){
    setBookings(prev => [...prev, b]);
    setSelectedId(b.id);
  }

  return (
    <div
      className="app"
      style={{
        "--accent": tweaks.accent,
        "--accent-soft": tweaks.accent + "22",
      }}
    >
      {/* TOP BAR */}
      <header className="topbar">
        <div className="brand">
          <div className="brand__mark">SALON RINK</div>
          <div className="crumbs">
            <span>管理</span>
            <span className="crumbs__sep">/</span>
            <span className="crumbs__current">予約</span>
          </div>
        </div>
        <div className="brand__sub" style={{textAlign:"center",letterSpacing:"0.12em"}}>
          鶴見店 ・ オシャレな白髪染め専門店
        </div>
        <div className="topbar__right">
          <button className="ghost-btn" title="ヘルプ">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M6 6.2c0-1.1 1-1.8 2-1.8s2 .7 2 1.8c0 1.6-2 1.5-2 3M8 11.4v.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            ヘルプ
          </button>
          <div className="user-chip">
            <div className="user-chip__avatar">店</div>
            <span>店長 / 菊地</span>
          </div>
        </div>
      </header>

      {/* CONTROL BAR */}
      <div className="controlbar">
        <h1 className="page-title">
          <small>RESERVATIONS</small>
          予約管理
        </h1>

        <div className="date-nav">
          <button className="date-nav__btn" onClick={() => nudgeDate(-1)} aria-label="前日">
            <svg width="14" height="14" viewBox="0 0 16 16"><path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="date-nav__date">
            {dateLabel}<span className="date-nav__day">({dayLabel})</span>
          </div>
          <button className="date-nav__btn" onClick={() => nudgeDate(1)} aria-label="翌日">
            <svg width="14" height="14" viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="date-nav__today" onClick={() => setDate(new Date(2026,4,14))}>今日</button>
        </div>

        <div className="seg" role="tablist">
          {[["day","日"],["week","週"],["month","月"]].map(([k,l]) => (
            <button key={k} className={"seg__btn" + (view===k?" is-active":"")} onClick={()=>setView(k)}>{l}</button>
          ))}
        </div>

        <div className="filterset">
          <div className="search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="お客様名 / メニュー" />
          </div>
          <div className="filter">
            <span>担当</span>
            <select value={filterStaff} onChange={e=>setFilterStaff(e.target.value)}>
              <option value="all">全員</option>
              {data.STAFF.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="filter">
            <span>経路</span>
            <select value={filterSource} onChange={e=>setFilterSource(e.target.value)}>
              <option value="all">全て</option>
              {Object.entries(data.SOURCE_LABEL).map(([k,v]) => <option key={k} value={k}>{v.ja}</option>)}
            </select>
          </div>
          <div className="filter">
            <span>状態</span>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="all">全て</option>
              {Object.entries(data.STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v.ja}</option>)}
            </select>
          </div>
          <button className="icon-btn" onClick={()=>window.print()} title="印刷">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 6V2h8v4M4 12H2V7h12v5h-2M4 10h8v4H4z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
            </svg>
            印刷
          </button>
          <button className="primary-btn" onClick={()=>setShowNew(true)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            新規予約
          </button>
        </div>
      </div>

      {/* TODAY STATS STRIP */}
      {tweaks.showSummary && (
        <div style={{
          display:"flex", gap: 0,
          padding: "12px 28px",
          background: "var(--bg)",
          borderBottom: "1px solid var(--line-soft)",
        }}>
          <StatCell label="本日の予約数"  value={todayStats.total + "件"} />
          <StatCell label="確定"          value={todayStats.confirmed + "件"} />
          <StatCell label="来店中"        value={todayStats.inprogress + "件"} accent="var(--info)" />
          <StatCell label="新規顧客"      value={todayStats.newCustomers + "名"} />
          <StatCell label="見込み売上"    value={"¥" + todayStats.revenue.toLocaleString()} mono />
          <div style={{flex:1}} />
          <StatCell label="現在時刻"      value={window.fmtTime(nowMin)} mono accent="var(--danger)" />
        </div>
      )}

      {/* MAIN */}
      <main className={"main" + (selected ? " with-detail" : "")}>
        <div className="timeline-wrap">
          <Timeline
            data={filteredData}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
            nowMin={tweaks.showNowLine ? nowMin : -1}
            density={tweaks.density}
            cardStyle={tweaks.cardStyle}
          />
          <p style={{
            marginTop: 14, fontSize: 11, color: "var(--ink-3)",
            letterSpacing: "0.08em", display:"flex", gap: 18, flexWrap:"wrap"
          }}>
            <span>※ カードをクリックで詳細表示</span>
            <span>※ 時間軸は1時間 / 30分刻みの目盛り</span>
            <span>※ 赤い縦線は現在時刻</span>
          </p>
        </div>
        {selected && (
          <DetailPanel
            booking={selected}
            data={data}
            onClose={() => setSelectedId(null)}
            onStatusChange={updateStatus}
          />
        )}
      </main>

      <NewBookingModal
        open={showNew}
        onClose={()=>setShowNew(false)}
        onCreate={createBooking}
        data={data}
      />

      {/* TWEAKS */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="表示">
          <TweakRadio
            label="情報密度"
            value={tweaks.density}
            onChange={v=>setTweak("density",v)}
            options={[
              {value:"compact",  label:"密"},
              {value:"standard", label:"標準"},
              {value:"roomy",    label:"疎"},
            ]}
          />
          <TweakSelect
            label="カードスタイル"
            value={tweaks.cardStyle}
            onChange={v=>setTweak("cardStyle",v)}
            options={[
              {value:"solid",  label:"標準（左ライン）"},
              {value:"stripe", label:"ストライプ強調"},
              {value:"flat",   label:"塗りベタ"},
            ]}
          />
          <TweakToggle
            label="現在時刻ライン"
            value={tweaks.showNowLine}
            onChange={v=>setTweak("showNowLine",v)}
          />
          <TweakToggle
            label="サマリーストリップ"
            value={tweaks.showSummary}
            onChange={v=>setTweak("showSummary",v)}
          />
        </TweakSection>
        <TweakSection label="アクセントカラー">
          <TweakColor
            label="差し色"
            value={tweaks.accent}
            onChange={v=>setTweak("accent",v)}
            options={["#5a6b3f","#a6794d","#6e7fa3","#a3727f","#1f1612"]}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function StatCell({label, value, mono, accent}){
  return (
    <div style={{
      flexShrink:0,
      padding:"4px 22px 4px 0",
      marginRight: 22,
      borderRight: "1px solid var(--line-soft)",
      display:"flex", flexDirection:"column", gap:2,
    }}>
      <span style={{fontSize:10,letterSpacing:"0.16em",color:"var(--ink-3)",textTransform:"uppercase"}}>{label}</span>
      <span style={{
        fontSize:18,
        fontFamily: mono ? "var(--mono)" : "var(--serif)",
        fontWeight: 500,
        color: accent || "var(--ink)",
        letterSpacing: "0.04em",
      }}>{value}</span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
