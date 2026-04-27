export interface NavTab {
  id: string
  icon: string
  label: string
  path: string
}

export const tabs: NavTab[] = [
  { id: 'home', icon: '🏠', label: 'ホーム', path: '/dashboard' },
  { id: 'booking', icon: '📅', label: '予約', path: '/dashboard/booking' },
  { id: 'customers', icon: '👥', label: '顧客', path: '/dashboard/customers' },
  { id: 'integrations', icon: '🔗', label: '連携', path: '/dashboard/integrations' },
  { id: 'more', icon: '⋯', label: 'その他', path: '/dashboard/more' },
]
