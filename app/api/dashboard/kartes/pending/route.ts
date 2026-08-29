/**
 * GET /api/dashboard/kartes/pending
 *
 * 承認待ちカルテ一覧を取得
 * - 認証チェック
 * - salon 特定
 * - kartes テーブルから status='pending' のレコードを取得
 * - customers との LEFT JOIN で顧客名を含める
 * - 最新順(created_at DESC)で最大50件まで返す
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'

interface CustomerData {
  name: string | null
  line_display_name: string | null
  kana: string | null
}

interface KarteRow {
  id: string
  customer_id: string | null
  visit_date: string | null
  created_at: string
  ai_summary: Record<string, unknown> | null
  customers: CustomerData | null
}

interface KarteListItem {
  id: string
  customer_id: string | null
  customer_name: string
  visit_date: string | null
  created_at: string
  ai_summary: Record<string, unknown> | null
}

interface PendingKartesData {
  data: KarteListItem[]
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: 認証チェック
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[GET /api/dashboard/kartes/pending] Auth error:', authError?.message)
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: salon 特定
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError) {
      console.error('[GET /api/dashboard/kartes/pending] Salon lookup error:', salonError.message)
      return errorResponse('Salon lookup failed', 500)
    }

    if (!salon) {
      return errorResponse('Salon not found', 403)
    }

    const salonId = salon.id as string

    // Step 3: 承認待ちカルテを取得（customers リレーション含む）
    const { data: kartes, error: kartesError } = await supabase
      .from('kartes')
      .select(`
        id,
        customer_id,
        visit_date,
        created_at,
        ai_summary,
        customers(name, line_display_name, kana)
      `)
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50) as { data: KarteRow[] | null; error: any }

    if (kartesError) {
      console.error('[GET /api/dashboard/kartes/pending] Kartes fetch error:', kartesError.message)
      return errorResponse('Failed to fetch pending kartes', 500)
    }

    // Step 4: レスポンス整形
    const items: KarteListItem[] = (kartes || []).map((k: KarteRow) => {
      const customerName =
        (k.customers?.name as string) ||
        (k.customers?.line_display_name as string) ||
        '名前未登録'

      return {
        id: k.id,
        customer_id: k.customer_id,
        customer_name: customerName,
        visit_date: k.visit_date,
        created_at: k.created_at,
        ai_summary: k.ai_summary,
      }
    })

    return successResponse<PendingKartesData>({ data: items })
  } catch (error) {
    console.error(
      '[GET /api/dashboard/kartes/pending] Unexpected error:',
      error instanceof Error ? error.stack : error
    )
    return errorResponse('Internal server error', 500)
  }
}
