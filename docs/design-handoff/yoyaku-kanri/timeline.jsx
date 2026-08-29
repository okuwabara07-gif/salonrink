/* global React */
const { useMemo } = React;

function fmtTime(min){
  const h = Math.floor(min/60), m = min%60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

function Timeline({ data, selectedId, onSelect, nowMin, density, cardStyle }){
  const { TIME_START, TIME_END, STAFF, BOOKINGS, SOURCE_LABEL, STATUS_LABEL } = data;
  const hours = [];
  for(let t = TIME_START; t < TIME_END; t += 60) hours.push(t);

  // half-hour slots for summary
  const halfSlots = [];
  for(let t = TIME_START; t < TIME_END; t += 30) halfSlots.push(t);

  // count bookings overlapping each half-hour slot
  function countAt(slotStart){
    const slotEnd = slotStart + 30;
    return BOOKINGS.filter(b =>
      b.status !== "canceled" &&
      b.start < slotEnd && (b.start + b.dur) > slotStart
    ).length;
  }

  // per-staff stats
  const staffStats = useMemo(() => {
    const m = {};
    STAFF.forEach(s => m[s.id] = { count: 0, mins: 0 });
    BOOKINGS.forEach(b => {
      if(b.status === "canceled") return;
      m[b.staffId].count += 1;
      m[b.staffId].mins  += b.dur;
    });
    return m;
  }, [STAFF, BOOKINGS]);

  const totalMin = TIME_END - TIME_START;
  const pctOfRow = (start, dur) => ({
    left:  ((start - TIME_START) / totalMin) * 100 + "%",
    width: (dur / totalMin) * 100 + "%",
  });

  const nowInRange = nowMin >= TIME_START && nowMin <= TIME_END;
  const nowLeft = ((nowMin - TIME_START) / totalMin) * 100 + "%";

  // Width of the right (hours) area in grid units so summary aligns
  const hoursColCount = hours.length;

  return (
    <div className={"timeline-card density-" + density + " cardstyle-" + cardStyle}>
      <div className="timeline-scroll">
        <div className="timeline-grid" style={{minWidth: `calc(var(--staff-col) + ${hoursColCount} * var(--hour-w))`}}>

          {/* HEADER ROW */}
          <div className="tl-header__left">時間</div>
          <div className="tl-header__hours">
            {hours.map(h => {
              const slotCount =
                BOOKINGS.filter(b => b.status !== "canceled" && b.start < h+60 && b.start+b.dur > h).length;
              return (
                <div className="tl-hour" key={h}>
                  {fmtTime(h)}
                  <span className="tl-hour__count">予約<strong>{slotCount}</strong></span>
                </div>
              );
            })}
          </div>

          {/* SUMMARY ROW (per 30min capacity) */}
          <div className="tl-summary-left">
            <b>受付状況</b>
            <span>30分単位 / 全{STAFF.length-1}席</span>
          </div>
          <div className="tl-summary" style={{gridTemplateColumns: `repeat(${halfSlots.length}, calc(var(--hour-w) / 2))`}}>
            {halfSlots.map(s => {
              const used = countAt(s);
              const cap = STAFF.length - 1; // exclude "free" row
              const remain = Math.max(0, cap - used);
              const cls = remain === 0 ? "is-full" : (used === 0 ? "is-empty" : "");
              return (
                <div className={"tl-summary__cell " + cls} key={s}>
                  <span>残{remain}</span>
                  <strong>{used}</strong>
                </div>
              );
            })}
          </div>

          {/* STAFF ROWS */}
          {STAFF.map(staff => {
            const rowBookings = BOOKINGS.filter(b => b.staffId === staff.id);
            const stat = staffStats[staff.id];
            return (
              <React.Fragment key={staff.id}>
                <div className="tl-staff">
                  <div className="tl-staff__avatar" style={{background: staff.color}}>
                    {staff.initials}
                  </div>
                  <div className="tl-staff__info">
                    <div className="tl-staff__name">{staff.name}</div>
                    <div className="tl-staff__role">{staff.role}</div>
                  </div>
                  <div className="tl-staff__stat">
                    <strong>{stat.count}</strong>
                    件 / {(stat.mins/60).toFixed(1)}h
                  </div>
                </div>
                <div className={"tl-row" + (rowBookings.length === 0 ? " is-empty" : "")} style={{position: "relative"}}>
                  {rowBookings.map(b => {
                    const isShort = b.dur < 60;
                    const st = STATUS_LABEL[b.status];
                    const src = SOURCE_LABEL[b.source];
                    return (
                      <div
                        key={b.id}
                        className={"bk" + (isShort ? " is-short" : "") + (selectedId === b.id ? " is-selected" : "")}
                        style={{
                          ...pctOfRow(b.start, b.dur),
                          borderLeftColor: st.color,
                          opacity: b.status === "canceled" ? 0.5 : 1,
                        }}
                        onClick={() => onSelect(b.id)}
                      >
                        <div className="bk__head">
                          <span className="bk__time">{fmtTime(b.start)}–{fmtTime(b.start + b.dur)}</span>
                          <span
                            className="bk__status"
                            style={{background: st.bg, color: st.color, border: `1px solid ${st.border}`}}
                          >{st.ja}</span>
                        </div>
                        <div className="bk__name">{b.customer} <span style={{color:"var(--ink-3)",fontSize:11,fontFamily:"var(--sans)"}}>様</span></div>
                        <div className="bk__service">{b.service}</div>
                        <div className="bk__foot">
                          <span className="bk__src" style={{background: "#fff", color: src.color, border: `1px solid ${src.color}`}}>
                            {src.short}
                          </span>
                          <div className="bk__tags">
                            {b.tags.map(t => (
                              <span
                                key={t}
                                className={"bk__tag" + (t==="VIP"?" is-vip":t==="新規"?" is-new":t==="要割当"?" is-warn":"")}
                              >{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {nowInRange && (
                    <div className="tl-now" style={{left: nowLeft}}>
                      <span className="tl-now__label">{fmtTime(nowMin)}</span>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.Timeline = Timeline;
window.fmtTime = fmtTime;
