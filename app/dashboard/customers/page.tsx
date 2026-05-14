'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@/components/srk';
import {
  SAMPLE_CUSTOMERS,
  ALL_TAGS,
  STATUS_LIST,
  STATUS_PALETTE,
  getCustomerDetail,
  fmtDate,
  fmtDateFull,
  fmtDateTime,
  fmtYen,
  daysSince,
  tagColorFor,
  avatarColors,
  type SampleCustomer,
  type CustomerStatus,
  type ChatMessage,
  type Visit,
  type Karte,
  type PaletteEntry,
} from '@/lib/customers/sampleCustomers';

/* ============================================================
   /dashboard/customers — Phase 4+5 (split view)
   ============================================================

   Two-pane CRM:
     - Left rail (380px): status tabs, tag filter, customer list
     - Right: hero + 4 tabs (overview / history / karte / messages)

   Phase 6 で SAMPLE_CUSTOMERS を Supabase の customers table に置換。
   ============================================================ */

type TabId = 'overview' | 'history' | 'karte' | 'msg';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<SampleCustomer[]>(SAMPLE_CUSTOMERS);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'すべて' | CustomerStatus>('すべて');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState('c01');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tab, setTab] = useState<TabId>('overview');

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (status !== 'すべて' && c.status !== status) return false;
      if (tagFilter.length && !tagFilter.every((t) => c.tags.includes(t)))
        return false;
      if (query) {
        const q = query.toLowerCase();
        const blob = `${c.name} ${c.kana} ${c.phone} ${c.tags.join(' ')}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [customers, status, tagFilter, query]);

  const selected = customers.find((c) => c.id === selectedId) || filtered[0];

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of STATUS_LIST) {
      m[s] = s === 'すべて'
        ? customers.length
        : customers.filter((c) => c.status === s).length;
    }
    return m;
  }, [customers]);

  function updateCustomer(id: string, patch: Partial<SampleCustomer>) {
    setCustomers((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 60px)', // minus topbar
        minHeight: 0,
        background: 'var(--bg)',
      }}
    >
      {/* ── List rail ───────────────────────────────────── */}
      <aside
        style={{
          width: 340,
          flexShrink: 0,
          background: 'var(--paper)',
          borderRight: '1px solid var(--line-2)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {/* Search + count header */}
        <div
          style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',
              background: 'var(--bg-soft)',
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Icon name="search" size={14} style={{ color: 'var(--muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="名前・カナ・タグで検索"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 12.5,
                color: 'var(--ink)',
                fontFamily: 'inherit',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="クリア"
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              marginBottom: 8,
              overflowX: 'auto',
            }}
          >
            {STATUS_LIST.map((s) => {
              const active = status === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  type="button"
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: active ? 500 : 400,
                    background: active ? 'var(--ink)' : 'transparent',
                    color: active ? '#f5f0e6' : 'var(--ink-2)',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  {s}{' '}
                  <span
                    className="mono"
                    style={{
                      opacity: active ? 0.6 : 0.5,
                      fontSize: 10,
                    }}
                  >
                    {counts[s]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tag filter dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTagDropdown((v) => !v)}
              type="button"
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '7px 11px',
                border: '1px solid var(--line-2)',
                borderRadius: 7,
                background: 'var(--paper)',
                fontSize: 12,
                color: 'var(--ink-2)',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Icon name="filter" size={13} style={{ color: 'var(--muted)' }} />
              <span style={{ flex: 1 }}>
                {tagFilter.length === 0
                  ? 'タグで絞り込み'
                  : `${tagFilter.length}件のタグ`}
              </span>
              <Icon name="chev_d" size={13} style={{ color: 'var(--muted)' }} />
            </button>
            {showTagDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: 'var(--paper)',
                  border: '1px solid var(--line-2)',
                  borderRadius: 8,
                  boxShadow: '0 8px 28px rgba(31,24,19,0.10)',
                  padding: 6,
                  zIndex: 10,
                  maxHeight: 240,
                  overflowY: 'auto',
                }}
              >
                {ALL_TAGS.map((t) => {
                  const active = tagFilter.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setTagFilter((s) =>
                          active ? s.filter((x) => x !== t) : [...s, t]
                        )
                      }
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 10px',
                        border: 'none',
                        background: active ? 'var(--bg-soft)' : 'transparent',
                        borderRadius: 5,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 12,
                        color: 'var(--ink-2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 13,
                          height: 13,
                          borderRadius: 3,
                          border: `1px solid ${active ? 'var(--ink)' : 'var(--line-2)'}`,
                          background: active ? 'var(--ink)' : 'transparent',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {active && (
                          <Icon name="check" size={9} style={{ color: '#f5f0e6' }} stroke={2.5} />
                        )}
                      </span>
                      {t}
                    </button>
                  );
                })}
                {tagFilter.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTagFilter([])}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      padding: 6,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 11,
                      color: 'var(--muted)',
                      fontFamily: 'inherit',
                      borderTop: '1px solid var(--line)',
                      marginTop: 4,
                    }}
                  >
                    クリア
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Customer list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map((c) => {
            const isSel = c.id === selected?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: 12,
                  padding: '14px 18px',
                  minHeight: 78,
                  cursor: 'pointer',
                  background: isSel ? 'var(--bg-soft)' : 'transparent',
                  borderLeft: `2px solid ${isSel ? 'var(--ink)' : 'transparent'}`,
                  borderBottom: '1px solid var(--line)',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  border: 'none',
                  borderRadius: 0,
                }}
              >
                <NameAvatar name={c.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: 'var(--ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.name}
                    </span>
                    <StatusPill status={c.status} compact />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 11,
                      color: 'var(--muted)',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Icon name="clock" size={11} />
                      {c.lastVisit ? `${daysSince(c.lastVisit)}日前` : '初回'}
                    </span>
                    <span
                      className="mono"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Icon name="users" size={11} />
                      {c.totalVisits}回
                    </span>
                  </div>
                  {c.nextAppt && (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: '#7a5e3a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: 'var(--gold)',
                        }}
                      />
                      次回 {fmtDateTime(c.nextAppt)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div
              style={{
                padding: '48px 16px',
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: 12.5,
              }}
            >
              該当なし
            </div>
          )}
        </div>
      </aside>

      {/* ── Detail panel ────────────────────────────────── */}
      {selected && (
        <DetailPanel
          customer={selected}
          tab={tab}
          onTab={setTab}
          onUpdate={updateCustomer}
        />
      )}
    </div>
  );
}

/* ─── Detail panel (hero + tabs) ─────────────────────── */

function DetailPanel({
  customer,
  tab,
  onTab,
  onUpdate,
}: {
  customer: SampleCustomer;
  tab: TabId;
  onTab: (t: TabId) => void;
  onUpdate: (id: string, patch: Partial<SampleCustomer>) => void;
}) {
  const c = customer;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        background: 'var(--bg)',
        minHeight: 0,
      }}
    >
      {/* Hero */}
      <div
        style={{
          padding: '20px 28px 18px',
          background: 'var(--paper)',
          borderBottom: '1px solid var(--line-2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <NameAvatar
            name={c.name}
            size={56}
            ring={c.status === 'VIP'}
            ringColor={STATUS_PALETTE.VIP.fg}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
                flexWrap: 'wrap',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  fontFamily: 'var(--serif)',
                  color: 'var(--ink)',
                }}
              >
                {c.name}
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--muted)',
                    fontWeight: 400,
                  }}
                >
                  {' '}
                  様
                </span>
              </h2>
              <StatusPill status={c.status} />
            </div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                fontSize: 11.5,
                color: 'var(--muted)',
                flexWrap: 'wrap',
                rowGap: 2,
              }}
            >
              <span>{c.kana}</span>
              <span className="mono">{c.phone}</span>
              <span>担当 {c.stylist}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button type="button" style={btnStyle('ghost')}>
              <Icon name="msg" size={13} />
              メッセージ
            </button>
            <button type="button" style={btnStyle('primary')}>
              <Icon name="calendar" size={13} stroke={2} />
              予約を作成
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div
          style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
            borderTop: '1px solid var(--line)',
          }}
        >
          {[
            {
              label: '次回予約',
              value: c.nextAppt ? fmtDateTime(c.nextAppt) : '—',
              sub: c.nextAppt ? `担当 ${c.stylist}` : '予約なし',
              accent: !!c.nextAppt,
              mono: false,
            },
            {
              label: '前回来店',
              value: c.lastVisit ? fmtDateFull(c.lastVisit) : '—',
              sub: c.lastVisit ? `${daysSince(c.lastVisit)}日前` : '—',
              accent: false,
              mono: false,
            },
            {
              label: '累計来店',
              value: String(c.totalVisits),
              sub: '回',
              accent: false,
              mono: true,
            },
            {
              label: '累計売上',
              value: fmtYen(c.totalSpend),
              sub: '',
              accent: false,
              mono: true,
            },
          ].map((k, i) => (
            <div
              key={i}
              style={{
                padding: '14px 0 4px',
                paddingLeft: i === 0 ? 0 : 18,
                borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 6,
                }}
              >
                {k.label}
              </div>
              <div
                className={k.mono ? 'num' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 15,
                  fontWeight: k.mono ? 400 : 500,
                  color: k.accent ? '#7a5e3a' : 'var(--ink)',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {k.accent && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--gold)',
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {k.value}
                </span>
              </div>
              {k.sub && (
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--muted)',
                    marginTop: 3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {k.sub}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          padding: '0 24px',
          background: 'var(--paper)',
          borderBottom: '1px solid var(--line-2)',
          display: 'flex',
          gap: 0,
        }}
      >
        {(
          [
            { id: 'overview', label: '概要' },
            { id: 'history', label: '来店履歴' },
            { id: 'karte', label: 'カルテ' },
            { id: 'msg', label: 'メッセージ' },
          ] as const
        ).map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '12px 4px',
                margin: '0 16px 0 0',
                fontSize: 13,
                color: active ? 'var(--ink)' : 'var(--muted)',
                fontWeight: active ? 500 : 400,
                fontFamily: 'inherit',
                cursor: 'pointer',
                borderBottom: `2px solid ${active ? 'var(--ink)' : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          minHeight: 0,
        }}
      >
        {tab === 'overview' && (
          <OverviewTab customer={c} onUpdate={onUpdate} />
        )}
        {tab === 'history' && <HistoryTab customer={c} />}
        {tab === 'karte' && <KarteTab customer={c} />}
        {tab === 'msg' && <MessagesTab customer={c} />}
      </div>
    </div>
  );
}

