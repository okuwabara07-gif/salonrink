'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Sidebar, TopHeader } from '@/components/srk';
import NewReservationModal from '@/components/dashboard/NewReservationModal';
import { createClient } from '@/lib/supabase/client';

const LiffAutoLogin = dynamic(() => import('./_components/LiffAutoLogin').then(m => ({ default: m.LiffAutoLogin })), {
  ssr: false,
});

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
  '/dashboard':                 { title: 'ダッシュボード', sub: 'カラー・白髪施術の記憶と提案' },
  '/dashboard/booking':         { title: '予約・スケジュール',                    sub: '来店予定・施術時間管理' },
  '/dashboard/customers':       { title: '顧客カルテ',                            sub: 'カラー履歴・好み・次提案' },
  '/dashboard/messages':        { title: 'LINE配信',                              sub: 'カラー褪色タイミング・リピート促進' },
  '/dashboard/integrations':    { title: '外部連携',                              sub: 'LINE · HPB · 他ツール連携' },
  '/dashboard/more':            { title: 'その他',                                sub: '設定 · サポート · アカウント' },
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
      { id: 'cust:A様', src: '/sample-photos/1.png' },
      { id: 'cust:B様', src: '/sample-photos/2.png' },
      { id: 'cust:C様', src: '/sample-photos/3.png' },
      { id: 'cust:D様', src: '/sample-photos/4.png' },
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
  const [plan, setPlan] = useState('FREE');
  const { title, sub } = resolveTitle(pathname);

  // 他ページの「+ 新規予約」ボタンからの起動イベント受信
  useEffect(() => {
    const handler = () => setResModalOpen(true);
    window.addEventListener('srk:open-new-reservation', handler as EventListener);
    return () => window.removeEventListener('srk:open-new-reservation', handler as EventListener);
  }, []);

  // サロンのプラン名を取得して TopHeader に表示
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: salon } = await supabase
          .from('salons')
          .select('plan')
          .eq('owner_user_id', user.id)
          .maybeSingle();
        if (cancelled) return;
        if (salon?.plan) setPlan(String(salon.plan).toUpperCase());
      } catch (e) {
        console.error('layout plan fetch:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
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
          plan={plan}
          unread={0}
          onToggleSide={() => setCollapsed((c) => !c)}
          onNewBooking={() => setResModalOpen(true)}
        />
        <Suspense fallback={null}>
          <LiffAutoLogin />
        </Suspense>
        {children}
      </main>
      <NewReservationModal
        open={resModalOpen}
        onClose={() => setResModalOpen(false)}
        onSubmit={async (draft) => {
          try {
            const supabase = createClient();
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
              alert('ログインが必要です');
              return;
            }

            const { data: salon } = await supabase
              .from('salons')
              .select('id')
              .eq('owner_user_id', user.id)
              .maybeSingle();
            if (!salon) {
              alert('サロン情報が見つかりません');
              return;
            }

            // 日時を組み立て(date: YYYY-MM-DD, startTime: HH:MM)
            if (!draft.date || !draft.startTime) {
              alert('日付と開始時間を選択してください');
              return;
            }
            const datetimeIso = new Date(
              `${draft.date}T${draft.startTime}:00`
            ).toISOString();

            // メニュー名を結合
            const menuStr = (draft.menus || []).map((m) => m.name).join(' + ');

            // 新規顧客なら customers に作成して customer_id を取得
            let customerId: string | null = draft.customerId || null;
            if (!customerId && draft.isNewCustomer && draft.customerName) {
              const { data: newCust } = await supabase
                .from('customers')
                .insert({
                  salon_id: salon.id,
                  name: draft.customerName,
                  phone: draft.customerPhone || null,
                  visit_count: 0,
                })
                .select('id')
                .single();
              if (newCust) customerId = newCust.id;
            }

            // 予約を保存
            const { error: resErr } = await supabase.from('reservations').insert({
              salon_id: salon.id,
              customer_id: customerId,
              customer_name: draft.customerName || '名前未登録',
              datetime: datetimeIso,
              menu: menuStr || 'メニュー未設定',
              status: 'confirmed',
              source: 'manual',
            });

            if (resErr) {
              console.error('予約保存エラー:', resErr);
              alert(`予約の保存に失敗しました: ${resErr.message}`);
              return;
            }

            alert('予約を作成しました');
            // 各ページの一覧に反映するためリロード
            window.location.reload();
          } catch (e) {
            console.error('予約作成エラー:', e);
            alert('予約の作成中にエラーが発生しました');
          }
        }}
      />
    </div>
  );
}
