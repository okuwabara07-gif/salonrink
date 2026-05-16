'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, TopHeader } from '@/components/srk';
import NewReservationModal from '@/components/dashboard/NewReservationModal';

/**
 * /dashboard 配下の全画面に共通のクロム(サイドバー + トップヘッダー)。
 *
 * Sidebar / TopHeader は client component なのでこの layout 自体も client。
 * ページ本体(children)は server / client どちらでも OK。
 */

interface TitleEntry {
  title: string;
  sub: string;
}

const TITLE_MAP: Record<string, TitleEntry> = {
  '/dashboard':                 { title: 'ホーム', sub: '本日のサロン状況' },
  '/dashboard/booking':         { title: '予約スケジュール',                     sub: 'タイムテーブル / 予約管理' },
  '/dashboard/customers':       { title: '顧客一覧',                             sub: '顧客データベース' },
  '/dashboard/messages':        { title: 'DM配信',                                sub: '自動リマインダー · 来店促進' },
  '/dashboard/integrations':    { title: '連携サービス',                         sub: '外部システムとの連携' },
  '/dashboard/more':            { title: 'その他',                                sub: '設定 · ヘルプ · お知らせ' },
};

function resolveTitle(pathname: string): TitleEntry {
  // exact match
  if (TITLE_MAP[pathname]) return TITLE_MAP[pathname];
  // customer detail page (/dashboard/customers/[id])
  if (pathname.startsWith('/dashboard/customers/')) {
    return { title: 'カルテ', sub: '施術履歴 · 顧客カルテ' };
  }
  // fallback
  return { title: 'SalonRink', sub: 'サロン管理' };
}

/* ─── Demo seed: sample customer photos on first run ─────────────────── */
/* キレイ鶴見店をデモとして見せるための初回シード。本番運用で要らなくなったら
   NEXT_PUBLIC_SALONRINK_DEMO=0 を環境変数に入れる。 */
function useSamplePhotoSeed() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SALONRINK_DEMO !== '1') return; // 本番無効化: 明示的に '1' の時のみシード
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('srk-photos-seeded') === '1') return;

    const seeds = [
      { id: 'cust:青山 真理', src: '/sample-photos/1.png' },
      { id: 'cust:柳田 友香', src: '/sample-photos/2.png' },
      { id: 'cust:浅野 節子', src: '/sample-photos/3.png' },
      { id: 'cust:矢野 玲子', src: '/sample-photos/4.png' },
    ];

    Promise.all(
      seeds.map((s) =>
        fetch(s.src)
          .then((r) => r.blob())
          .then(
            (b) =>
              new Promise<void>((res) => {
                const fr = new FileReader();
                fr.onload = () => {
                  if (typeof fr.result === 'string') {
                    window.__srkPhotoStore?.set(s.id, fr.result);
                  }
                  res();
                };
                fr.readAsDataURL(b);
              })
          )
      )
    )
      .then(() => {
        localStorage.setItem('srk-photos-seeded', '1');
      })
      .catch(() => {});
  }, []);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [resModalOpen, setResModalOpen] = useState(false);
  const { title, sub } = resolveTitle(pathname);

  // 他ページの「+ 新規予約」ボタンからの起動イベント受信
  useEffect(() => {
    const handler = () => setResModalOpen(true);
    window.addEventListener('srk:open-new-reservation', handler as EventListener);
    return () => window.removeEventListener('srk:open-new-reservation', handler as EventListener);
  }, []);

  useSamplePhotoSeed();

  // Apply theme/density to body (matches prototype TWEAK_DEFAULTS)
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
          onToggleSide={() => setCollapsed((c) => !c)}
          onNewBooking={() => setResModalOpen(true)}
        />
        {children}
      </main>
      <NewReservationModal
        open={resModalOpen}
        onClose={() => setResModalOpen(false)}
        onSubmit={async (draft) => {
          console.log('新規予約:', draft);
          alert('予約を作成しました(モックです。Supabase 接続は後日)');
        }}
      />
    </div>
  );
}