/* ─── Overview Tab ─────────────────────────────────────── */

function OverviewTab({
  customer,
  onUpdate,
}: {
  customer: SampleCustomer;
  onUpdate: (id: string, patch: Partial<SampleCustomer>) => void;
}) {
  const c = customer;
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const recentVisits = c.lastVisit
    ? [
        { d: c.lastVisit, svc: 'カット + カラー', amt: 12800 },
        { d: '2026-03-15', svc: 'カット', amt: 5500 },
        { d: '2026-02-08', svc: 'カラー + トリートメント', amt: 11000 },
        { d: '2026-01-12', svc: 'カット + パーマ', amt: 13800 },
      ]
    : [];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionCard
          title="メモ"
          action={<Icon name="edit" size={13} style={{ color: 'var(--muted)' }} />}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13.5,
              lineHeight: 1.65,
              color: 'var(--ink-2)',
            }}
          >
            {c.note}
          </p>
        </SectionCard>

        <SectionCard title="最近の来店">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentVisits.map((v, i, arr) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 0',
                  borderBottom:
                    i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <DateChip dateIso={v.d} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink)' }}>{v.svc}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    担当 {c.stylist} · {fmtDateFull(v.d)}
                  </div>
                </div>
                <div
                  className="num"
                  style={{ fontSize: 13, color: 'var(--ink-2)' }}
                >
                  ¥{v.amt.toLocaleString()}
                </div>
              </div>
            ))}
            {!c.lastVisit && (
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--muted)',
                  padding: '8px 0',
                }}
              >
                来店履歴なし
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionCard title="連絡先">
          <ContactRow icon="msg" label="LINE" value="連携中 · 既読率 94%" />
          <ContactRow icon="msg" label="電話" value={c.phone} mono />
          <ContactRow
            icon="users"
            label="登録"
            value={fmtDateFull('2024-08-15')}
          />
        </SectionCard>

        <SectionCard
          title="タグ"
          action={
            <button
              type="button"
              onClick={() => setEditingTags((v) => !v)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                fontSize: 11,
                color: 'var(--muted)',
                letterSpacing: '0.05em',
              }}
            >
              {editingTags ? '完了' : '編集'}
            </button>
          }
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.tags.map((t) => (
              <Tag
                key={t}
                color={tagColorFor(t)}
                onRemove={
                  editingTags
                    ? () =>
                        onUpdate(c.id, { tags: c.tags.filter((x) => x !== t) })
                    : undefined
                }
              >
                {t}
              </Tag>
            ))}
            {editingTags && (
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    tagInput.trim() &&
                    !c.tags.includes(tagInput.trim())
                  ) {
                    onUpdate(c.id, { tags: [...c.tags, tagInput.trim()] });
                    setTagInput('');
                  }
                }}
                placeholder="+ Enter"
                style={{
                  border: '1px dashed var(--line-2)',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  outline: 'none',
                  width: 80,
                  background: 'transparent',
                  fontFamily: 'inherit',
                }}
              />
            )}
          </div>
        </SectionCard>

        <SectionCard title="この顧客について">
          <Insight
            icon="sparkle"
            text={
              c.totalVisits >= 20
                ? '累計来店20回以上 ・ VIP対象'
                : c.totalVisits === 0
                  ? '初来店予定'
                  : `直近${Math.min(c.totalVisits, 6)}ヶ月で${c.totalVisits}回来店`
            }
          />
          {c.status === '要注意' && (
            <Insight
              icon="bell"
              text="キャンセル歴あり。前日リマインダー推奨。"
              danger
            />
          )}
          {c.nextAppt && (
            <Insight
              icon="calendar"
              text={`次回まで残り${Math.max(
                0,
                Math.ceil(
                  (new Date(c.nextAppt.replace(' ', 'T')).getTime() -
                    Date.now()) /
                    86400000
                )
              )}日`}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

/* ─── History Tab ──────────────────────────────────────── */

function HistoryTab({ customer }: { customer: SampleCustomer }) {
  const d = getCustomerDetail(customer);
  const visits = d.visits;
  const [filter, setFilter] = useState<'all' | 'cut' | 'color' | 'perm' | 'treat'>('all');
  const [openIdx, setOpenIdx] = useState(0);

  const filtered = visits.filter((v) => {
    if (filter === 'all') return true;
    const text = v.services.map((s) => s.name).join(' ');
    if (filter === 'cut') return text.includes('カット');
    if (filter === 'color') return text.includes('カラー');
    if (filter === 'perm') return text.includes('パーマ');
    if (filter === 'treat') return text.includes('トリートメント');
    return true;
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        {(
          [
            { id: 'all', label: 'すべて', count: visits.length },
            { id: 'cut', label: 'カット' },
            { id: 'color', label: 'カラー' },
            { id: 'perm', label: 'パーマ' },
            { id: 'treat', label: 'トリートメント' },
          ] as const
        ).map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                border: `1px solid ${active ? 'var(--ink)' : 'var(--line-2)'}`,
                background: active ? 'var(--ink)' : 'var(--paper)',
                color: active ? '#f5f0e6' : 'var(--ink-2)',
                padding: '5px 11px',
                borderRadius: 999,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {f.label}
              {'count' in f && f.count != null && (
                <span
                  className="mono"
                  style={{ opacity: active ? 0.6 : 0.5, fontSize: 10 }}
                >
                  {f.count}
                </span>
              )}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 11px',
            border: '1px solid var(--line-2)',
            background: 'var(--paper)',
            borderRadius: 999,
            fontSize: 12,
            color: 'var(--ink-2)',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <Icon name="plus" size={12} stroke={2} />
          来店を記録
        </button>
      </div>

      <div style={{ position: 'relative', paddingLeft: 28 }}>
        <div
          style={{
            position: 'absolute',
            left: 7,
            top: 8,
            bottom: 8,
            width: 1,
            background: 'var(--line-2)',
          }}
        />
        {filtered.length === 0 && (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--muted)',
              background: 'var(--paper)',
              border: '1px dashed var(--line-2)',
              borderRadius: 10,
            }}
          >
            該当する履歴がありません
          </div>
        )}
        {filtered.map((v, i) => {
          const open = openIdx === i;
          return (
            <VisitRow
              key={i}
              visit={v}
              isFirst={i === 0}
              open={open}
              onToggle={() => setOpenIdx(open ? -1 : i)}
            />
          );
        })}
      </div>
    </div>
  );
}

function VisitRow({
  visit: v,
  isFirst,
  open,
  onToggle,
}: {
  visit: Visit;
  isFirst: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <div
        style={{
          position: 'absolute',
          left: -26,
          top: 18,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'var(--paper)',
          border: `2px solid ${isFirst ? 'var(--gold)' : 'var(--line-2)'}`,
          zIndex: 1,
        }}
      />
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line-2)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontFamily: 'inherit',
            textAlign: 'left',
          }}
        >
          <DateChip dateIso={v.date} size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13.5,
                color: 'var(--ink)',
                fontWeight: 500,
              }}
            >
              {v.services.map((s) => s.name).join(' · ')}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: 'var(--muted)',
                marginTop: 3,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span>担当 {v.stylist}</span>
              <span>{v.duration}分</span>
              <span>{fmtDateFull(v.date)}</span>
              {v.photoNote !== '—' && (
                <span style={{ color: '#7a5e3a' }}>📷 {v.photoNote}</span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              className="num"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              ¥{v.amt.toLocaleString()}
            </div>
          </div>
          <Icon
            name={open ? 'chev_d' : 'chev_r'}
            size={14}
            style={{ color: 'var(--muted)' }}
          />
        </button>
        {open && (
          <div
            style={{
              padding: '0 16px 14px 86px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            <div>
              <Label>明細</Label>
              <div
                style={{
                  background: 'var(--bg-soft)',
                  borderRadius: 8,
                  padding: '6px 12px',
                }}
              >
                {v.services.map((s, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      fontSize: 12,
                      borderBottom:
                        j < v.services.length - 1
                          ? '1px solid var(--line)'
                          : 'none',
                    }}
                  >
                    <span style={{ color: 'var(--ink-2)' }}>{s.name}</span>
                    <span className="num" style={{ color: 'var(--ink-2)' }}>
                      ¥{s.amt.toLocaleString()}
                    </span>
                  </div>
                ))}
                {v.products.length > 0 && (
                  <div
                    style={{
                      padding: '6px 0',
                      fontSize: 11,
                      color: 'var(--muted)',
                      borderTop: '1px solid var(--line)',
                    }}
                  >
                    店販: {v.products.join(', ')}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>メモ</Label>
              <div
                style={{
                  background: 'var(--bg-soft)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 12.5,
                  color: 'var(--ink-2)',
                  lineHeight: 1.6,
                  minHeight: 60,
                }}
              >
                {v.note || <span style={{ color: 'var(--muted)' }}>—</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Karte Tab ────────────────────────────────────────── */

function KarteTab({ customer }: { customer: SampleCustomer }) {
  const d = getCustomerDetail(customer);
  const k = d.karte;
  const [memo, setMemo] = useState(k.memo || '');
  const [editingMemo, setEditingMemo] = useState(false);

  useEffect(() => {
    setMemo(k.memo || '');
    setEditingMemo(false);
  }, [customer.id, k.memo]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionCard title="髪質・状態">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px 22px',
            }}
          >
            <KField label="長さ" value={k.hair.length} />
            <KField label="毛質" value={k.hair.type} />
            <KField label="頭皮" value={k.hair.scalp} />
            <KField
              label="トーン"
              value={k.hair.tone !== '—' ? `${k.hair.tone} レベル` : '—'}
              mono
            />
          </div>
        </SectionCard>

        <SectionCard
          title="ビフォー / アフター"
          action={
            <button
              type="button"
              style={{
                all: 'unset',
                cursor: 'pointer',
                fontSize: 11,
                color: 'var(--muted)',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Icon name="plus" size={11} stroke={2} />
              写真を追加
            </button>
          }
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}
          >
            {['2026/5/2 before', '2026/5/2 after', '2026/1/12 after', '2025/12/8 after'].map((cap, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '4 / 5',
                  background: 'var(--bg-soft)',
                  borderRadius: 8,
                  border: '1px dashed var(--line-2)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <svg
                  viewBox="0 0 100 125"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <defs>
                    <pattern
                      id={`hatch${i}`}
                      patternUnits="userSpaceOnUse"
                      width="8"
                      height="8"
                      patternTransform="rotate(45)"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="8"
                        stroke="var(--line-2)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="100"
                    height="125"
                    fill={`url(#hatch${i})`}
                    opacity="0.5"
                  />
                </svg>
                <div
                  className="mono"
                  style={{
                    position: 'relative',
                    width: '100%',
                    padding: '5px 7px',
                    background:
                      'linear-gradient(180deg, transparent 0%, rgba(31,24,19,0.05) 100%)',
                    fontSize: 10,
                    color: 'var(--ink-2)',
                  }}
                >
                  {cap}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="薬剤履歴">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {k.lastColor && (
              <FormulaCard
                label="カラー"
                date={k.lastColor.date}
                formula={k.lastColor.formula}
                notes={k.lastColor.notes}
                accentBg="rgba(184,149,100,0.18)"
                accentFg="#7a5e3a"
              />
            )}
            {k.lastPerm && (
              <FormulaCard
                label="パーマ"
                date={k.lastPerm.date}
                formula={k.lastPerm.formula}
                notes={k.lastPerm.notes}
                accentBg="rgba(107,45,58,0.10)"
                accentFg="#6b2d3a"
              />
            )}
            {k.lastTreatment && (
              <FormulaCard
                label="トリートメント"
                date={k.lastTreatment.date}
                formula={k.lastTreatment.name}
                notes={k.lastTreatment.notes}
                accentBg="rgba(90,107,60,0.12)"
                accentFg="#5a6b3c"
              />
            )}
            {!k.lastColor && !k.lastPerm && !k.lastTreatment && (
              <div
                style={{
                  padding: 16,
                  fontSize: 12.5,
                  color: 'var(--muted)',
                  textAlign: 'center',
                }}
              >
                薬剤履歴なし
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {k.allergies.length > 0 && (
          <div
            style={{
              background: 'rgba(168,90,62,0.08)',
              border: '1px solid rgba(168,90,62,0.30)',
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <Icon name="bell" size={16} style={{ color: '#a85a3e' }} />
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#7a3030',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                }}
              >
                注意事項 · ALLERGY
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  fontSize: 12.5,
                  color: 'var(--ink-2)',
                  lineHeight: 1.6,
                }}
              >
                {k.allergies.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <SectionCard title="好み">
          {k.preferences.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {k.preferences.map((p) => (
                <Tag
                  key={p}
                  color={{ bg: 'rgba(90,107,60,0.12)', fg: '#5a6b3c' }}
                >
                  {p}
                </Tag>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>未登録</div>
          )}
        </SectionCard>

        {k.avoidance.length > 0 && (
          <SectionCard title="避けるもの">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {k.avoidance.map((p) => (
                <Tag
                  key={p}
                  color={{ bg: 'rgba(168,90,62,0.12)', fg: '#a85a3e' }}
                >
                  {p}
                </Tag>
              ))}
            </div>
          </SectionCard>
        )}

        <SectionCard
          title="フリーメモ"
          action={
            <button
              type="button"
              onClick={() => setEditingMemo((v) => !v)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                fontSize: 11,
                color: 'var(--muted)',
                letterSpacing: '0.05em',
              }}
            >
              {editingMemo ? '保存' : '編集'}
            </button>
          }
        >
          {editingMemo ? (
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: 10,
                border: '1px solid var(--line-2)',
                borderRadius: 8,
                fontSize: 12.5,
                color: 'var(--ink-2)',
                lineHeight: 1.6,
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                background: 'var(--paper)',
              }}
            />
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                color: 'var(--ink-2)',
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
              }}
            >
              {memo || <span style={{ color: 'var(--muted)' }}>—</span>}
            </p>
          )}
        </SectionCard>

        <SectionCard title="サロン内メモ">
          <div
            style={{
              fontSize: 12,
              color: 'var(--ink-2)',
              lineHeight: 1.7,
            }}
          >
            <KvRow label="指名" value={customer.stylist} />
            <KvRow label="登録日" value="2024/08/15" mono />
            <KvRow label="紹介元" value="Instagram" />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function KField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          color: 'var(--muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        className={mono ? 'mono' : ''}
        style={{
          fontSize: 13.5,
          color: 'var(--ink)',
        }}
      >
        {value || <span style={{ color: 'var(--muted)' }}>—</span>}
      </div>
    </div>
  );
}

function FormulaCard({
  label,
  date,
  formula,
  notes,
  accentBg,
  accentFg,
}: {
  label: string;
  date: string;
  formula: string;
  notes: string;
  accentBg: string;
  accentFg: string;
}) {
  return (
    <div
      style={{
        border: '1px solid var(--line-2)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '8px 14px',
          background: accentBg,
          color: accentFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
        <span className="mono" style={{ fontSize: 11, opacity: 0.85 }}>
          {fmtDateFull(date)}
        </span>
      </div>
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 12.5,
            color: 'var(--ink)',
            lineHeight: 1.5,
            padding: '8px 10px',
            background: 'var(--bg-soft)',
            borderRadius: 6,
          }}
        >
          {formula}
        </div>
        {notes && (
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{notes}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Messages Tab ─────────────────────────────────────── */

function MessagesTab({ customer }: { customer: SampleCustomer }) {
  const d = getCustomerDetail(customer);
  const [messages, setMessages] = useState<ChatMessage[]>(d.messages);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(d.messages);
  }, [customer.id, d.messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  function send() {
    if (!draft.trim()) return;
    const now = new Date();
    const ts =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` +
      ` ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages((ms) => [
      ...ms,
      {
        id: 'new-' + Date.now(),
        ts,
        from: 'staff',
        text: draft.trim(),
        staffName: 'テスト太郎',
      },
    ]);
    setDraft('');
  }

  const templates = [
    { id: 't1', label: '予約確認', text: 'ご予約ありがとうございます。当日お待ちしております。' },
    { id: 't2', label: 'リマインダー', text: '明日のご予約のリマインドです。何かありましたらご連絡ください。' },
    { id: 't3', label: 'お礼', text: '本日はご来店ありがとうございました。気になる点があればお気軽にご連絡ください。' },
    { id: 't4', label: 'お誕生日', text: 'お誕生日おめでとうございます🎂 今月中ご来店でトリートメントサービスいたします。' },
  ];

  const groups: { date: string; items: ChatMessage[] }[] = [];
  messages.forEach((m) => {
    const date = m.ts.split(' ')[0];
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.items.push(m);
    else groups.push({ date, items: [m] });
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 20,
        height: '100%',
      }}
    >
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line-2)',
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 540,
          maxHeight: '70vh',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'rgba(6,199,85,0.15)',
              color: '#06873d',
              display: 'grid',
              placeItems: 'center',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              LINE 公式
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>
              {customer.name} さんと連携中
            </div>
          </div>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              border: '1px solid var(--line-2)',
              background: 'var(--paper)',
              borderRadius: 6,
              fontSize: 11.5,
              color: 'var(--ink-2)',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <Icon name="clock" size={12} />
            全履歴
          </button>
        </div>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px 18px 14px',
            background: 'var(--bg)',
          }}
        >
          {groups.length === 0 && (
            <div
              style={{
                padding: 48,
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--muted)',
              }}
            >
              まだメッセージがありません
            </div>
          )}
          {groups.map((g, gi) => (
            <React.Fragment key={g.date}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  margin: gi === 0 ? '0 0 14px' : '20px 0 14px',
                }}
              >
                <div
                  style={{ flex: 1, height: 1, background: 'var(--line-2)' }}
                />
                <div
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--muted)' }}
                >
                  {fmtDateFull(g.date)}
                </div>
                <div
                  style={{ flex: 1, height: 1, background: 'var(--line-2)' }}
                />
              </div>
              {g.items.map((m) => (
                <Bubble key={m.id} msg={m} customerName={customer.name} />
              ))}
            </React.Fragment>
          ))}
        </div>

        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--line-2)',
            background: 'var(--paper)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setDraft(t.text)}
                style={{
                  padding: '4px 10px',
                  border: '1px solid var(--line-2)',
                  background: 'var(--paper)',
                  borderRadius: 999,
                  fontSize: 11,
                  color: 'var(--ink-2)',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Icon
                  name="sparkle"
                  size={10}
                  style={{ color: 'var(--muted)' }}
                />
                {t.label}
              </button>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              border: '1px solid var(--line-2)',
              borderRadius: 10,
              padding: 8,
              background: 'var(--paper)',
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send();
              }}
              placeholder="メッセージを入力… (⌘ + Enter で送信)"
              rows={2}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                fontSize: 13,
                color: 'var(--ink)',
                background: 'transparent',
                lineHeight: 1.5,
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim()}
              style={{
                padding: '8px 14px',
                border: 'none',
                background: draft.trim() ? 'var(--ink)' : 'var(--bg-soft)',
                color: draft.trim() ? '#f5f0e6' : 'var(--muted)',
                borderRadius: 8,
                cursor: draft.trim() ? 'pointer' : 'not-allowed',
                fontSize: 12.5,
                fontWeight: 500,
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Icon name="arrow_r" size={13} stroke={2} />
              送信
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionCard title="連絡手段">
          <ChannelRow
            icon="msg"
            label="LINE 公式"
            status="連携中"
            statusPalette={{ bg: 'rgba(90,107,60,0.12)', fg: '#5a6b3c' }}
          />
          <ChannelRow
            icon="msg"
            label={customer.phone}
            status="着信履歴 2件"
            mono
          />
          <ChannelRow
            icon="msg"
            label="メール"
            status="未連携"
            statusPalette={{ bg: 'rgba(138,126,114,0.12)', fg: '#6b6357' }}
          />
        </SectionCard>

        <SectionCard title="自動配信設定">
          <ToggleRow label="予約前日リマインド" defaultOn />
          <ToggleRow label="来店後お礼メッセージ" defaultOn />
          <ToggleRow label="2ヶ月未来店フォロー" defaultOn={false} />
          <ToggleRow label="お誕生日メッセージ" defaultOn />
        </SectionCard>

        <SectionCard title="統計">
          <StatRow
            label="送信"
            value={messages.filter((m) => m.from === 'staff').length}
            sub="件"
          />
          <StatRow
            label="受信"
            value={messages.filter((m) => m.from === 'customer').length}
            sub="件"
          />
          <StatRow label="返信率" value={100} sub="%" mono />
        </SectionCard>
      </div>
    </div>
  );
}

function Bubble({
  msg,
  customerName,
}: {
  msg: ChatMessage;
  customerName: string;
}) {
  const isStaff = msg.from === 'staff';
  const time = msg.ts.split(' ')[1];

  if (isStaff) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 10,
          gap: 6,
          alignItems: 'flex-end',
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 10, color: 'var(--muted)' }}
        >
          {time}
        </span>
        <div
          style={{
            maxWidth: '70%',
            background: 'var(--ink)',
            color: '#f5f0e6',
            padding: '10px 13px',
            borderRadius: '14px 14px 4px 14px',
            fontSize: 13,
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
          }}
        >
          {msg.text}
          {msg.kind && (
            <div
              style={{
                fontSize: 9.5,
                opacity: 0.7,
                marginTop: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                letterSpacing: '0.08em',
              }}
            >
              <Icon name={msg.kind === 'reminder' ? 'bell' : 'check'} size={9} />
              {msg.kind === 'reminder' ? 'AUTO REMINDER' : 'CONFIRMED'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: 10,
        gap: 8,
        alignItems: 'flex-end',
      }}
    >
      <NameAvatar name={customerName} size={28} />
      <div
        style={{
          maxWidth: '70%',
          background: 'var(--paper)',
          color: 'var(--ink)',
          padding: '10px 13px',
          borderRadius: '14px 14px 14px 4px',
          fontSize: 13,
          lineHeight: 1.55,
          border: '1px solid var(--line-2)',
        }}
      >
        {msg.text}
      </div>
      <span
        className="mono"
        style={{ fontSize: 10, color: 'var(--muted)' }}
      >
        {msg.ts.split(' ')[1]}
      </span>
    </div>
  );
}

/* ─── Shared primitives ────────────────────────────────── */

function NameAvatar({
  name,
  size = 36,
  ring = false,
  ringColor,
}: {
  name: string;
  size?: number;
  ring?: boolean;
  ringColor?: string;
}) {
  const { bg, fg } = avatarColors(name);
  const initial = (name || '').replace(/\s/g, '').slice(0, 1);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'grid',
        placeItems: 'center',
        fontWeight: 600,
        fontSize: size * 0.42,
        flexShrink: 0,
        boxShadow: ring
          ? `0 0 0 2px ${ringColor || 'var(--gold)'}, 0 0 0 4px var(--bg)`
          : 'none',
      }}
    >
      {initial}
    </div>
  );
}

function StatusPill({
  status,
  compact = false,
}: {
  status: CustomerStatus;
  compact?: boolean;
}) {
  const c = STATUS_PALETTE[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: compact ? '2px 7px' : '3px 9px',
        fontSize: compact ? 10.5 : 11,
        fontWeight: 500,
        background: c.bg,
        color: c.fg,
        borderRadius: 999,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

function Tag({
  children,
  onRemove,
  color,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
  color: PaletteEntry;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        fontSize: 11,
        background: color.bg,
        color: color.fg,
        borderRadius: 6,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="remove"
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'inline-grid',
            placeItems: 'center',
            width: 12,
            height: 12,
            opacity: 0.7,
          }}
        >
          ✕
        </button>
      )}
    </span>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: 'var(--paper)',
        borderRadius: 10,
        border: '1px solid var(--line-2)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            fontWeight: 500,
          }}
        >
          {title}
        </div>
        {action}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: string;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '5px 0',
      }}
    >
      <Icon name={icon} size={13} style={{ color: 'var(--muted)' }} />
      <span
        style={{
          fontSize: 11,
          color: 'var(--muted)',
          width: 50,
        }}
      >
        {label}
      </span>
      <span
        className={mono ? 'mono' : ''}
        style={{
          flex: 1,
          fontSize: 12.5,
          color: 'var(--ink-2)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Insight({
  icon,
  text,
  danger,
}: {
  icon: string;
  text: string;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 9,
        padding: '8px 10px',
        marginBottom: 6,
        background: danger ? 'rgba(168,90,62,0.08)' : 'var(--bg-soft)',
        borderRadius: 7,
        fontSize: 12,
        color: danger ? '#7a3030' : 'var(--ink-2)',
        lineHeight: 1.5,
      }}
    >
      <Icon
        name={icon}
        size={13}
        style={{
          marginTop: 1,
          color: danger ? '#a85a3e' : 'var(--ink-2)',
        }}
      />
      <span>{text}</span>
    </div>
  );
}

