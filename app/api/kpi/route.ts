/**
 * GET /api/kpi?year=2026&month=5
 *
 * LIFF ダッシュボード用 KPI エンドポイント
 * - 認証チェック → salon 解決 → lib/kpi.ts の関数呼び出し
 * - レスポンス形式: { data: {...}, error: null } (Sprint 1 統一形式)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getMonthlyRevenue,
  getNewBookingsCount,
  getRepeatRate,
  type KpiTrend,
} from '@/lib/kpi'
import { successResponse, errorResponse } from '@/lib/api/response'

interface KpiResponseData {
  revenue: KpiTrend
  newBookings: KpiTrend
  repeatRate: {
    current: number
    unit: string
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: クエリパラメータ取得
    const searchParams = request.nextUrl.searchParams
    const yearStr = searchParams.get('year')
    const monthStr = searchParams.get('month')

    if (!yearStr || !monthStr) {
      return errorResponse('Missing year or month parameter', 400)
    }

    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return errorResponse('Invalid year or month value', 400)
    }

    // Step 2: 認証確認
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // Step 3: salon 特定 + 所有権確認
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError) {
      console.error('[GET /api/kpi] Salon lookup error:', salonError.message)
      return errorResponse('Salon lookup failed', 500)
    }

    if (!salon) {
      return errorResponse('Salon not found', 403)
    }

    const salonId = salon.id as string

    // Step 4: KPI 集計（並列実行）
    const [revenue, newBookings, repeatRate] = await Promise.all([
      getMonthlyRevenue(salonId, year, month),
      getNewBookingsCount(salonId, year, month),
      getRepeatRate(salonId),
    ])

    // Step 5: レスポンス構築
    const responseData: KpiResponseData = {
      revenue,
      newBookings,
      repeatRate: {
        current: repeatRate,
        unit: '%',
      },
    }

    return successResponse(responseData)
  } catch (error) {
    console.error('[GET /api/kpi] Unexpected error:', error instanceof Error ? error.stack : error)
    return errorResponse('Internal server error', 500)
  }
}
