/**
 * Sidebar / TabBar navigation items for the SalonRink dashboard.
 *
 * 既存の5タブ(home/booking/customers/integrations/more)から
 * 新デザインの6タブ(home/schedule/customers/messages/link/other)へ更新。
 *
 * 注: ルートパスは既存と同じ(/dashboard/booking, /dashboard/integrations, ...)
 * を維持しているため、表示ラベルとアイコンのみが変わる。
 */

export interface NavTab {
  id: string;
  icon: string;   // Icon name (see components/srk/Icon.tsx)
  label: string;
  path: string;
}

export const tabs: NavTab[] = [
  { id: 'home',      icon: 'home',     label: 'ホーム',  path: '/dashboard' },
  { id: 'schedule',  icon: 'calendar', label: '予約',    path: '/dashboard/booking' },
  { id: 'customers', icon: 'users',    label: '顧客',    path: '/dashboard/customers' },
  { id: 'messages',  icon: 'msg',      label: 'DM配信',  path: '/dashboard/messages' },
  { id: 'link',      icon: 'link',     label: '連携',    path: '/dashboard/integrations' },
  { id: 'other',     icon: 'grid',     label: 'その他',  path: '/dashboard/more' },
];
