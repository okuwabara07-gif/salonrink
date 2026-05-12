/**
 * Admin Dashboard Data Functions
 * Server-side data fetching for admin analytics
 */

import { createAdminClient } from '@/lib/supabase/admin'

export interface TodayActivity {
  newLeads: number
  hotLeads: number
  emailsSent: number
  blogArticles: number
}

export interface HotLead {
  id: string
  contact_name: string
  email: string
  salon_name?: string
  score: number
  created_at: string
  last_emailed_at?: string
}

export interface ScoreDistribution {
  gradeA: number
  gradeB: number
  gradeC: number
  gradeD: number
  total: number
}

/**
 * 今日のアクティビティサマリーを取得
 * - 新規リード(今日)
 * - ホットリード(スコア70+、今日)
 * - メール送信(今日)
 * - ブログ記事(今日公開)
 */
export async function getTodayActivity(): Promise<TodayActivity> {
  try {
    const admin = createAdminClient()
    const today = new Date().toISOString().split('T')[0]
    const todayStart = `${today}T00:00:00Z`
    const todayEnd = `${today}T23:59:59Z`

    // 1. 新規リード(今日)
    const { data: newLeadsData, error: newLeadsError } = await admin
      .from('lp_leads')
      .select('id', { count: 'exact' })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)

    const newLeads = newLeadsError ? 0 : (newLeadsData?.length || 0)

    // 2. ホットリード(スコア70+、今日)
    const { data: hotLeadsData, error: hotLeadsError } = await admin
      .from('lp_leads')
      .select('id', { count: 'exact' })
      .gte('score', 70)
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)

    const hotLeads = hotLeadsError ? 0 : (hotLeadsData?.length || 0)

    // 3. メール送信(今日)
    const { data: emailEventsData, error: emailEventsError } = await admin
      .from('lead_events')
      .select('id', { count: 'exact' })
      .eq('event_type', 'email_sent')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)

    const emailsSent = emailEventsError ? 0 : (emailEventsData?.length || 0)

    // 4. ブログ記事(今日公開)
    const { data: blogData, error: blogError } = await admin
      .from('blog_articles')
      .select('id', { count: 'exact' })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)

    const blogArticles = blogError ? 0 : (blogData?.length || 0)

    return {
      newLeads,
      hotLeads,
      emailsSent,
      blogArticles,
    }
  } catch (error) {
    console.error('[getTodayActivity] Error:', error)
    return {
      newLeads: 0,
      hotLeads: 0,
      emailsSent: 0,
      blogArticles: 0,
    }
  }
}

/**
 * ホットリード一覧を取得
 * @param daysAgo - 過去N日以内(デフォルト30日)
 * @returns スコア70+ のリード、作成日降順
 */
export async function getHotLeads(daysAgo: number = 30): Promise<HotLead[]> {
  try {
    const admin = createAdminClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

    const { data, error } = await admin
      .from('lp_leads')
      .select('id, contact_name, email, salon_name, score, created_at, last_emailed_at')
      .gte('score', 70)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[getHotLeads] Query error:', error)
      return []
    }

    return (data || []) as HotLead[]
  } catch (error) {
    console.error('[getHotLeads] Error:', error)
    return []
  }
}

/**
 * スコア分布(A/B/C/D 構成)を取得
 * @returns 各グレード別のリード数
 */
export async function getScoreDistribution(): Promise<ScoreDistribution> {
  try {
    const admin = createAdminClient()

    // 全リードを取得(スコアのみ)
    const { data, error } = await admin.from('lp_leads').select('score')

    if (error) {
      console.error('[getScoreDistribution] Query error:', error)
      return { gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0, total: 0 }
    }

    const leads = data || []
    const total = leads.length

    // スコアをグレードに分類
    // A: 80+ (ホット)
    // B: 40-79 (育成中)
    // C: 0-39 (コールド)
    // D: 特殊(opt-out等)
    const gradeA = leads.filter((l) => l.score >= 80).length
    const gradeB = leads.filter((l) => l.score >= 40 && l.score < 80).length
    const gradeC = leads.filter((l) => l.score >= 0 && l.score < 40).length
    const gradeD = leads.filter((l) => l.score < 0).length

    return {
      gradeA,
      gradeB,
      gradeC,
      gradeD,
      total,
    }
  } catch (error) {
    console.error('[getScoreDistribution] Error:', error)
    return { gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0, total: 0 }
  }
}
