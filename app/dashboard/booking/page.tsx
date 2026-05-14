'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  fmtTime,
  type Booking,
} from '@/lib/srkMockData';
import {
  fetchBookingsForDay,
  fetchBookingsForWeek,
  fetchBookingsForMonth,
} from '@/lib/booking/fetchBookings';

/* ============================================================
   Schedule — 予約スケジュール (Phase 3B: Supabase 実データ)
   ============================================================

   - hpb_reservations + reservations から指定範囲を取得
   - Day/Week/Month で取得範囲が変わる
   - 取得失敗時は警告バナー、空配列で継続
   - 認証されていないユーザーは middleware で /login に弾かれる前提
   ============================================================ */

const WD_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
const WD_LABELS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

type ViewMode = 'day' | 'week' | 'month';

interface DayForecast {
  count: number;
  revenue: number;
  closed: boolean;
}

/** Aggregate real bookings into per-date forecast shape for month view. */
function aggregateByDate(bookings: Booking[], dates: Date[]): Map<string, DayForecast> {
  const map = new Map<string, DayForecast>();
  for (const d of dates) {
    const key = d.toDateString();
    map.set(key, { count: 0, revenue: 0, closed: d.getDay() === 0 });
  }
  // bookings は単日内の minutes-from-midnight しか持たないため
  // 月ビューでは日付ごとに集計するには別取得した「日付ごとの内訳」が必要。
  // fetchBookingsForMonth は範囲全部を flat に返すので、ここで日別に振り分けるには
  // 各 booking の元 datetime が必要 → 現状 Booking 型に持たせていないので
  // 月ビューは件数集計のみ、forecast から実数置換は次フェーズ。
  return map;
}

