'use client';

import React, { useState, useEffect } from 'react';
import {
  Icon,
  Avatar,
  Modal,
  ServicePills,
} from '@/components/srk';
import {
  STAFF,
  ADDABLE_STAFF,
  SERVICES,
  todayBookings,
  fmtTime,
  type Booking,
} from '@/lib/srkMockData';

/* ============================================================
   Schedule — 予約スケジュール
   ============================================================

   Phase 3A: 新デザイン + モックデータ。
   Phase 3B で Supabase hpb_reservations を統合(現状の commit a07ddf0 の
   データ取得層を移植)。

   モックの bookingsForDate() は ユーザー閲覧体験のため、表示日付ベースで
   安定した擬似ランダム値を返す。本実装では Supabase クエリに置換。
   ============================================================ */

const WD_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
const WD_LABELS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface DayForecast {
  count: number;
  revenue: number;
  closed: boolean;
}

function bookingsForDate(d: Date): DayForecast {
  const day = d.getDate();
  const wd = d.getDay();
  if (wd === 0) return { count: 0, revenue: 0, closed: true };
  const seed = (d.getFullYear() * 100 + d.getMonth() * 30 + day) % 17;
  const base =
    wd === 2 ? 14 :
    wd === 6 ? 13 :
    wd === 5 ? 12 :
    wd === 4 ? 10 :
    wd === 1 ?  8 : 9;
  const count = Math.max(0, base + (seed % 5) - 2);
  const revenue = count * (6800 + (seed % 4) * 1100);
  return { count, revenue, closed: false };
}

type ViewMode = 'day' | 'week' | 'month';

