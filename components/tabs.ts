/**
 * Sidebar / TabBar navigation items for the SalonRink dashboard.
 *
 * Phase 8 で6項目 → 9項目に拡張。
 * - 新規追加: プラン (FREE バッジ) / お知らせ (件数ドット) / 店販EC (Soon タグ)
 * - 「その他」は管理系のみに整理(設定/アカウント/ログアウト)
 *
 * 注: ルートパスは既存と同じ(/dashboard/booking, /dashboard/integrations, ...)
 * を維持。新規ページ用に /dashboard/plan, /dashboard/news, /dashboard/ec を追加。
 */

export type NavBadgeKind = 'badge' | 'dot' | 'tag';

export interface NavBadge {
  kind: NavBadgeKind;
  text: string;
}

export interface NavTab {
  id: string;
  icon: string;   // Icon name (see components/srk/Icon.tsx)
  label: string;
  path: string;
  badge?: NavBadge;
}

export const tabs: NavTab[] = [
  { id: 'home',      icon: 'home',     label: 'ホーム',   path: '/dashboard' },
  { id: 'schedule',  icon: 'calendar', label: '予約',     path: '/dashboard/booking' },
  { id: 'customers', icon: 'users',    label: '顧客',     path: '/dashboard/customers' },
  { id: 'messages',  icon: 'msg',      label: 'DM配信',   path: '/dashboard/messages' },
  { id: 'link',      icon: 'link',     label: '連携',     path: '/dashboard/integrations' },
  {
    id: 'plan',
    icon: 'sparkle',
    label: 'プラン',
    path: '/dashboard/plan',
    badge: { kind: 'badge', text: 'FREE' },
  },
  {
    id: 'news',
    icon: 'bell',
    label: 'お知らせ',
    path: '/dashboard/news',
    badge: { kind: 'dot', text: '3' },
  },
  {
    id: 'ec',
    icon: 'bag',
    label: '店販EC',
    path: '/dashboard/ec',
    badge: { kind: 'tag', text: 'Soon' },
  },
  { id: 'other',     icon: 'grid',     label: 'その他',   path: '/dashboard/more' },
];
