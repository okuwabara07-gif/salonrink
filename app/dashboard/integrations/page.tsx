'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/srk';
import { createClient } from '@/lib/supabase/client';

/* ============================================================
   /dashboard/link — Phase 7: 連携 (Integrations)
   ============================================================
   B案プロトタイプ "A · Status Dashboard" 準拠。
   3カラムグリッド・モノグラムタイル・ステータスピル・
   サマリー統計・絞り込みフィルタ・検索・スライドイン詳細パネル。

   Phase 7B で実データ連携:
   - LINE: kirei-line-bot Railway 状態
   - HPB: hpb_reservations 最新 sync 時刻 + 件数
   - リッチメニュー: LINE Messaging API 状態
   ============================================================ */

type ServiceStatus = 'connected' | 'configured' | 'disconnected' | 'soon';
type ServiceCategory = '予約' | 'コミュニケーション' | '会計' | 'マーケティング';
type ServiceKey =
  | 'line' | 'hp' | 'rich' | 'instagram' | 'cal' | 'sms' | 'mail' | 'pay';

interface ServiceMetric {
  label: string;
  value: string;
}

interface ServiceSetting {
  label: string;
  value: string;
  editable?: boolean;
  toggle?: boolean;
  on?: boolean;
}

interface Service {
  id: string;
  k: ServiceKey;
  name: string;
  desc: string;
  longDesc: string;
  cat: ServiceCategory;
  status: ServiceStatus;
  synced: number | null;
  last: string | null;
  /** Existing sub-route under /dashboard/integrations/. Null for not-yet-built pages. */
  path: string | null;
  eta?: string;
  metrics: ServiceMetric[];
  settings: ServiceSetting[];
}

const SERVICES: Service[] = [
  {
    id: 'line', k: 'line', name: 'LINE連携',
    desc: '予約・リマインド・フォローアップ',
    longDesc: 'LINE公式アカウント経由で予約受付・前日リマインド・来店後フォローまでを自動化します。',
    cat: 'コミュニケーション', status: 'disconnected',
    synced: null, last: null,
    path: '/dashboard/integrations/line',
    metrics: [],
    settings: [],
  },
  {
    id: 'hp', k: 'hp', name: 'ホットペッパー連携',
    desc: '外部予約サイトの自動同期',
    longDesc: '掲載中の予約サイトから予約情報を取り込み、サロンの予約台帳と自動でマージします。',
    cat: '予約', status: 'disconnected',
    synced: null, last: null,
    path: '/dashboard/integrations/hotpepper',
    metrics: [],
    settings: [],
  },
  {
    id: 'rich', k: 'rich', name: 'リッチメニュー設定',
    desc: 'LINEメニューをカスタマイズ',
    longDesc: 'LINE画面下部のメニュー領域をサロン専用に編集できます。予約・クーポン・店舗情報など6枠まで。',
    cat: 'コミュニケーション', status: 'disconnected',
    synced: null, last: null,
    path: '/dashboard/integrations/richmenu',
    metrics: [],
    settings: [],
  },
  {
    id: 'instagram', k: 'instagram', name: 'Instagram連携',
    desc: 'DM・予約フォームの統合',
    longDesc: 'InstagramのDMと予約フォームを統合し、フォロワーから直接予約を受け付けられるようにします。',
    cat: 'コミュニケーション', status: 'disconnected',
    synced: null, last: null, path: null,
    metrics: [], settings: [],
  },
  {
    id: 'cal', k: 'cal', name: 'Googleカレンダー',
    desc: 'スタッフ予定の双方向同期',
    longDesc: 'スタッフの個人カレンダーとサロン台帳を双方向で同期します。シフトの管理が一元化されます。',
    cat: '予約', status: 'disconnected',
    synced: null, last: null, path: null,
    metrics: [], settings: [],
  },
  {
    id: 'sms', k: 'sms', name: 'SMS配信',
    desc: '顧客へショートメッセージ送信',
    longDesc: 'LINEに登録していない顧客にも、SMSで予約確認・リマインドを送信できます。',
    cat: 'コミュニケーション', status: 'disconnected',
    synced: null, last: null, path: null,
    metrics: [], settings: [],
  },
  {
    id: 'mail', k: 'mail', name: 'おたより配信',
    desc: '顧客にメッセージを一括配信',
    longDesc: 'セグメント別に顧客へお知らせ・キャンペーン情報を一括配信できる機能です。',
    cat: 'マーケティング', status: 'soon',
    synced: null, last: null, eta: '2026年 6月',
    path: '/dashboard/integrations/otayori',
    metrics: [], settings: [],
  },
  {
    id: 'pay', k: 'pay', name: 'キャッシュレス決済',
    desc: '会計時の電子決済連携',
    longDesc: '主要な電子決済(QR決済・クレジット・電子マネー)を会計画面から直接利用できます。',
    cat: '会計', status: 'soon',
    synced: null, last: null, eta: '2026年 7月', path: null,
    metrics: [], settings: [],
  },
];