export default function SchedulePage() {
  const [selected, setSelected] = useState<Booking | null>(null);
  const [view, setView] = useState<ViewMode>('day');

  // SSR-safe date state: initialize on client only.
  const [today0, setToday0] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setToday0(t);
    setCurrentDate(new Date(t));
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(tick);
  }, []);

  if (!today0 || !currentDate || !now) {
    // Loading skeleton — minimal flash while client hydrates
    return <div className="srk-page" />;
  }

  const isToday = currentDate.toDateString() === today0.toDateString();
  const isShowingTodaysBookings = isToday;

  const HOUR_START = 10;
  const HOUR_END = 19;
  const hours = HOUR_END - HOUR_START;
  const COL_W = 84;
  const totalW = hours * COL_W;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowX = ((nowMin - HOUR_START * 60) / (hours * 60)) * totalW;

  const moveDay = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    setCurrentDate(d);
  };
  const moveMonth = (delta: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };
  const goToday = () => setToday0((t) => t && (setCurrentDate(new Date(t)), t));

  const _tom = new Date(today0);
  _tom.setDate(_tom.getDate() + 1);
  const tomorrowMonth = _tom.getMonth() + 1;
  const tomorrowDay = _tom.getDate();

  return (
    <div className="srk-page">
      <div className="srk-schedule">

        {/* ─── Toolbar ───────────────────────────────── */}
        <div className="srk-sch-toolbar">
          <div className="srk-sch-date">
            <button
              className="srk-iconbtn ghost"
              onClick={() => (view === 'month' ? moveMonth(-1) : moveDay(-1))}
              title="前へ"
              type="button"
            >
              <Icon name="chev_l" size={14} />
            </button>
            <div>
              <div className="srk-sch-day">
                {view === 'month' ? (
                  <>
                    <span className="num">{currentDate.getFullYear()}</span>
                    <em>年</em>
                    <span className="num">{currentDate.getMonth() + 1}</span>
                    <em>月</em>
                  </>
                ) : (
                  <>
                    <span className="num">{currentDate.getDate()}</span>
                    {' '}
                    <em>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentDate.getMonth()]}
                    </em>
                  </>
                )}
              </div>
              <div className="srk-sch-sub" key={`sub-${currentDate.toDateString()}`}>
                {view === 'month' ? (
                  `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
                ) : (
                  <span>
                    {`${currentDate.getMonth() + 1}月${currentDate.getDate()}日（${WD_LABELS[currentDate.getDay()]}）`}
                    {isToday && (
                      <span>
                        {' '}· <b style={{ color: 'var(--plum)' }}>本日</b>
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
            <button
              className="srk-iconbtn ghost"
              onClick={() => (view === 'month' ? moveMonth(1) : moveDay(1))}
              title="次へ"
              type="button"
            >
              <Icon name="chev_r" size={14} />
            </button>
            {!isToday && view !== 'month' && (
              <button
                className="srk-btn ghost"
                style={{ marginLeft: 6 }}
                onClick={() => setCurrentDate(new Date(today0))}
                type="button"
              >
                今日
              </button>
            )}
          </div>

          <div className="srk-sch-tools">
            {view !== 'month' && (
              <div className="srk-day-quick">
                <button
                  className="srk-day-quick-btn"
                  type="button"
                  onClick={() => {
                    setCurrentDate(new Date(today0));
                    setView('day');
                  }}
                >
                  <em>今日</em>
                  <b>
                    {today0.getMonth() + 1}/{today0.getDate()}
                    <span>（{WD_LABELS[today0.getDay()]}）</span>
                  </b>
                </button>
                <button
                  className="srk-day-quick-btn"
                  type="button"
                  onClick={() => {
                    const d = new Date(today0);
                    d.setDate(d.getDate() + 1);
                    setCurrentDate(d);
                    setView('day');
                  }}
                >
                  <em>明日</em>
                  <b>
                    {tomorrowMonth}/{tomorrowDay}
                    <span>（{WD_LABELS[(today0.getDay() + 1) % 7]}）</span>
                  </b>
                </button>
              </div>
            )}
            <div className="srk-seg-ctrl">
              <button
                className={view === 'day' ? 'is-on' : ''}
                onClick={() => setView('day')}
                type="button"
              >
                日
              </button>
              <button
                className={view === 'week' ? 'is-on' : ''}
                onClick={() => setView('week')}
                type="button"
              >
                週
              </button>
              <button
                className={view === 'month' ? 'is-on' : ''}
                onClick={() => setView('month')}
                type="button"
              >
                月
              </button>
            </div>
            <button className="srk-btn ghost" type="button">
              <Icon name="filter" size={12} /> 絞り込み
            </button>
            <button className="srk-cta" type="button">
              <Icon name="plus" size={12} /> 新規予約
            </button>
          </div>
        </div>

        {/* ─── Views ─────────────────────────────────── */}
        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            showBookings={isShowingTodaysBookings}
            HOUR_START={HOUR_START}
            HOUR_END={HOUR_END}
            COL_W={COL_W}
            totalW={totalW}
            nowX={isToday ? nowX : -1}
            now={now}
            setSelected={setSelected}
          />
        )}

        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            setCurrentDate={(d) => {
              setCurrentDate(d);
              setView('day');
            }}
            today0={today0}
          />
        )}

        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            setCurrentDate={(d) => {
              setCurrentDate(d);
              setView('day');
            }}
            today0={today0}
          />
        )}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="予約詳細"
      >
        {selected && <ReservationDetail booking={selected} />}
      </Modal>
    </div>
  );
}

/* ─── DAY VIEW ───────────────────────────────────────── */

interface DayViewProps {
  currentDate: Date;
  showBookings: boolean;
  HOUR_START: number;
  HOUR_END: number;
  COL_W: number;
  totalW: number;
  nowX: number;
  now: Date;
  setSelected: (b: Booking) => void;
}

function DayView({
  currentDate,
  showBookings,
  HOUR_START,
  HOUR_END,
  COL_W,
  totalW,
  nowX,
  now,
  setSelected,
}: DayViewProps) {
  const hours = HOUR_END - HOUR_START;
  const bookings = showBookings ? todayBookings : [];
  const forecast = bookingsForDate(currentDate);

  const perHour = Array.from({ length: hours }, (_, i) => {
    const startMin = (HOUR_START + i) * 60;
    const endMin = startMin + 60;
    return bookings.filter((b) => b.start < endMin && b.end > startMin).length;
  });
  const maxPer = Math.max(...perHour, 1);

  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <>
      <div className="srk-sch-scroll">
        {/* density bar */}
        <div className="srk-sch-density">
          <div className="srk-sch-density-label">時間帯別予約数</div>
          <div className="srk-sch-density-inner" style={{ width: totalW }}>
            {perHour.map((n, i) => (
              <div key={i} className="srk-sch-density-cell" style={{ width: COL_W }}>
                <div className="srk-sch-density-bar">
                  <span style={{ height: `${(n / maxPer) * 100}%` }} />
                </div>
                <em className="num">{n}</em>
              </div>
            ))}
          </div>
        </div>

        {/* time axis */}
        <div className="srk-sch-axis">
          <div className="srk-sch-staffcol srk-sch-axis-head">時間 →</div>
          <div className="srk-sch-axis-inner" style={{ width: totalW }}>
            {Array.from({ length: hours + 1 }).map((_, i) => (
              <div key={i} className="srk-sch-axis-tick" style={{ left: i * COL_W }}>
                <span className="num">{HOUR_START + i}:00</span>
              </div>
            ))}
          </div>
        </div>

        {/* grid */}
        <div className="srk-sch-grid">
          {STAFF.map((st) => {
            const list = bookings.filter((b) => b.staff === st.id);
            const minutesBooked = list.reduce((s, b) => s + (b.end - b.start), 0);
            const util = showBookings
              ? Math.min(1, minutesBooked / (hours * 60))
              : 0;
            return (
              <div key={st.id} className="srk-sch-row">
                <div className="srk-sch-staffcol">
                  <Avatar char={st.initial} color={st.color} size={32} />
                  <div>
                    <div className="srk-sch-staff-name">{st.name}</div>
                    <div className="srk-sch-staff-role">{st.role}</div>
                    <div className="srk-sch-util">
                      <div className="srk-sch-util-bar">
                        <span
                          style={{ width: `${util * 100}%`, background: st.color }}
                        />
                      </div>
                      <em>
                        {showBookings ? (
                          <>
                            稼働 <b className="num">{Math.round(util * 100)}%</b>
                          </>
                        ) : (
                          <>受付可</>
                        )}
                      </em>
                    </div>
                  </div>
                </div>
                <div className="srk-sch-track" style={{ width: totalW }}>
                  {Array.from({ length: hours }).map((_, i) => (
                    <div
                      key={i}
                      className="srk-sch-cell"
                      style={{ left: i * COL_W, width: COL_W }}
                    />
                  ))}
                  {list.map((b) => {
                    const left = ((b.start - HOUR_START * 60) / 60) * COL_W;
                    const width = ((b.end - b.start) / 60) * COL_W;
                    const svc = SERVICES[b.tags[0]];
                    return (
                      <button
                        key={b.id}
                        className="srk-sch-block"
                        type="button"
                        onClick={() => setSelected(b)}
                        style={{
                          left: left + 2,
                          width: width - 4,
                          background: `linear-gradient(180deg, ${svc.color}26, ${svc.color}14)`,
                          borderColor: `${svc.color}66`,
                        }}
                      >
                        <div className="srk-sch-block-h">
                          <span className="srk-sch-block-tags">
                            {b.tags.map((t) => (
                              <i key={t} style={{ background: SERVICES[t].color }}>
                                {SERVICES[t].short}
                              </i>
                            ))}
                          </span>
                          {b.isNew && <span className="srk-sch-block-new">新</span>}
                        </div>
                        <div className="srk-sch-block-name">
                          {b.customer} <em>様</em>
                        </div>
                        <div className="srk-sch-block-meta">
                          <span className="num">
                            {fmtTime(b.start)}–{fmtTime(b.end)}
                          </span>
                          {b.note && <em>· {b.note}</em>}
                        </div>
                      </button>
                    );
                  })}
                  {nowX >= 0 && nowX <= totalW && (
                    <div className="srk-sch-now" style={{ left: nowX }}>
                      <span />
                      <em className="num">{nowHHMM}</em>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* free row */}
          <div className="srk-sch-row srk-sch-row-free">
            <div className="srk-sch-staffcol">
              <div className="srk-sch-free-mark">空</div>
              <div>
                <div className="srk-sch-staff-name">フリー枠</div>
                <div className="srk-sch-staff-role">指名なし受付可能</div>
              </div>
            </div>
            <div className="srk-sch-track" style={{ width: totalW }}>
              {Array.from({ length: hours }).map((_, i) => (
                <div
                  key={i}
                  className="srk-sch-cell srk-sch-cell-free"
                  style={{ left: i * COL_W, width: COL_W }}
                >
                  <span className="srk-sch-free-slot">＋</span>
                </div>
              ))}
            </div>
          </div>

          {/* add staff row */}
          <div className="srk-sch-row srk-sch-row-add">
            <button
              className="srk-sch-add-btn"
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('srk-open-add-staff'))}
            >
              <Icon name="plus" size={14} />
              <span>スタッフ枠を追加</span>
              <em>+¥3,300/月（1名）</em>
            </button>
          </div>
        </div>
      </div>

      {/* future forecast banner (non-today only) */}
      {!showBookings && (
        <div className="srk-sch-future">
          <div>
            <Icon name="calendar" size={20} />
            <h3>
              {currentDate.getMonth() + 1}月{currentDate.getDate()}日の予約見込み
            </h3>
            <p>
              予測予約 <b className="num">{forecast.count}</b> 件 · 予測売上{' '}
              <b className="num">¥{(forecast.revenue / 1000).toFixed(0)}k</b>
            </p>
            <span>※ プロト用ダミー予測</span>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── WEEK VIEW ──────────────────────────────────────── */

interface WeekViewProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  today0: Date;
}

function WeekView({ currentDate, setCurrentDate, today0 }: WeekViewProps) {
  const weekStart = new Date(currentDate);
  const dayDiff = (currentDate.getDay() + 6) % 7;
  weekStart.setDate(currentDate.getDate() - dayDiff);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const HOUR_START = 10;
  const HOUR_END = 19;
  const hours = HOUR_END - HOUR_START;

  return (
    <div className="srk-week">
      <div className="srk-week-axis">
        <div className="srk-week-axis-corner" />
        {Array.from({ length: hours + 1 }).map((_, i) => (
          <div key={i} className="srk-week-axis-tick num">
            {HOUR_START + i}:00
          </div>
        ))}
      </div>
      {days.map((d, i) => {
        const isThisDay = d.toDateString() === today0.toDateString();
        const isCurrent = d.toDateString() === currentDate.toDateString();
        const fc = bookingsForDate(d);
        const bookings = isThisDay ? todayBookings : [];
        return (
          <div
            key={i}
            className={`srk-week-row ${isThisDay ? 'is-today' : ''} ${isCurrent ? 'is-current' : ''}`}
          >
            <button
              className="srk-week-daycol"
              type="button"
              onClick={() => setCurrentDate(d)}
            >
              <em>{WD_LABELS_EN[d.getDay()]}</em>
              <b className="num">{d.getDate()}</b>
              <span>{fc.closed ? '休' : `${fc.count}件`}</span>
            </button>
            <div className="srk-week-track">
              {Array.from({ length: hours }).map((_, j) => (
                <div key={j} className="srk-week-cell" />
              ))}
              {!fc.closed && !bookings.length && (
                <div className="srk-week-forecast">
                  <span>
                    予測 {fc.count}件 / ¥{(fc.revenue / 1000).toFixed(0)}k
                  </span>
                </div>
              )}
              {bookings.map((b) => {
                const left = ((b.start - HOUR_START * 60) / (hours * 60)) * 100;
                const width = ((b.end - b.start) / (hours * 60)) * 100;
                const svc = SERVICES[b.tags[0]];
                return (
                  <div
                    key={b.id}
                    className="srk-week-block"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: `linear-gradient(180deg, ${svc.color}30, ${svc.color}15)`,
                      borderColor: `${svc.color}66`,
                    }}
                  >
                    <span>{b.customer}</span>
                  </div>
                );
              })}
              {fc.closed && <div className="srk-week-closed">定休日</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── MONTH VIEW ─────────────────────────────────────── */

interface MonthViewProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  today0: Date;
}

function MonthView({ currentDate, setCurrentDate, today0 }: MonthViewProps) {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const totalCells = Math.ceil((startPad + last.getDate()) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(y, m, i - startPad + 1);
    const isCur = d.getMonth() === m;
    return { d, isCur };
  });

  const monthBookings = cells
    .filter((c) => c.isCur)
    .map((c) => bookingsForDate(c.d));
  const maxC = Math.max(...monthBookings.map((b) => b.count), 1);
  const totalRevenue = monthBookings.reduce((s, b) => s + b.revenue, 0);
  const totalBookings = monthBookings.reduce((s, b) => s + b.count, 0);
  const workingDays = monthBookings.filter((b) => !b.closed).length;

  return (
    <div className="srk-month">
      <div className="srk-month-summary">
        <div>
          <label>月間予約合計</label>
          <b className="num">{totalBookings}</b>
          <em>件</em>
        </div>
        <div>
          <label>月間売上見込み</label>
          <b className="num">¥{(totalRevenue / 1000).toFixed(0)}k</b>
        </div>
        <div>
          <label>営業日</label>
          <b className="num">{workingDays}</b>
          <em>日</em>
        </div>
        <div>
          <label>1日平均</label>
          <b className="num">
            {(totalBookings / Math.max(1, workingDays)).toFixed(1)}
          </b>
          <em>件</em>
        </div>
        <div className="srk-month-legend">
          <span>少</span>
          <i className="srk-heat-1" />
          <i className="srk-heat-2" />
          <i className="srk-heat-3" />
          <i className="srk-heat-4" />
          <i className="srk-heat-5" />
          <span>多</span>
        </div>
      </div>

      <div className="srk-month-head">
        {['月', '火', '水', '木', '金', '土', '日'].map((d, i) => (
          <div
            key={i}
            className={`srk-month-dow ${i === 5 ? 'sat' : i === 6 ? 'sun' : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="srk-month-grid">
        {cells.map((c, i) => {
          const fc = bookingsForDate(c.d);
          const isTodayCell = c.d.toDateString() === today0.toDateString();
          const intensity = fc.closed ? 0 : Math.ceil((fc.count / maxC) * 5);
          const wd = c.d.getDay();
          return (
            <button
              key={i}
              type="button"
              className={`srk-month-cell ${c.isCur ? '' : 'is-out'} ${isTodayCell ? 'is-today' : ''} ${fc.closed ? 'is-closed' : ''} srk-heat-${intensity}`}
              onClick={() => setCurrentDate(c.d)}
            >
              <div className="srk-month-cell-h">
                <span
                  className={`srk-month-date num ${wd === 6 ? 'sat' : wd === 0 ? 'sun' : ''}`}
                >
                  {c.d.getDate()}
                </span>
                {isTodayCell && <span className="srk-month-today">今日</span>}
                {fc.closed && c.isCur && (
                  <span className="srk-month-closed">休</span>
                )}
              </div>
              {!fc.closed && c.isCur && (
                <div className="srk-month-cell-body">
                  <div className="srk-month-count">
                    <b className="num">{fc.count}</b>
                    <em>件</em>
                  </div>
                  <div className="srk-month-revenue num">
                    ¥{Math.round(fc.revenue / 1000)}k
                  </div>
                  <div className="srk-month-bars">
                    {[...Array(Math.min(6, fc.count))].map((_, b) => (
                      <i key={b} />
                    ))}
                    {fc.count > 6 && <em>+{fc.count - 6}</em>}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Reservation Detail (modal body) ──────────────────── */

function ReservationDetail({ booking }: { booking: Booking }) {
  const st = STAFF.find((s) => s.id === booking.staff)!;
  return (
    <div className="srk-detail">
      <div className="srk-detail-head">
        <div>
          <div className="srk-detail-name">
            {booking.customer}{' '}
            {booking.isNew && <span className="srk-tag-new">新規</span>}
          </div>
          <div className="srk-detail-meta">
            {booking.ageBand} · 来店 {booking.repeat}回目
          </div>
        </div>
        <div className="srk-detail-time">
          <span className="num">{fmtTime(booking.start)}</span>
          <span>
            {' '}〜 {fmtTime(booking.end)} ({booking.end - booking.start}分)
          </span>
        </div>
      </div>
      <div className="srk-detail-grid">
        <div>
          <label>メニュー</label>
          <div>
            <ServicePills tags={booking.tags} />
          </div>
        </div>
        <div>
          <label>担当</label>
          <div className="srk-rsv-staff">
            <Avatar char={st.initial} color={st.color} size={22} />
            <span>{st.name}</span>
          </div>
        </div>
        <div>
          <label>料金</label>
          <div className="num" style={{ fontSize: '18px' }}>
            ¥{booking.amount.toLocaleString()}
          </div>
        </div>
        <div>
          <label>状態</label>
          <div>
            <span className={`srk-status srk-status-${booking.status}`}>
              <i />
              {booking.status === 'confirmed' ? '確定' : '仮予約'}
            </span>
          </div>
        </div>
        <div className="full">
          <label>メモ</label>
          <div>{booking.note || '—'}</div>
        </div>
      </div>
      <div className="srk-detail-actions">
        <button className="srk-btn ghost" type="button">
          メッセージ
        </button>
        <button className="srk-btn ghost" type="button">
          編集
        </button>
        <button className="srk-btn primary" type="button">
          受付開始
        </button>
      </div>
    </div>
  );
}
