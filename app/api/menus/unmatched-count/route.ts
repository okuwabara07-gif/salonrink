/**
 * GET /api/menus/unmatched-count
 *
 * 当月の HPB 予約のうち、salon_menus に存在しないメニュー件数を返す
 * - menu_name が null/空 OR salon_menus.name に存在しない
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'

interface UnmatchedCountData {
  count: number
}

type SalonMenuName = { name: string }
type HpbMenuName = { menu_name: string | null }

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Step 1: 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: salon 解決
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError) {
      console.error('[GET /api/menus/unmatched-count] Salon lookup error:', salonError.message)
      return errorResponse('Salon lookup failed', 500)
    }

    if (!salon) {
      return errorResponse('Salon not found', 403)
    }

    const salonId = salon.id as string

    // Step 3: JST 当月の開始/終了を計算
    const now = new Date()
    const jstDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
    const year = parseInt(jstDateStr.slice(0, 4), 10)
    const month = parseInt(jstDateStr.slice(5, 7), 10)
    const monthStart = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00+09:00`)
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const monthEnd = new Date(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00+09:00`)

    // Step 4: salon_menus.name セット取得
    const { data: menus, error: menuError } = await supabase
      .from('salon_menus')
      .select('name')
      .eq('salon_id', salonId)

    if (menuError) {
      console.error('[GET /api/menus/unmatched-count] Menu lookup error:', menuError.message)
      return errorResponse('Menu lookup failed', 500)
    }

    const menuNameSet = new Set((menus || []).map((m: SalonMenuName) => m.name))

    // Step 5: 当月の hpb_reservations(status=confirmed)取得
    const { data: reservations, error: resError } = await supabase
      .from('hpb_reservations')
      .select('menu_name')
      .eq('salon_id', salonId)
      .eq('status', 'confirmed')
      .gte('start_time', monthStart.toISOString())
      .lt('start_time', monthEnd.toISOString())

    if (resError) {
      console.error('[GET /api/menus/unmatched-count] Reservation lookup error:', resError.message)
      return errorResponse('Reservation lookup failed', 500)
    }

    // Step 6: 未マッチ件数を計算
    const unmatchedCount = (reservations || []).filter((r: HpbMenuName) => {
      if (!r.menu_name) return true
      return !menuNameSet.has(r.menu_name)
    }).length

    const responseData: UnmatchedCountData = { count: unmatchedCount }
    return successResponse(responseData)
  } catch (error) {
    console.error(
      '[GET /api/menus/unmatched-count] Unexpected error:',
      error instanceof Error ? error.stack : error
    )
    return errorResponse('Internal server error', 500)
  }
}
