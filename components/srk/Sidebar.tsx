'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icon';
import { tabs } from '@/components/tabs';

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
            >
              <Icon name={tab.icon as IconName} size={18} />
              {!collapsed && <span>{tab.label}</span>}
              {active && <span className="srk-nav-indicator" />}
            </Link>
          );
        })}
      </nav>

      <div className="srk-side-foot">
        {!collapsed && (
          <div className="srk-shop">
            <div className="srk-shop-name">{shopName}</div>
            <div className="srk-shop-user">{userName}</div>
          </div>
        )}
        <Link href="/api/auth/signout" className="srk-logout">
          <Icon name="arrow_r" size={14} />
          {!collapsed && <span>ログアウト</span>}
        </Link>
      </div>
    </aside>
  );
}
