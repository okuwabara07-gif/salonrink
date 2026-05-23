'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, TopHeader } from '@/components/srk';

interface TitleEntry {
  title: string;
  sub: string;
}

const TITLE_MAP: Record<string, TitleEntry> = {
  '/demo': { title: 'デモ', sub: 'SalonRink 体験版' },
  '/demo/booking': { title: '予約管理', sub: 'タイムテーブル / 予約管理' },
  '/demo/customers': { title: '顧客一覧', sub: '顧客データベース' },
  '/demo/cons': { title: 'AI コンシェルジュ', sub: '自動カウンセリング' },
  '/demo/settings': { title: 'メニュー設定', sub: '施術メニュー管理' },
};

function resolveTitle(pathname: string): TitleEntry {
  if (TITLE_MAP[pathname]) return TITLE_MAP[pathname];
  return { title: 'SalonRink デモ', sub: 'デモ体験版' };
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { title, sub } = resolveTitle(pathname);

  useEffect(() => {
    document.body.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-density', 'regular');
  }, []);

  return (
    <div className="srk-app">
      <Sidebar collapsed={collapsed} />
      <main className="srk-main">
        <TopHeader
          title={title}
          subtitle={sub}
          plan="DEMO"
          unread={0}
          onToggleSide={() => setCollapsed((c) => !c)}
          onNewBooking={() => {}}
        />
        {children}
      </main>
    </div>
  );
}
