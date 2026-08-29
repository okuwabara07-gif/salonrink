/* global React */
const { useState: useStateD } = React;

function DetailPanel({ booking, data, onClose, onStatusChange }){
  if(!booking) return null;
  const { STATUS_LABEL, SOURCE_LABEL, STAFF } = data;
  const st = STATUS_LABEL[booking.status];
  const src = SOURCE_LABEL[booking.source];
  const staff = STAFF.find(s => s.id === booking.staffId);
  const initial = booking.customer ? booking.customer.charAt(0) : "—";

  return (
    <aside className="detail">
      <div className="detail__head">
        <div className="detail__title">予約詳細</div>
        <button className="detail__close" onClick={onClose} aria-label="閉じる">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="detail__body">
        <div className="detail__customer">
          <div className="detail__avatar">{initial}</div>
          <div style={{flex:1,minWidth:0}}>
            <div className="detail__cust-name">{booking.customer} <span style={{fontSize:13,color:"var(--ink-3)"}}>様</span></div>
            <div className="detail__cust-meta">
              {booking.tags.length > 0 && (
                <div className="tag-list" style={{marginBottom: 4}}>
                  {booking.tags.map(t => (
                    <span key={t} className={"bk__tag" + (t==="VIP"?" is-vip":t==="新規"?" is-new":t==="要割当"?" is-warn":"")}>{t}</span>
                  ))}
                </div>
              )}
              <span className="mono" style={{fontFamily:"var(--mono)"}}>{booking.phone}</span>
            </div>
          </div>
        </div>

        <div className="detail__row">
          <div className="detail__label">ステータス</div>
          <div className="detail__value">
            <span
              className="status-pill"
              style={{background: st.bg, color: st.color, border: `1px solid ${st.border}`}}
            >{st.ja}</span>
            <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              {["confirmed","inprogress","done","canceled"].filter(s => s !== booking.status).map(s => (
                <button
                  key={s}
                  className="ghost-btn"
                  style={{height:26,fontSize:11,padding:"0 10px"}}
                  onClick={() => onStatusChange(booking.id, s)}
                >→ {STATUS_LABEL[s].ja}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="detail__row">
          <div className="detail__label">日時</div>
          <div className="detail__value">
            <span className="mono">{window.fmtTime(booking.start)} – {window.fmtTime(booking.start + booking.dur)}</span>
            <span style={{color:"var(--ink-3)",marginLeft:8}}>({booking.dur}分)</span>
          </div>
        </div>

        <div className="detail__row">
          <div className="detail__label">担当</div>
          <div className="detail__value" style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:20,height:20,borderRadius:999,background:staff.color,color:"#fdf6e8",display:"grid",placeItems:"center",fontSize:9,fontWeight:600}}>
              {staff.initials}
            </span>
            {staff.name}
            <span style={{color:"var(--ink-3)",fontSize:11}}>{staff.role}</span>
          </div>
        </div>

        <div className="detail__row">
          <div className="detail__label">メニュー</div>
          <div className="detail__value">{booking.service}</div>
        </div>

        <div className="detail__row">
          <div className="detail__label">料金</div>
          <div className="detail__value">
            <span className="mono" style={{fontSize:16,fontWeight:600}}>¥{booking.price.toLocaleString()}</span>
            <span style={{color:"var(--ink-3)",fontSize:11,marginLeft:6}}>税込</span>
          </div>
        </div>

        <div className="detail__row">
          <div className="detail__label">予約経路</div>
          <div className="detail__value">
            <span className="bk__src" style={{background:"#fff",color:src.color,border:`1px solid ${src.color}`}}>{src.short}</span>
            <span style={{marginLeft:8}}>{src.ja}</span>
          </div>
        </div>

        {booking.memo && (
          <div className="detail__row">
            <div className="detail__label">メモ</div>
            <div className="detail__value">
              <div className="detail__memo">{booking.memo}</div>
            </div>
          </div>
        )}
      </div>

      <div className="detail__actions">
        <button className="ghost-btn">編集</button>
        <button className="primary-btn">来店受付</button>
      </div>
    </aside>
  );
}

window.DetailPanel = DetailPanel;