const STATUS_META: Record<ServiceStatus, { label: string; color: string; bg: string }> = {
  connected:    { label: '接続済み', color: '#5b8c5a', bg: '#eaf3e7' },
  configured:   { label: '設定済み', color: '#7a5e3a', bg: 'rgba(184,149,100,0.18)' },
  disconnected: { label: '未接続',   color: 'var(--muted)', bg: 'rgba(138,126,114,0.12)' },
  soon:         { label: '近日対応', color: '#b88547', bg: 'rgba(184,133,71,0.15)' },
};

const FILTERS: { id: 'all' | ServiceStatus; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'connected', label: '接続中' },
  { id: 'configured', label: '設定済' },
  { id: 'disconnected', label: '未接続' },
  { id: 'soon', label: '近日対応' },
];

/* ─── Service tile (monogram with gradient) ───────────────── */

const TILE_DEFS: Record<ServiceKey, { bg: string; label: string }> = {
  line:      { bg: 'linear-gradient(135deg,#7ec496,#5ba874)', label: 'L' },
  hp:        { bg: 'linear-gradient(135deg,#e88c6a,#d36548)', label: 'H' },
  rich:      { bg: 'linear-gradient(135deg,#a8b8e0,#7d92cf)', label: 'R' },
  mail:      { bg: 'linear-gradient(135deg,#e6c878,#cfa84a)', label: 'M' },
  instagram: { bg: 'linear-gradient(135deg,#c98ab3,#a85a8e)', label: 'I' },
  pay:       { bg: 'linear-gradient(135deg,#8fb4a0,#5a8a72)', label: '¥' },
  cal:       { bg: 'linear-gradient(135deg,#c4b5e0,#9986c7)', label: 'C' },
  sms:       { bg: 'linear-gradient(135deg,#88b4cc,#5a8aa8)', label: 'S' },
};

function ServiceTile({ kind, size = 44 }: { kind: ServiceKey; size?: number }) {
  const tile = TILE_DEFS[kind];
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: size * 0.24,
        background: tile.bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--serif)',
        fontWeight: 700,
        fontSize: size * 0.45,
        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
    >
      {tile.label}
    </div>
  );
}

/* ============================================================
   Page
   ============================================================ */