export default function SchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Booking | null>(null);
  const [view, setView] = useState<ViewMode>('day');

  const [today0, setToday0] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  /* ── client init ────────────────────────────────────────── */
  useEffect(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setToday0(t);
    setCurrentDate(new Date(t));
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(tick);
  }, []);

  /* ── data fetch (re-run on view/date change) ────────────── */
  useEffect(() => {
    if (!currentDate) return;
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    const fetcher =
      view === 'week'
        ? fetchBookingsForWeek
        : view === 'month'
          ? fetchBookingsForMonth
          : fetchBookingsForDay;

    fetcher(currentDate)
      .then((res) => {
        if (cancelled) return;
        setBookings(res.bookings);
        if (res.error) setFetchError(res.error);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error('[Schedule] fetch failed:', e);
        setFetchError(String(e?.message || e));
        setBookings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentDate, view]);

  if (!today0 || !currentDate || !now) {
    return <div className="srk-page" />;
  }

  const isToday = currentDate.toDateString() === today0.toDateString();

  const HOUR_START = 10;
  const HOUR_END = 19;
  const hours = HOUR_END - HOUR_START;
  const SLOT_MIN = 30;
  const SLOT_W = 64; // px per 30-min slot
  const slots = (hours * 60) / SLOT_MIN;
  const totalW = slots * SLOT_W;

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

  const _tom = new Date(today0);
  _tom.setDate(_tom.getDate() + 1);
  const tomorrowMonth = _tom.getMonth() + 1;
  const tomorrowDay = _tom.getDate();

  /* Day view: filter to bookings on currentDate.
     fetchBookingsForDay は単日範囲なので bookings は既に絞り済み。
     Week/Month view では bookings は範囲全部 → 各 view 内で日付ごとに分配する。 */
  const dayBookings = view === 'day' ? bookings : [];

  return (
    <div className="srk-page">
      <div className="srk-schedule">

        {/* ─── Toolbar ──────────────────────────────────────── */}
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
                    {loading && (
                      <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 11 }}>
                        · 取得中…
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
              >日</button>
              <button
                className={view === 'week' ? 'is-on' : ''}
                onClick={() => setView('week')}
                type="button"
              >週</button>
              <button
                className={view === 'month' ? 'is-on' : ''}
                onClick={() => setView('month')}
                type="button"
              >月</button>
            </div>
            <button className="srk-btn ghost" type="button">
              <Icon name="filter" size={12} /> 絞り込み
            </button>
            <button className="srk-cta" type="button">
              <Icon name="plus" size={12} /> 新規予約
            </button>
          </div>
        </div>

        {/* ─── Error banner ─────────────────────────────────── */}
        {fetchError && (
          <div
            style={{
              padding: '10px 14px',
              margin: '0 0 12px',
              borderRadius: 8,
              background: '#f6e3e3',
              color: '#7a3030',
              border: '1px solid #d9aeae',
              fontSize: 12.5,
            }}
          >
            データ取得エラー: {fetchError} — モックデータ無しで表示しています。
          </div>
        )}

        {/* ─── Views ────────────────────────────────────────── */}
        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            bookings={dayBookings}
            HOUR_START={HOUR_START}
            HOUR_END={HOUR_END}
            SLOT_MIN={SLOT_MIN}
            SLOT_W={SLOT_W}
            totalW={totalW}
            nowX={isToday ? nowX : -1}
            now={now}
            setSelected={setSelected}
            loading={loading}
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
            bookings={bookings}
            loading={loading}
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
            bookings={bookings}
            loading={loading}
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
  bookings: Booking[];
  HOUR_START: number;
  HOUR_END: number;
  SLOT_MIN: number;
  SLOT_W: number;
  totalW: number;
  nowX: number;
  now: Date;
  setSelected: (b: Booking) => void;
  loading: boolean;
}

function DayView({
  currentDate,
  bookings,
  HOUR_START,
  HOUR_END,
  SLOT_MIN,
  SLOT_W,
  totalW,
  nowX,
  now,
  setSelected,
  loading,
}: DayViewProps) {
  const hours = HOUR_END - HOUR_START;
  const slots = (hours * 60) / SLOT_MIN;

  // density bar: per-hour count (1-hour buckets for readability)
  const perHour = Array.from({ length: hours }, (_, i) => {
    const startMin = (HOUR_START + i) * 60;
    const endMin = startMin + 60;
    return bookings.filter((b) => b.start < endMin && b.end > startMin).length;
  });
  const maxPer = Math.max(...perHour, 1);
  const HOUR_W = (60 / SLOT_MIN) * SLOT_W; // density bar uses hourly bins

  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const hasBookings = bookings.length > 0;

  return (
    <>
      <div className="srk-sch-scroll">
        <div className="srk-sch-density">
          <div className="srk-sch-density-label">時間帯別予約数</div>
          <div className="srk-sch-density-inner" style={{ width: totalW }}>
            {perHour.map((n, i) => (
              <div key={i} className="srk-sch-density-cell" style={{ width: HOUR_W }}>
                <div className="srk-sch-density-bar">
                  <span style={{ height: `${(n / maxPer) * 100}%` }} />
                </div>
                <em className="num">{n}</em>
              </div>
            ))}
          </div>
        </div>

        <div className="srk-sch-axis">
          <div className="srk-sch-staffcol srk-sch-axis-head">時間 →</div>
          <div className="srk-sch-axis-inner" style={{ width: totalW }}>
            {Array.from({ length: slots + 1 }).map((_, i) => {
              const totalMins = HOUR_START * 60 + i * SLOT_MIN;
              const h = Math.floor(totalMins / 60);
              const m = totalMins % 60;
              const isHour = m === 0;
              return (
                <div
                  key={i}
                  className={`srk-sch-axis-tick ${isHour ? '' : 'is-half'}`}
                  style={{
                    left: i * SLOT_W,
                    opacity: isHour ? 1 : 0.45,
                  }}
                >
                  <span className="num" style={{ fontSize: isHour ? undefined : '10px' }}>
                    {isHour ? `${h}:00` : `:${String(m).padStart(2, '0')}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="srk-sch-grid">
          {STAFF.map((st) => {
            const list = bookings.filter((b) => b.staff === st.id);
            const minutesBooked = list.reduce((s, b) => s + (b.end - b.start), 0);
            const util = Math.min(1, minutesBooked / (hours * 60));

            // ── 時間重複する予約を track に振り分け(縦に積む) ──
            const sorted = [...list].sort((a, b) => a.start - b.start);
            const trackEnds: number[] = [];
            const placed: Array<{ b: Booking; track: number }> = [];
            for (const b of sorted) {
              let track = trackEnds.findIndex((e) => e <= b.start);
              if (track === -1) {
                track = trackEnds.length;
                trackEnds.push(b.end);
              } else {
                trackEnds[track] = b.end;
              }
              placed.push({ b, track });
            }
            const trackCount = Math.max(1, trackEnds.length);
            const TRACK_H = 62;
            const ROW_PAD_V = 12;
            const rowMinHeight = trackCount * TRACK_H + ROW_PAD_V;

            return (
              <div
                key={st.id}
                className="srk-sch-row"
                style={{ minHeight: rowMinHeight }}
              >
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
                        稼働 <b className="num">{Math.round(util * 100)}%</b>
                        {trackCount > 1 && (
                          <span style={{ marginLeft: 6, color: 'var(--muted)' }}>
                            · {trackCount}重
                          </span>
                        )}
                      </em>
                    </div>
                  </div>
                </div>
                <div
                  className="srk-sch-track"
                  style={{ width: totalW, minHeight: rowMinHeight }}
                >
                  {Array.from({ length: slots }).map((_, i) => {
                    const totalMins = HOUR_START * 60 + i * SLOT_MIN;
                    const isHourEdge = totalMins % 60 === 0;
                    return (
                      <div
                        key={i}
                        className={`srk-sch-cell ${isHourEdge ? 'is-hour' : ''}`}
                        style={{ left: i * SLOT_W, width: SLOT_W }}
                      />
                    );
                  })}
                  {placed.map(({ b, track }) => {
                    const left = ((b.start - HOUR_START * 60) / SLOT_MIN) * SLOT_W;
                    const width = ((b.end - b.start) / SLOT_MIN) * SLOT_W;
                    const top = track * TRACK_H + 6;
                    const height = TRACK_H - 6;
                    const svc = b.tags[0] ? SERVICES[b.tags[0]] : null;
                    const bg = svc
                      ? `linear-gradient(180deg, ${svc.color}26, ${svc.color}14)`
                      : 'linear-gradient(180deg, var(--bg-soft), var(--paper))';
                    const border = svc ? `${svc.color}66` : 'var(--line-2)';
                    const isShort = width < 80;
                    return (
                      <button
                        key={b.id}
                        className="srk-sch-block"
                        type="button"
                        onClick={() => setSelected(b)}
                        style={{
                          left: left + 2,
                          width: width - 4,
                          top,
                          height,
                          background: bg,
                          borderColor: border,
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
                        <div
                          className="srk-sch-block-name"
                          style={{
                            fontSize: isShort ? '11px' : undefined,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {b.customer} <em>様</em>
                        </div>
                        {!isShort && (
                          <div className="srk-sch-block-meta">
                            <span className="num">
                              {fmtTime(b.start)}–{fmtTime(b.end)}
                            </span>
                          </div>
                        )}
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
              {Array.from({ length: slots }).map((_, i) => {
                const totalMins = HOUR_START * 60 + i * SLOT_MIN;
                const isHourEdge = totalMins % 60 === 0;
                return (
                  <div
                    key={i}
                    className={`srk-sch-cell srk-sch-cell-free ${isHourEdge ? 'is-hour' : ''}`}
                    style={{ left: i * SLOT_W, width: SLOT_W }}
                  >
                    {isHourEdge && <span className="srk-sch-free-slot">＋</span>}
                  </div>
                );
              })}
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

      {/* empty state for future/empty days */}
      {!hasBookings && !loading && (
        <div className="srk-sch-future">
          <div>
            <Icon name="calendar" size={20} />
            <h3>
              {currentDate.getMonth() + 1}月{currentDate.getDate()}日の予約
            </h3>
            <p>現在この日の予約はありません</p>
            <span>HPB同期は30分ごとに自動更新されます</span>
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
  bookings: Booking[]; // full week range
  loading: boolean;
}

function WeekView({ currentDate, setCurrentDate, today0, bookings }: WeekViewProps) {
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

  // Booking 型は単日内の minutes しか持たないので、日付ベースの仕分けはせず
  // 全件を全日に表示する設計だと不正確。週ビューでは表示日が今日と一致する場合のみ
  // 全件を表示する暫定処理。本実装は Booking 型に元の datetime を持たせる必要あり。
  // 現状は週合計の件数表示のみ正確、日別ブロック表示は省略(forecast 風に)。
  const totalCount = bookings.length;

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
        const closed = d.getDay() === 0;
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
              <span>{closed ? '休' : '—'}</span>
            </button>
            <div className="srk-week-track">
              {Array.from({ length: hours }).map((_, j) => (
                <div key={j} className="srk-week-cell" />
              ))}
              {!closed && (
                <div className="srk-week-forecast">
                  <span>日表示で詳細確認</span>
                </div>
              )}
              {closed && <div className="srk-week-closed">定休日</div>}
            </div>
          </div>
        );
      })}
      <div
        style={{
          padding: '12px 16px',
          fontSize: 12,
          color: 'var(--muted)',
          textAlign: 'center',
        }}
      >
        週合計 <b className="num" style={{ color: 'var(--ink)' }}>{totalCount}</b> 件 · 日付をクリックで日次詳細
      </div>
    </div>
  );
}

/* ─── MONTH VIEW ─────────────────────────────────────── */

interface MonthViewProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  today0: Date;
  bookings: Booking[]; // full month range
  loading: boolean;
}

function MonthView({ currentDate, setCurrentDate, today0, bookings }: MonthViewProps) {
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

  // 月合計(全予約)
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((s, b) => s + (b.amount || 0), 0);
  const workingDays = cells.filter((c) => c.isCur && c.d.getDay() !== 0).length;

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
          const isTodayCell = c.d.toDateString() === today0.toDateString();
          const closed = c.d.getDay() === 0;
          // 月ビューの日別件数表示は、Booking 型に元 datetime を保持後の次フェーズで
          // 完全対応。現状は今日にのみ実件数、それ以外は空表示。
          const todayCount = isTodayCell ? totalBookings : 0;
          const intensity = closed ? 0 : Math.min(5, Math.ceil(todayCount / 2));
          const wd = c.d.getDay();
          return (
            <button
              key={i}
              type="button"
              className={`srk-month-cell ${c.isCur ? '' : 'is-out'} ${isTodayCell ? 'is-today' : ''} ${closed ? 'is-closed' : ''} srk-heat-${intensity}`}
              onClick={() => setCurrentDate(c.d)}
            >
              <div className="srk-month-cell-h">
                <span
                  className={`srk-month-date num ${wd === 6 ? 'sat' : wd === 0 ? 'sun' : ''}`}
                >
                  {c.d.getDate()}
                </span>
                {isTodayCell && <span className="srk-month-today">今日</span>}
                {closed && c.isCur && (
                  <span className="srk-month-closed">休</span>
                )}
              </div>
              {!closed && c.isCur && isTodayCell && todayCount > 0 && (
                <div className="srk-month-cell-body">
                  <div className="srk-month-count">
                    <b className="num">{todayCount}</b>
                    <em>件</em>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div
        style={{
          padding: '12px 16px',
          fontSize: 11.5,
          color: 'var(--muted)',
          textAlign: 'center',
        }}
      >
        ※ 日付クリックで詳細表示 · 日別ヒートマップは次回更新で対応
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
            {booking.ageBand || '—'} · 来店 {booking.repeat}回目
            {booking.source && (
              <>
                {' · '}
                <span style={{ color: 'var(--muted)' }}>経路: {booking.source}</span>
              </>
            )}
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
            {booking.tags.length > 0 ? (
              <ServicePills tags={booking.tags} />
            ) : (
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
            )}
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
            {booking.amount > 0 ? `¥${booking.amount.toLocaleString()}` : '—'}
          </div>
        </div>
        <div>
          <label>状態</label>
          <div>
            <span className={`srk-status srk-status-${booking.status}`}>
              <i />
              {booking.status === 'confirmed' ? '確定' :
               booking.status === 'tentative' ? '仮予約' :
               booking.status === 'inprogress' ? '来店中' :
               booking.status === 'done' ? '完了' :
               '見送り'}
            </span>
          </div>
        </div>
        <div className="full">
          <label>メニュー詳細 / メモ</label>
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
