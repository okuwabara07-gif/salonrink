import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 未認証ユーザーは /login へリダイレクト
  if (!user) {
    redirect('/login')
  }

  // ADMIN_EMAILS の解析とチェック
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  const isAdmin = user.email && adminEmails.includes(user.email)

  // 非管理者は /403 へリダイレクト
  if (!isAdmin) {
    redirect('/403')
  }

  return <>{children}</>
}
