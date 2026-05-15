'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icon';
import { tabs, type NavTab } from '@/components/tabs';

interface SidebarProps {
  collapsed?: boolean;
  shopName?: string;
  userName?: string;
}

export function Sidebar({
  collapsed = false,
  shopName = 'キレイ 鶴見店',
  userName = 'テスト太郎 さん',
}: SidebarProps) {
  const pathname = usePathname();

  // Match active tab: exact /dashboard for home, then prefix-match for sub-routes
  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Avatar initial (first non-space char of shop name)
  const avatarChar = shopName.replace(/\s/g, '').charAt(0) || 'S';

  return (
    <aside className="srk-side" data-collapsed={collapsed ? '1' : '0'}>
      <div className="srk-brand">
        <div className="srk-mark">
          <svg viewBox="0 0 32 32" width="22" height="22">
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
            <path d="M10 22 Q16 6 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="16" cy="11.5" r="1.4" fill="currentColor" />
          </svg>
        </div>
        {!collapsed && (
          <div className="srk-brand-text">
            <div className="srk-brand-name">SalonRink</div>
            <div className="srk-brand-sub">サロン管理</div>
          </div>
        )}
      </div>

      <nav className="srk-nav">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={`srk-nav-item ${active ? 'is-active' : ''}`}
              title={collapsed ? tab.label : undefined}
              style={{ position: 'relative' }}
            >
              <NavIcon name={tab.icon as IconName} />
              {!collapsed && (
                <span style={{ flex: 1, minWidth: 0 }}>{tab.label}</span>
              )}
              {!collapsed && tab.badge && <NavBadgeView badge={tab.badge} />}
              {active && <span className="srk-nav-indicator" />}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div
          style={{
            marginTop: 'auto',
            padding: '12px 14px 6px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 6px',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, oklch(0.86 0.06 80), oklch(0.72 0.07 60))',
                color: '#1a1612',
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--serif)',
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {avatarChar}
            </div>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'rgba(240,230,210,0.95)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {shopName}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: 'rgba(217,205,184,0.55)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="srk-side-foot">
        <Link href="/api/auth/signout" className="srk-logout">
          <Icon name="arrow_r" size={14} />
          {!collapsed && <span>ログアウト</span>}
        </Link>
      </div>
    </aside>
  );
}

/* ─── Nav Icon with fallback for new icon names ─────────────── */

function NavIcon({ name }: { name: string }) {
  // Custom inline SVGs for new icons not in Icon component
  if (name === 'sparkle' || name === 'spark') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3 L13.5 9 L20 10.5 L13.5 12 L12 18 L10.5 12 L4 10.5 L10.5 9 Z" />
        <path d="M18 16 L18.6 18 L20.5 18.6 L18.6 19.2 L18 21 L17.4 19.2 L15.5 18.6 L17.4 18 Z" />
      </svg>
    );
  }
  if (name === 'bell') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    );
  }
  if (name === 'bag') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 7h12l-1 13H7L6 7z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }
  // Fallback to standard Icon component
  return <Icon name={name as IconName} size={18} />;
}

/* ─── Badge / Dot / Tag rendering ───────────────────────────── */

function NavBadgeView({ badge }: { badge: NavTab['badge'] }) {
  if (!badge) return null;

  if (badge.kind === 'badge') {
    // Solid gold pill (FREE, etc)
    return (
      <span
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 4,
          background: 'oklch(0.32 0.04 75)',
          color: 'oklch(0.86 0.06 80)',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
      >
        {badge.text}
      </span>
    );
  }
  if (badge.kind === 'dot') {
    // Gold round counter (3 unread, etc)
    return (
      <span
        style={{
          minWidth: 18,
          height: 18,
          padding: '0 5px',
          borderRadius: 999,
          background: 'oklch(0.78 0.085 75)',
          color: 'oklch(0.22 0.012 60)',
          fontSize: 10.5,
          fontWeight: 700,
          display: 'inline-grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        {badge.text}
      </span>
    );
  }
  // tag (gray Soon)
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: 4,
        background: 'oklch(0.3 0.014 60)',
        color: 'rgba(217,205,184,0.6)',
        letterSpacing: '0.04em',
        flexShrink: 0,
      }}
    >
      {badge.text}
    </span>
  );
}
