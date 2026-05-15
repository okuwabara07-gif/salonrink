'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ============================================================
   /dashboard/more — Phase 8: その他ページ完全リニューアル
   ============================================================
   B案ハンドオフ準拠。
   - Hero (h1 + サロンステータスカード)
   - 機能カードグリッド (設定 / アカウント / ログアウト)
   - サポートフッター
   - 右スライドドロワー (設定パネル)
   - トースト
   ============================================================ */

type DrawerKind = null | 'settings';

interface SettingsState {
  notif: boolean;
  reminder: boolean;
  dm: boolean;
  dark: boolean;
}

export default function MorePage() {
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [toast, setToast] = useState<string>('');
  const [settings, setSettings] = useState<SettingsState>({
    notif: true,
    reminder: true,
    dm: false,
    dark: false,
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Esc closes drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawer(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      style={{
        padding: '8px 36px 28px',
        position: 'relative',
        minHeight: 'calc(100vh - 80px)',
      }}
    >
      {/* Decorative leaves (right top) */}
      <DecorLeaves />

      {/* Hero */}
      <Hero />

      {/* Feature cards */}
      <FeatureCards
        onOpenSettings={() => setDrawer('settings')}
        onLogout={() => setToast('ログアウトしました')}
      />

      {/* Support footer */}
      <Support
        onHelp={() => setToast('ヘルプセンターを開きます')}
        onContact={() => setToast('お問い合わせを開きます')}
      />

      {/* Drawer */}
      <Drawer
        open={drawer !== null}
        onClose={() => setDrawer(null)}
        title={drawer === 'settings' ? '設定' : ''}
      >
        {drawer === 'settings' && (
          <SettingsPanel
            settings={settings}
            setSettings={setSettings}
            onSave={() => {
              setDrawer(null);
              setToast('設定を保存しました');
            }}
          />
        )}
      </Drawer>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--ink)',
            color: '#f0e6d2',
            padding: '12px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 24px rgba(20,15,10,0.25)',
            zIndex: 100,
            animation: 'srkToastIn .2s ease-out',
          }}
        >
          <CheckIcon />
          {toast}
        </div>
      )}

      <style jsx>{`
        @keyframes srkToastIn {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─── Decorative leaves (right top) ─────────────────── */

function DecorLeaves() {
  return (
    <svg
      viewBox="0 0 320 320"
      style={{
        position: 'absolute',
        top: -40,
        right: -60,
        width: 320,
        height: 320,
        opacity: 0.4,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden
    >
      <g
        fill="none"
        stroke="#d4c4a8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M160 30 C180 80, 200 120, 230 150" />
        <path d="M230 150 C240 130, 250 110, 245 90" />
        <path d="M230 150 C220 140, 210 130, 195 132" />
        <path d="M195 132 C200 115, 205 100, 200 85" />
        <path d="M195 132 C185 130, 175 125, 170 115" />
        <path d="M160 30 C150 50, 145 75, 150 100" />
        <path d="M150 100 C140 95, 130 92, 122 95" />
        <path d="M122 95 C115 85, 110 75, 112 65" />
        <path d="M150 100 C155 115, 165 130, 175 138" />
        <path d="M160 30 C168 35, 175 45, 178 58" />
      </g>
    </svg>
  );
}

/* ─── Hero ──────────────────────────────────────────── */

function Hero() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(380px, 520px)',
        gap: 32,
        alignItems: 'end',
        marginBottom: 28,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--serif)',
            fontSize: 36,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: '0.01em',
            color: 'var(--ink)',
          }}
        >
          サロン運営を、もっとスマートに。
        </h1>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 13.5,
            color: 'var(--ink-2)',
            lineHeight: 1.6,
          }}
        >
          各種設定や便利な機能で、サロンワークを効率化しましょう。
        </p>
      </div>
      <SalonStatusCard />
    </div>
  );
}

function SalonStatusCard() {
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line-2)',
        borderRadius: 14,
        padding: '18px 22px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--ink)',
          }}
        >
          サロンステータス
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          すべて正常に稼働中
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#5b8c5a',
              color: '#fff',
              display: 'inline-grid',
              placeItems: 'center',
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            ✓
          </span>
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}
      >
        <StatusItem
          label="LINE連携"
          status="正常"
          bg="rgba(91,140,90,0.18)"
          fg="#5b8c5a"
          pulse
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          }
        />
        <StatusItem
          label="予約同期"
          status="正常"
          bg="rgba(184,149,100,0.20)"
          fg="#7a5e3a"
          pulse
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2"/>
              <path d="M3 9h18M8 3v4M16 3v4"/>
            </svg>
          }
        />
        <StatusItem
          label="DM配信"
          status="正常"
          bg="rgba(96,128,180,0.18)"
          fg="#4a6b8f"
          pulse
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>
            </svg>
          }
        />
        <StatusItem
          label="データ保護"
          status="有効"
          bg="rgba(138,126,114,0.18)"
          fg="var(--gold)"
          statusColor="#7a5e3a"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          }
        />
      </div>
    </div>
  );
}

function StatusItem({
  label,
  status,
  bg,
  fg,
  pulse,
  statusColor,
  icon,
}: {
  label: string;
  status: string;
  bg: string;
  fg: string;
  pulse?: boolean;
  statusColor?: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: bg,
          color: fg,
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto 6px',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--ink-2)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 500,
          color: statusColor || '#5b8c5a',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {pulse && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#5b8c5a',
              boxShadow: '0 0 0 3px rgba(91,140,90,0.22)',
            }}
          />
        )}
        {status}
      </div>
    </div>
  );
}

/* ─── Feature Cards (設定 / アカウント / ログアウト) ─── */

function FeatureCards({
  onOpenSettings,
  onLogout,
}: {
  onOpenSettings: () => void;
  onLogout: () => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <FeatureCard
        title="設定"
        badge="13項目"
        badgeColor="gold"
        iconBg="rgba(184,149,100,0.20)"
        iconFg="#7a5e3a"
        icon={<CogIcon />}
        desc="営業時間・スタッフ・通知設定など"
        rows={[
          { k: '営業時間', v: '10:00 - 20:00', mono: true },
          { k: '通知設定', v: 'ON', color: '#5b8c5a' },
          { k: 'スタッフ', v: '4 名' },
          { k: '定休日', v: '水曜日', muted: true },
        ]}
        cta="設定を開く →"
        ctaBg="rgba(184,149,100,0.18)"
        ctaFg="#7a5e3a"
        href="/dashboard/settings"
      />
      <FeatureCard
        title="アカウント"
        iconBg="rgba(184,149,100,0.20)"
        iconFg="#7a5e3a"
        icon={<UsersIcon />}
        desc="プロフィール・パスワード・店舗情報"
        rows={[
          { k: '店舗', v: 'キレイ 鶴見店' },
          { k: 'オーナー', v: 'テスト太郎' },
          { k: 'メール', v: 'test@…' },
          { k: '最終ログイン', v: '今日 09:21', mono: true },
        ]}
        cta="編集する →"
        ctaBg="rgba(184,149,100,0.18)"
        ctaFg="#7a5e3a"
        href="/dashboard/account"
      />
      <FeatureCard
        title="ログアウト"
        iconBg="rgba(168,90,62,0.10)"
        iconFg="#a85a3e"
        icon={<LogoutIcon />}
        desc="アカウントからサインアウト"
        rows={[
          { k: '現在のセッション', v: '今日 09:21〜', mono: true },
          { k: 'セキュリティ', v: '保護有効', color: '#5b8c5a' },
        ]}
        cta="ログアウトする →"
        ctaBg="rgba(168,90,62,0.10)"
        ctaFg="#a85a3e"
        onClick={onLogout}
      />
    </div>
  );
}

function FeatureCard({
  title,
  badge,
  badgeColor,
  iconBg,
  iconFg,
  icon,
  desc,
  rows,
  cta,
  ctaBg,
  ctaFg,
  onClick,
  href,
}: {
  title: string;
  badge?: string;
  badgeColor?: 'gold';
  iconBg: string;
  iconFg: string;
  icon: React.ReactNode;
  desc: string;
  rows: { k: string; v: string; mono?: boolean; color?: string; muted?: boolean }[];
  cta: string;
  ctaBg: string;
  ctaFg: string;
  onClick?: () => void;
  href?: string;
}) {
  const [hovered, setHovered] = useState(false);

  const CardBody = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: 'var(--paper)',
        border: `1px solid ${hovered ? '#d8c8b0' : 'var(--line-2)'}`,
        borderRadius: 18,
        padding: '24px 24px 20px',
        minHeight: 260,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? '0 12px 28px -16px rgba(64,55,40,0.18)'
          : 'none',
        transition: 'transform .15s, box-shadow .15s, border-color .15s',
        textDecoration: 'none',
        color: 'inherit',
        fontFamily: 'inherit',
        textAlign: 'left',
        width: '100%',
      }}
    >
      {/* Head */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: iconBg,
              color: iconFg,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {title}
              {badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background:
                      badgeColor === 'gold'
                        ? 'rgba(184,149,100,0.20)'
                        : 'var(--bg-soft)',
                    color: '#7a5e3a',
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--ink-2)',
            lineHeight: 1.5,
          }}
        >
          {desc}
        </div>
      </div>

      {/* Body kv rows */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '8px 0',
          borderTop: '1px solid var(--line)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              fontSize: 11.5,
              padding: '3px 0',
            }}
          >
            <span style={{ color: 'var(--muted)' }}>{r.k}</span>
            <span
              className={r.mono ? 'mono' : ''}
              style={{
                color: r.muted
                  ? 'var(--muted)'
                  : r.color || 'var(--ink)',
                fontWeight: r.color ? 600 : 400,
              }}
            >
              {r.v}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          background: ctaBg,
          color: ctaFg,
          padding: '10px 14px',
          borderRadius: 10,
          fontSize: 12.5,
          fontWeight: 600,
          textAlign: 'center',
          letterSpacing: '0.02em',
          transition: 'gap .15s',
        }}
      >
        {cta}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {CardBody}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {CardBody}
    </button>
  );
}

/* ─── Support Footer ───────────────────────────────── */

function Support({
  onHelp,
  onContact,
}: {
  onHelp: () => void;
  onContact: () => void;
}) {
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line-2)',
        borderRadius: 18,
        padding: '22px 28px',
        marginTop: 22,
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: 24,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'rgba(184,149,100,0.18)',
            color: '#7a5e3a',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <HeadsetIcon />
        </div>
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            お困りですか?
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--muted)',
              marginTop: 2,
            }}
          >
            サポートが必要な場合はお気軽にご連絡ください。
          </div>
        </div>
      </div>
      <button type="button" onClick={onHelp} style={outlineBtn}>
        📖 ヘルプセンター
      </button>
      <button type="button" onClick={onContact} style={outlineBtn}>
        ✉️ お問い合わせ
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(184,149,100,0.18)',
            color: '#7a5e3a',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <ClockIcon />
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>
            サポート対応時間
          </div>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            平日 10:00 - 18:00
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
            (土日祝日を除く)
          </div>
        </div>
      </div>
    </div>
  );
}

const outlineBtn: React.CSSProperties = {
  background: 'var(--paper)',
  border: '1px solid var(--line-2)',
  borderRadius: 10,
  padding: '9px 16px',
  fontSize: 12.5,
  color: 'var(--ink)',
  fontFamily: 'inherit',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

/* ─── Drawer (slides in from right) ─────────────────── */

function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20,15,10,0.40)',
          zIndex: 200,
          animation: 'srkScrimIn .2s ease',
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(440px, 92vw)',
          background: 'var(--bg-soft)',
          borderLeft: '1px solid var(--line-2)',
          boxShadow: '-20px 0 50px -20px rgba(20,15,10,0.20)',
          zIndex: 201,
          overflowY: 'auto',
          animation: 'srkDrawerIn .28s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: 'var(--bg-soft)',
            padding: '22px 26px 16px',
            borderBottom: '1px solid var(--line-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--ink)',
              fontFamily: 'var(--serif)',
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            style={{
              all: 'unset',
              cursor: 'pointer',
              padding: 6,
              color: 'var(--muted)',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '22px 26px' }}>{children}</div>
      </aside>

      <style jsx>{`
        @keyframes srkScrimIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes srkDrawerIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

/* ─── Settings Panel ───────────────────────────────── */

function SettingsPanel({
  settings,
  setSettings,
  onSave,
}: {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  onSave: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <DrawerSection title="営業情報">
        <DrawerRow label="営業時間" value="10:00 - 20:00" />
        <DrawerRow label="定休日" value="水曜日" />
        <DrawerRow label="スタッフ数" value="4 名" />
      </DrawerSection>

      <DrawerSection title="通知">
        <ToggleRow
          label="予約通知"
          desc="新規予約があったときにメール通知"
          on={settings.notif}
          onChange={(v) => setSettings((s) => ({ ...s, notif: v }))}
        />
        <ToggleRow
          label="リマインダーメール"
          desc="前日に顧客へリマインドを自動送信"
          on={settings.reminder}
          onChange={(v) => setSettings((s) => ({ ...s, reminder: v }))}
        />
        <ToggleRow
          label="DMキャンペーン"
          desc="月次のDM配信レポートを受信"
          on={settings.dm}
          onChange={(v) => setSettings((s) => ({ ...s, dm: v }))}
        />
      </DrawerSection>

      <DrawerSection title="その他">
        <ToggleRow
          label="ダークモード"
          desc="ダッシュボード全体をダークテーマに"
          on={settings.dark}
          onChange={(v) => setSettings((s) => ({ ...s, dark: v }))}
        />
      </DrawerSection>

      <button
        type="button"
        onClick={onSave}
        style={{
          background: 'var(--ink)',
          color: '#f0e6d2',
          border: 0,
          padding: '12px 18px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        変更を保存
      </button>
    </div>
  );
}

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          fontWeight: 500,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 12,
          border: '1px solid var(--line)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DrawerRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '12px 14px',
        borderBottom: '1px solid var(--line)',
        fontSize: 12.5,
      }}
    >
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>
          {label}
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: 'var(--muted)',
            marginTop: 2,
          }}
        >
          {desc}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
        aria-pressed={on}
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          padding: 2,
          background: on ? 'var(--gold)' : 'var(--line-2)',
          border: 0,
          cursor: 'pointer',
          transition: 'background .15s',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: 'block',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            transform: on ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform .15s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}

/* ─── Icons ─────────────────────────────────────────── */

function CogIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1v-6H3z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 6" />
    </svg>
  );
}
