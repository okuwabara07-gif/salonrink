'use client';

import React from 'react';
import { Icon } from './Icon';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onToggleSide?: () => void;
  unread?: number;
  plan?: string;
  onNewBooking?: () => void;
}

export function TopHeader({
  title,
  subtitle,
  onToggleSide,
  unread = 2,
  plan = 'FREE',
  onNewBooking,
}: TopHeaderProps) {
  // Render date in client to avoid hydration mismatch from SSR
  const [dateStr, setDateStr] = React.useState('');
  React.useEffect(() => {
    const t = new Date();
    const wd = ['日', '月', '火', '水', '木', '金', '土'][t.getDay()];
    setDateStr(`${t.getFullYear()}年 ${t.getMonth() + 1}月 ${t.getDate()}日（${wd}）`);
  }, []);

  return (
    <header className="srk-top">
      <div className="srk-top-l">
        <button className="srk-iconbtn ghost" onClick={onToggleSide} title="メニュー" type="button">
          <Icon name="grid" size={16} />
        </button>
        <div className="srk-greet">
          <div className="srk-greet-title">{title}</div>
          <div className="srk-greet-sub">
            {subtitle && <span>{subtitle}</span>}
            {subtitle && dateStr && <span className="srk-sep">·</span>}
            {dateStr && <span>{dateStr}</span>}
          </div>
        </div>
      </div>
      <div className="srk-top-r">
        <div className="srk-search">
          <Icon name="search" size={15} />
          <input placeholder="顧客・予約を検索" />
          <span className="kbd">⌘K</span>
        </div>
        <button className="srk-plan" type="button">
          <span className="srk-plan-dot" />
          プラン <b>{plan}</b>
        </button>
        <button className="srk-iconbtn" title="通知" type="button">
          <Icon name="bell" size={16} />
          {unread > 0 && <span className="srk-badge">{unread}</span>}
        </button>
        <button className="srk-cta" onClick={onNewBooking} type="button">
          <Icon name="plus" size={14} />
          <span>新規予約</span>
        </button>
      </div>
    </header>
  );
}