export default function LinkPage() {
  const [filter, setFilter] = useState<'all' | ServiceStatus>('all');
  const [query, setQuery] = useState('');
  const [openService, setOpenService] = useState<Service | null>(null);
  const [hpbConnected, setHpbConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: salonRows } = await supabase
          .from('salons')
          .select('id')
          .eq('owner_user_id', user.id)
          .limit(1);
        const salonId = salonRows?.[0]?.id;
        if (!salonId) return;
        const { data: hpbRows } = await supabase
          .from('hpb_reservations')
          .select('id')
          .eq('salon_id', salonId)
          .limit(1);
        if (!cancelled) setHpbConnected((hpbRows?.length ?? 0) > 0);
      } catch {
        /* 連携ステータス取得失敗時は未接続表示を維持（既存挙動） */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const services = useMemo<Service[]>(
    () =>
      SERVICES.map((s) =>
        s.k === 'hp'
          ? { ...s, status: (hpbConnected ? 'connected' : 'disconnected') as ServiceStatus }
          : s
      ),
    [hpbConnected]
  );

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (filter !== 'all' && s.status !== filter) return false;
      if (query && !s.name.includes(query) && !s.desc.includes(query))
        return false;
      return true;
    });
  }, [services, filter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: services.length };
    for (const f of FILTERS.slice(1)) {
      c[f.id] = services.filter((s) => s.status === f.id).length;
    }
    return c;
  }, [services]);

  return (
    <div className="srk-page" style={{ paddingBottom: 32 }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 22,
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 26,
              margin: 0,
              fontWeight: 500,
              color: 'var(--ink)',
              letterSpacing: '0.02em',
            }}
          >
            連携設定
          </h1>
          <div
            style={{
              fontSize: 12,
              color: 'var(--muted)',
              marginTop: 4,
            }}
          >
            外部サービスとの連携を管理します
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 22,
            fontSize: 11,
            alignItems: 'baseline',
            flexWrap: 'wrap',
          }}
        >
          <StatChip n={counts.connected} label="接続中" color="#5b8c5a" />
          <StatChip n={counts.configured} label="設定済" color="#7a5e3a" />
          <StatChip n={counts.disconnected} label="未接続" color="var(--muted)" />
          <StatChip n={counts.soon} label="近日対応" color="#b88547" />
        </div>
      </div>

      {/* Filters + search */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {FILTERS.map((f) => {
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                background: isActive ? 'var(--ink)' : 'transparent',
                color: isActive ? '#f0e6d2' : 'var(--ink)',
                border: `1px solid ${isActive ? 'var(--ink)' : 'var(--line-2)'}`,
                padding: '6px 12px',
                borderRadius: 100,
                fontSize: 12,
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background .15s, color .15s',
              }}
            >
              {f.label}
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  padding: '0 5px',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'var(--bg-soft)',
                  color: isActive ? '#f0e6d2' : 'var(--muted)',
                  borderRadius: 100,
                }}
              >
                {counts[f.id]}
              </span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'var(--paper)',
            borderRadius: 100,
            border: '1px solid var(--line-2)',
            fontSize: 12,
            color: 'var(--muted)',
            width: 220,
          }}
        >
          <Icon name="search" size={13} style={{ color: 'var(--muted)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="連携サービスを検索"
            style={{
              flex: 1,
              border: 0,
              outline: 0,
              background: 'transparent',
              fontSize: 12,
              color: 'var(--ink)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {filtered.map((s) => (
          <IntegrationCard
            key={s.id}
            service={s}
            onOpen={(svc) => setOpenService(svc)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: 13,
            background: 'var(--paper)',
            borderRadius: 12,
            border: '1px dashed var(--line-2)',
          }}
        >
          該当する連携サービスが見つかりません
        </div>
      )}

      {/* Help footer */}
      <div
        style={{
          marginTop: 28,
          padding: '16px 22px',
          background: 'var(--paper)',
          borderRadius: 12,
          border: '1px solid var(--line-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 100,
            background: 'rgba(184,149,100,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7a5e3a',
            flexShrink: 0,
            fontSize: 18,
            fontFamily: 'var(--serif)',
            fontWeight: 600,
          }}
        >
          ?
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            連携でお困りですか?
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              marginTop: 2,
            }}
          >
            各サービスの接続方法はヘルプセンターで詳しく解説しています。
          </div>
        </div>
        <button
          type="button"
          style={{
            background: 'transparent',
            border: '1px solid var(--line-2)',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--ink)',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          ヘルプを見る →
        </button>
      </div>

      <DetailPanel
        service={openService}
        onClose={() => setOpenService(null)}
      />
    </div>
  );
}

/* ─── StatChip (top-right summary) ─────────────────────────── */

function StatChip({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 18,
          color,
          fontWeight: 600,
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
    </div>
  );
}

/* ─── Integration Card ─────────────────────────────────────── */

