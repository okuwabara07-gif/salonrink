'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Icon,
  Card,
  Sparkline,
  ServicePills,
  Avatar,
  Modal,
  CustomerPhoto,
  type IconName,
} from '@/components/srk';
import {
  STAFF,
  ADDABLE_STAFF,
  SERVICES,
  todayBookings,
  messages,
  weekTrend,
  revenueTrend,
  todos,
  reachoutCandidates,
  fmtTime,
  type Booking,
} from '@/lib/srkMockData';

/* ============================================================
   Dashboard — Home view
   ============================================================

   Phase 2 implementation. Mock data driven; Phase 3 will swap in
   Supabase queries for `todayBookings` and KPI metrics.

   Layout:
     1. KPI row (4 cards w/ sparkline + progress)
     2. 本日のタイムライン (30-min slots, horizontal scroll, now-line)
     3. 本日の予約 (card list w/ photo + LINE digest + receipt CTA)
     4. 3-col bottom: 来店促進候補 / 今日のタスク / メッセージ
     5. Reservation detail modal
   ============================================================ */

export default function DashboardHomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Booking | null>(null);
  // Use a stable "now" on the client to avoid SSR hydration mismatch.
  // 1-minute tick to advance the now-line and "対応中" badge.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const goTo = (path: string) => router.push(path);
  const openChart = (id: string) => router.push(`/dashboard/customers/${id}`);

  // KPI calculations
  const totalToday = todayBookings.length;
  const totalRevenue = todayBookings.reduce((s, b) => s + b.amount, 0);
  const weekTotal = weekTrend.slice(-7).reduce((a, b) => a + b, 0);
  const weekDelta = weekTotal - weekTrend.slice(0, 7).reduce((a, b) => a + b, 0);

  // Visible time scale — 30-minute slots, horizontally scrollable
  const HOUR_START = 10;
  const HOUR_END = 21;
  const SLOT_MIN = 30;
  const SLOT_W = 64;
  const slots = ((HOUR_END - HOUR_START) * 60) / SLOT_MIN;
  const totalMin = (HOUR_END - HOUR_START) * 60;
  const totalW = slots * SLOT_W;

  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const nowPctRaw = (nowMin - HOUR_START * 60) / totalMin;
  const nowX = Math.max(0, Math.min(1, nowPctRaw)) * totalW;
  const showNow = !!now && nowPctRaw >= 0 && nowPctRaw <= 1;

  const nowHHMM = now
    ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    : '--:--';

  return (
    <div className="srk-page">

      {/* ─── KPI ROW ─────────────────────────────────────────── */}
      <section className="srk-kpis">
        <KPI title="本日の予約" value={totalToday} unit="件"
             delta={`+${totalToday - 5} 件 vs 昨日`} positive
             trend={weekTrend} color="var(--gold)" icon="calendar" />
        <KPI title="今週の予約" value={weekTotal} unit="件"
             delta={`${weekDelta >= 0 ? '+' : ''}${weekDelta} 件 vs 先週`} positive={weekDelta >= 0}
             trend={weekTrend} color="var(--plum)" icon="users" />
        <KPI title="新規顧客（今月）" value={12} unit="名"
             delta="+4 名 vs 先月" positive
             trend={[2, 3, 1, 4, 3, 5, 3, 4, 6, 5, 7, 8, 6, 12]}
             color="var(--moss)" icon="sparkle" />
        <KPI title="本日の売上見込み" value={`¥${(totalRevenue / 1000).toFixed(1)}k`}
             delta={`目標 ¥80k に対して ${Math.round(totalRevenue / 80000 * 100)}%`}
             trend={revenueTrend} color="var(--sky)" icon="yen"
             progress={totalRevenue / 80000} />
      </section>

      {/* ─── TIMELINE ────────────────────────────────────────── */}
      <section className="srk-row">
        <Card
          title="本日のタイムライン"
          action={
            <div className="srk-hd-actions">
              <span className="srk-hd-meta">
                <span className="srk-now-dot" />
                現在 {nowHHMM}
              </span>
              <button className="srk-linkbtn" onClick={() => goTo('/dashboard/booking')}>
                スケジュール全画面 <Icon name="arrow_r" size={12} />
              </button>
            </div>
          }
        >
          <div className="srk-timeline">
            <div className="srk-tl-scroll">
              <div className="srk-tl-axis" style={{ width: totalW }}>
                {Array.from({ length: slots + 1 }).map((_, i) => {
                  const totalMins = HOUR_START * 60 + i * SLOT_MIN;
                  const h = Math.floor(totalMins / 60);
                  const m = totalMins % 60;
                  const isHour = m === 0;
                  return (
                    <div
                      key={i}
                      className={`srk-tl-tick ${isHour ? 'is-hour' : ''}`}
                      style={{ left: i * SLOT_W }}
                    >
                      <span>{isHour ? `${h}:00` : `:${String(m).padStart(2, '0')}`}</span>
                    </div>
                  );
                })}
              </div>

              {STAFF.map((st) => {
                const bookings = todayBookings.filter((b) => b.staff === st.id);
                return (
                  <div key={st.id} className="srk-tl-row" style={{ width: totalW }}>
                    {/* slot background grid */}
                    {Array.from({ length: slots }).map((_, i) => {
                      const totalMins = HOUR_START * 60 + i * SLOT_MIN;
                      const isHourEdge = totalMins % 60 === 0;
                      return (
                        <div
                          key={i}
                          className={`srk-tl-slot ${isHourEdge ? 'is-hour' : ''}`}
                          style={{ left: i * SLOT_W, width: SLOT_W }}
                        />
                      );
                    })}
                    {bookings.map((b) => {
                      const left = ((b.start - HOUR_START * 60) / SLOT_MIN) * SLOT_W;
                      const width = ((b.end - b.start) / SLOT_MIN) * SLOT_W;
                      const svc = SERVICES[b.tags[0]];
                      return (
                        <button
                          key={b.id}
                          className="srk-tl-block"
                          onClick={() => setSelected(b)}
                          style={{
                            left: left + 1,
                            width: width - 2,
                            background: `linear-gradient(180deg, ${svc.color}26, ${svc.color}10)`,
                            borderColor: `${svc.color}66`,
                          }}
                          type="button"
                        >
                          <div className="srk-tl-block-h">
                            <span className="srk-tl-block-time num">
                              {fmtTime(b.start)}–{fmtTime(b.end)}
                            </span>
                            {b.isNew && <span className="srk-tl-new">新</span>}
                          </div>
                          <div className="srk-tl-block-name">
                            {b.customer} <em>様</em>
                          </div>
                          <div className="srk-tl-block-menu">
                            {b.tags.map((t) => (
                              <span
                                key={t}
                                className="srk-tl-menu-tag"
                                style={{
                                  background: `${SERVICES[t].color}1a`,
                                  color: SERVICES[t].color,
                                  borderColor: `${SERVICES[t].color}50`,
                                }}
                              >
                                {SERVICES[t].label}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                    {showNow && (
                      <div className="srk-tl-now" style={{ left: nowX }}>
                        <span />
                        <em className="num">{nowHHMM}</em>
                      </div>
                    )}
                  </div>
                );
              })}

              {ADDABLE_STAFF.length > 0 && (
                <div className="srk-tl-add-staff" style={{ width: totalW }}>
                  <button
                    className="srk-tl-add-btn"
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('srk-open-add-staff'))
                    }
                  >
                    <Icon name="plus" size={14} />
                    <span>スタッフ枠を追加</span>
                    <em>+¥3,300/月（1名）</em>
                  </button>
                </div>
              )}
            </div>
            <div className="srk-tl-hint">
              <Icon name="arrow_r" size={11} /> 30分刻み · 横にスクロール可能
            </div>
          </div>
        </Card>
      </section>

      {/* ─── RESERVATIONS LIST ───────────────────────────────── */}
      <section className="srk-row">
        <Card
          title="本日の予約"
          action={
            <div className="srk-hd-actions">
              <button className="srk-chip is-active" type="button">
                全て {totalToday}
              </button>
              <button className="srk-chip" type="button">
                確定 {todayBookings.filter((b) => b.status === 'confirmed').length}
              </button>
              <button className="srk-chip" type="button">
                仮 {todayBookings.filter((b) => b.status === 'tentative').length}
              </button>
              <button className="srk-iconbtn ghost" type="button">
                <Icon name="filter" size={14} />
              </button>
            </div>
          }
          pad={false}
        >
          <div className="srk-rsv-list">
            {todayBookings
              .slice()
              .sort((a, b) => a.start - b.start)
              .map((b) => {
                const isPast = b.end <= nowMin;
                const isNow = b.start <= nowMin && b.end > nowMin;
                return (
                  <article
                    key={b.id}
                    className={`srk-rsv-card ${isPast ? 'is-past' : ''} ${isNow ? 'is-now' : ''} ${b.status === 'tentative' ? 'is-tentative' : ''}`}
                    onClick={() => setSelected(b)}
                  >
                    <div className="srk-rsv-time">
                      <span className="num">{fmtTime(b.start)}</span>
                      <em>{b.end - b.start}分</em>
                      {isNow && <span className="srk-rsv-livetag">対応中</span>}
                    </div>

                    <CustomerPhoto
                      id={`cust:${b.customer}`}
                      name={b.customer}
                      variant="rsv"
                    />

                    <div className="srk-rsv-main">
                      <header>
                        <div className="srk-rsv-cust-text">
                          <div className="srk-rsv-name-row">
                            <span className="srk-rsv-name">
                              {b.customer} <em>様</em>
                            </span>
                            {b.isNew && <span className="srk-tag-new">新規</span>}
                            <span className={`srk-status srk-status-${b.status}`}>
                              <i />
                              {b.status === 'confirmed' ? '確定' : '仮予約'}
                            </span>
                          </div>
                          <div className="srk-rsv-meta">
                            <span>{b.ageBand}</span>
                            <em>·</em>
                            <span>
                              来店 <b className="num">{b.repeat}</b>回目
                            </span>
                            <em>·</em>
                            <span className="srk-rsv-lastvisit">
                              <Icon name="clock" size={10} /> 前回 {b.lastVisit}
                            </span>
                          </div>
                        </div>
                      </header>

                      <div className="srk-rsv-menu-row">
                        <span className="srk-rsv-label">メニュー</span>
                        <ServicePills tags={b.tags} />
                        <span className="srk-rsv-price num">
                          ¥{b.amount.toLocaleString()}
                        </span>
                      </div>

                      {b.lineDigest && (
                        <div className="srk-rsv-digest">
                          <span className="srk-rsv-digest-label">
                            <Icon name="msg" size={10} /> LINE 事前カウンセリング
                          </span>
                          <p>「{b.lineDigest}」</p>
                        </div>
                      )}
                    </div>

                    <div
                      className="srk-rsv-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="srk-iconbtn ghost" title="メッセージ" type="button">
                        <Icon name="msg" size={14} />
                      </button>
                      <button
                        className="srk-iconbtn ghost"
                        title="カルテ"
                        type="button"
                        onClick={() => openChart('c_aoyama')}
                      >
                        <Icon name="users" size={14} />
                      </button>
                      <button className="srk-btn primary" type="button">
                        受付開始
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        </Card>
      </section>

      {/* ─── BOTTOM 3-COLUMN ─────────────────────────────────── */}
      <section className="srk-grid-3">
        {/* Reachout */}
        <Card
          title="来店促進候補"
          action={<span className="srk-hd-meta">{reachoutCandidates.length}名</span>}
          pad={false}
        >
          <ul className="srk-reach">
            {reachoutCandidates.map((r) => {
              const isDormant = r.daysSince >= 90;
              const colorCue =
                r.daysSince > 90 ? '#a85a3e' : r.daysSince > 60 ? '#c8983e' : '#5a6b3c';
              return (
                <li key={r.id}>
                  <div
                    className="srk-reach-row srk-reach-row-compact"
                    role="button"
                    tabIndex={0}
                    onClick={() => openChart('c_aoyama')}
                  >
                    <span className="srk-reach-avatar">
                      <CustomerPhoto
                        id={`cust:${r.name}`}
                        name={r.name}
                        variant="circle-sm"
                      />
                      {isDormant && <i className="srk-reach-dormant" title="休眠" />}
                    </span>
                    <div className="srk-reach-body">
                      <div className="srk-reach-h">
                        <b>
                          {r.name} <em>様</em>
                        </b>
                      </div>
                      <div className="srk-reach-meta">
                        <span className="srk-reach-days" style={{ color: colorCue }}>
                          <Icon name="clock" size={10} /> {r.daysSince}日前
                        </span>
                        <em>·</em>
                        <span>{r.reason}</span>
                      </div>
                    </div>
                    <div
                      className="srk-reach-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="srk-btn primary"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`${r.name}様にLINEで来店促進メッセージを送信しますか?`)) {
                            // TODO: Phase 4 で /api/messages/send にPOST
                            alert(`✅ ${r.name}様 にメッセージを送信しました(モック)`);
                          }
                        }}
                      >
                        <Icon name="plus" size={10} /> 招待
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="srk-card-footlink">
            <button
              className="srk-linkbtn"
              type="button"
              onClick={() => goTo('/dashboard/messages')}
            >
              DM一括配信 <Icon name="arrow_r" size={12} />
            </button>
          </div>
        </Card>

        {/* Todos */}
        <Card
          title="今日のタスク"
          action={
            <button className="srk-linkbtn" type="button">
              <Icon name="plus" size={12} /> 追加
            </button>
          }
        >
          <ul className="srk-todos">
            {todos.map((t) => (
              <li key={t.id} className={t.done ? 'is-done' : ''}>
                <label>
                  <input type="checkbox" defaultChecked={t.done} />
                  <span className="srk-todo-check">
                    <Icon name="check" size={11} />
                  </span>
                  <span className="srk-todo-text">{t.label}</span>
                  {t.urgent && !t.done && (
                    <span className="srk-todo-urgent">急ぎ</span>
                  )}
                </label>
              </li>
            ))}
          </ul>
          <div className="srk-todo-foot">
            残り {todos.filter((t) => !t.done).length} 件 · 完了率{' '}
            {Math.round((todos.filter((t) => t.done).length / todos.length) * 100)}%
          </div>
        </Card>

        {/* Messages */}
        <Card
          title="メッセージ"
          action={
            <span className="srk-badge-inline">
              {messages.filter((m) => m.unread).length}
            </span>
          }
        >
          <ul className="srk-msgs">
            {messages.map((m) => (
              <li key={m.id} className={m.unread ? 'is-unread' : ''}>
                <CustomerPhoto
                  id={`cust:${m.from}`}
                  name={m.from}
                  variant="circle-sm"
                />
                <div className="srk-msg-body">
                  <div className="srk-msg-h">
                    <b>{m.from}</b>
                    <em>{m.time}</em>
                  </div>
                  <p>{m.preview}</p>
                </div>
                {m.unread && <span className="srk-msg-dot" />}
              </li>
            ))}
          </ul>
          <div className="srk-card-footlink">
            <button
              className="srk-linkbtn"
              type="button"
              onClick={() => goTo('/dashboard/messages')}
            >
              全てのメッセージ <Icon name="arrow_r" size={12} />
            </button>
          </div>
        </Card>
      </section>

      {/* ─── DETAIL MODAL ────────────────────────────────────── */}
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

/* ─── KPI sub-component ─────────────────────────────────────── */

interface KPIProps {
  title: string;
  value: string | number;
  unit?: string;
  delta: string;
  positive?: boolean;
  trend: number[];
  color: string;
  icon: IconName;
  progress?: number;
}

function KPI({
  title,
  value,
  unit,
  delta,
  positive,
  trend,
  color,
  icon,
  progress,
}: KPIProps) {
  return (
    <div className="srk-kpi">
      <span
        className="srk-kpi-icon"
        style={{ background: `${color}1a`, color }}
      >
        <Icon name={icon} size={15} />
      </span>
      <div className="srk-kpi-body">
        <span className="srk-kpi-title">{title}</span>
        <div className="srk-kpi-val">
          <span className="num">{value}</span>
          {unit && <em>{unit}</em>}
        </div>
        <div className={`srk-kpi-delta ${positive ? 'pos' : 'neg'}`}>
          <Icon name={positive ? 'arrow_ur' : 'arrow_dr'} size={10} />
          <span>{delta}</span>
        </div>
      </div>
      <div className="srk-kpi-spark" aria-hidden="true">
        {progress !== undefined ? (
          <div className="srk-kpi-progress-bar">
            <span
              style={{ width: `${Math.min(100, progress * 100)}%`, background: color }}
            />
          </div>
        ) : (
          <Sparkline values={trend} w={90} h={22} color={color} />
        )}
      </div>
    </div>
  );
}

/* ─── Reservation Detail (modal body) ───────────────────────── */

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