function DateChip({ dateIso, size = 'sm' }: { dateIso: string; size?: 'sm' | 'lg' }) {
  const w = size === 'sm' ? 44 : 56;
  const pad = size === 'sm' ? '4px 0' : '6px 0';
  return (
    <div
      style={{
        width: w,
        padding: pad,
        textAlign: 'center',
        background: 'var(--bg-soft)',
        borderRadius: size === 'sm' ? 6 : 8,
        fontFamily: 'var(--mono)',
      }}
    >
      <div
        style={{
          fontSize: size === 'sm' ? 14 : 16,
          color: 'var(--ink)',
          lineHeight: 1.1,
          fontWeight: 500,
        }}
      >
        {fmtDate(dateIso).split('/')[1]}
      </div>
      <div
        style={{
          fontSize: size === 'sm' ? 9 : 10,
          color: 'var(--muted)',
          letterSpacing: '0.05em',
        }}
      >
        {fmtDate(dateIso).split('/')[0]}月
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: 'var(--muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function KvRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <span style={{ color: 'var(--muted)', minWidth: 56 }}>{label}</span>
      <span className={mono ? 'mono' : ''}>{value}</span>
    </div>
  );
}

function ChannelRow({
  icon,
  label,
  status,
  statusPalette,
  mono,
}: {
  icon: string;
  label: string;
  status: string;
  statusPalette?: PaletteEntry;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 0',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: 'var(--bg-soft)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--ink-2)',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={13} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className={mono ? 'mono' : ''}
          style={{
            fontSize: 12.5,
            color: 'var(--ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
        {statusPalette ? (
          <span
            style={{
              display: 'inline-block',
              fontSize: 10,
              fontWeight: 500,
              background: statusPalette.bg,
              color: statusPalette.fg,
              padding: '1px 6px',
              borderRadius: 4,
              marginTop: 2,
            }}
          >
            {status}
          </span>
        ) : (
          <div
            style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  defaultOn,
}: {
  label: string;
  defaultOn: boolean;
}) {
  const [v, setV] = useState(defaultOn);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{label}</span>
      <button
        type="button"
        onClick={() => setV(!v)}
        aria-pressed={v}
        style={{
          width: 30,
          height: 18,
          borderRadius: 999,
          background: v ? 'var(--ink)' : 'var(--line-2)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 120ms',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: v ? 14 : 2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--paper)',
            transition: 'left 120ms',
          }}
        />
      </button>
    </div>
  );
}

function StatRow({
  label,
  value,
  sub,
  mono,
}: {
  label: string;
  value: number | string;
  sub: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '8px 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{label}</span>
      <span
        className={mono ? 'num' : ''}
        style={{
          fontSize: 14,
          fontWeight: mono ? 400 : 500,
          color: 'var(--ink)',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
        <span
          style={{
            fontSize: 10.5,
            color: 'var(--muted)',
            marginLeft: 3,
            fontFamily: 'var(--sans)',
            fontWeight: 400,
          }}
        >
          {sub}
        </span>
      </span>
    </div>
  );
}

function btnStyle(kind: 'ghost' | 'primary'): React.CSSProperties {
  if (kind === 'primary') {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      border: 'none',
      background: 'var(--ink)',
      color: '#f5f0e6',
      borderRadius: 7,
      fontSize: 12.5,
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
    };
  }
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 13px',
    border: '1px solid var(--line-2)',
    background: 'var(--paper)',
    borderRadius: 7,
    fontSize: 12.5,
    color: 'var(--ink-2)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