function IntegrationCard({
  service,
  onOpen,
}: {
  service: Service;
  onOpen: (s: Service) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const st = STATUS_META[service.status];
  const isSoon = service.status === 'soon';
  const isDisc = service.status === 'disconnected';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !isSoon && onOpen(service)}
      style={{
        background: 'var(--paper)',
        borderRadius: 12,
        padding: 18,
        border: `1px solid ${hovered ? '#d8c8b0' : 'var(--line-2)'}`,
        opacity: isSoon ? 0.78 : 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: isSoon ? 'default' : 'pointer',
        transform: hovered && !isSoon ? 'translateY(-1px)' : 'none',
        transition: 'transform .15s, border-color .15s, box-shadow .15s',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <ServiceTile kind={service.k} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--ink)',
            }}
          >
            {service.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              lineHeight: 1.5,
              marginTop: 3,
            }}
          >
            {service.desc}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 9px',
            borderRadius: 100,
            background: st.bg,
            color: st.color,
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: st.color,
            }}
          />
          {st.label}
        </span>
        {service.eta && (
          <span
            style={{
              fontSize: 10,
              color: '#b88547',
              fontWeight: 500,
            }}
          >
            {service.eta}
          </span>
        )}
      </div>

      {(service.synced != null || service.last) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 11,
            color: 'var(--muted)',
            paddingTop: 10,
            borderTop: '1px dashed var(--line)',
          }}
        >
          {service.synced != null && (
            <span>
              <b
                className="num"
                style={{ color: 'var(--ink)', fontWeight: 600 }}
              >
                {service.synced.toLocaleString()}
              </b>{' '}
              件同期
            </span>
          )}
          {service.last && <span>最終: {service.last}</span>}
          <span
            style={{
              marginLeft: 'auto',
              color: 'var(--gold)',
              fontWeight: 500,
              transform: hovered ? 'translateX(2px)' : 'none',
              transition: 'transform .15s',
            }}
          >
            管理 →
          </span>
        </div>
      )}

      {service.synced == null && !service.last && (
        <div
          style={{
            paddingTop: 10,
            borderTop: '1px dashed var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: isSoon ? 'var(--muted)' : 'var(--gold)',
              transform: hovered && !isSoon ? 'translateX(2px)' : 'none',
              transition: 'transform .15s',
            }}
          >
            {isSoon ? '近日対応予定' : isDisc ? '接続する →' : '管理 →'}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Detail Panel (slide-in from right) ──────────────────── */

function DetailPanel({
  service,
  onClose,
}: {
  service: Service | null;
  onClose: () => void;
}) {
  if (!service) return null;
  const st = STATUS_META[service.status];
  const isConnected =
    service.status === 'connected' || service.status === 'configured';
  const isDisc = service.status === 'disconnected';

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20,15,10,0.25)',
          zIndex: 50,
          animation: 'srkFadeIn .18s ease',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(480px, 92vw)',
          background: 'var(--bg-soft)',
          zIndex: 51,
          overflow: 'auto',
          boxShadow: '-8px 0 32px rgba(20,15,10,0.12)',
          animation: 'srkSlideIn .22s cubic-bezier(.2,.7,.3,1)',
          color: 'var(--ink)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 26px 20px',
            borderBottom: '1px solid var(--line-2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                padding: 6,
                color: 'var(--muted)',
                borderRadius: 6,
                fontSize: 18,
                lineHeight: 1,
              }}
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <ServiceTile kind={service.k} size={56} />
            <div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                {service.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  marginTop: 3,
                }}
              >
                {service.cat}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--ink)',
              lineHeight: 1.7,
              marginTop: 14,
            }}
          >
            {service.longDesc}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 14,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 100,
                background: st.bg,
                color: st.color,
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: st.color,
                }}
              />
              {st.label}
            </span>
            {service.last && (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                最終同期: {service.last}
              </span>
            )}
          </div>
        </div>

        {/* Metrics */}
        {service.metrics.length > 0 && (
          <div
            style={{
              padding: '20px 26px',
              borderBottom: '1px solid var(--line-2)',
            }}
          >
            <SectionLabel>パフォーマンス</SectionLabel>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
                marginTop: 12,
              }}
            >
              {service.metrics.map((m) => (
                <div
                  key={m.label}
                  style={{
                    background: 'var(--paper)',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--ink)',
                    }}
                  >
                    {m.value}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--muted)',
                      marginTop: 2,
                    }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {service.settings.length > 0 && (
          <div
            style={{
              padding: '20px 26px',
              borderBottom: '1px solid var(--line-2)',
            }}
          >
            <SectionLabel>設定</SectionLabel>
            <div
              style={{
                marginTop: 12,
                background: 'var(--paper)',
                borderRadius: 8,
                border: '1px solid var(--line)',
                overflow: 'hidden',
              }}
            >
              {service.settings.map((s, i) => (
                <SettingRow
                  key={s.label}
                  setting={s}
                  last={i === service.settings.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty / soon state */}
        {isDisc && (
          <div style={{ padding: '24px 26px', textAlign: 'center' }}>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--muted)',
                lineHeight: 1.7,
                marginBottom: 16,
              }}
            >
              このサービスはまだ接続されていません。
              <br />
              下のボタンから接続を開始してください。
            </div>
          </div>
        )}

        {service.status === 'soon' && (
          <div style={{ padding: '32px 26px', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '5px 12px',
                background: 'rgba(184,133,71,0.15)',
                color: '#b88547',
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 500,
                marginBottom: 12,
              }}
            >
              {service.eta} に提供予定
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--muted)',
                lineHeight: 1.7,
              }}
            >
              準備が整い次第、こちらの画面からご利用いただけるようになります。
              <br />
              リリース時にメールでお知らせします。
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div
          style={{
            padding: '18px 26px',
            display: 'flex',
            gap: 10,
            background: 'var(--bg-soft)',
            position: 'sticky',
            bottom: 0,
            borderTop: '1px solid var(--line-2)',
          }}
        >
          {isConnected && service.path && (
            <Link
              href={service.path}
              style={{ ...btnPrimary, flex: 1, textAlign: 'center', textDecoration: 'none' }}
            >
              詳細設定を開く →
            </Link>
          )}
          {isConnected && !service.path && (
            <button type="button" style={{ ...btnPrimary, flex: 1 }}>
              変更を保存
            </button>
          )}
          {isDisc && service.path && (
            <Link
              href={service.path}
              style={{ ...btnPrimary, flex: 1, textAlign: 'center', textDecoration: 'none' }}
            >
              接続を開始 →
            </Link>
          )}
          {isDisc && !service.path && (
            <button type="button" style={{ ...btnPrimary, flex: 1 }}>
              接続を開始 →
            </button>
          )}
          {service.status === 'soon' && service.path && (
            <Link
              href={service.path}
              style={{ ...btnSecondary, flex: 1, textAlign: 'center', textDecoration: 'none' }}
            >
              プレビューを見る
            </Link>
          )}
          {service.status === 'soon' && !service.path && (
            <button type="button" style={{ ...btnSecondary, flex: 1 }}>
              リリース通知を受け取る
            </button>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes srkFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes srkSlideIn {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

const btnPrimary: React.CSSProperties = {
  flex: 1,
  background: 'var(--ink)',
  color: '#f0e6d2',
  border: 0,
  padding: '11px 14px',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'inherit',
  cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--ink)',
  border: '1px solid var(--line-2)',
  padding: '11px 14px',
  borderRadius: 8,
  fontSize: 12,
  fontFamily: 'inherit',
  cursor: 'pointer',
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: '0.15em',
        color: 'var(--muted)',
        fontWeight: 500,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  );
}

function SettingRow({
  setting,
  last,
}: {
  setting: ServiceSetting;
  last: boolean;
}) {
  const [on, setOn] = useState(setting.on ?? false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 14px',
        borderBottom: last ? 'none' : '1px solid var(--line)',
        fontSize: 12,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ color: 'var(--muted)', fontSize: 11 }}>
          {setting.label}
        </div>
        <div style={{ color: 'var(--ink)', marginTop: 2 }}>
          {setting.value}
        </div>
      </div>
      {setting.toggle && (
        <button
          type="button"
          onClick={() => setOn(!on)}
          aria-pressed={on}
          style={{
            width: 32,
            height: 18,
            borderRadius: 100,
            padding: 2,
            background: on ? 'var(--gold)' : 'var(--line-2)',
            border: 0,
            cursor: 'pointer',
            transition: 'background .15s',
            position: 'relative',
          }}
        >
          <span
            style={{
              display: 'block',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#fff',
              transform: on ? 'translateX(14px)' : 'translateX(0)',
              transition: 'transform .15s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </button>
      )}
      {setting.editable && !setting.toggle && (
        <span style={{ color: 'var(--muted)', fontSize: 11 }}>編集</span>
      )}
    </div>
  );
}
