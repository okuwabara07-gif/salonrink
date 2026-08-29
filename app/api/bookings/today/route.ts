/**
 * GET /api/bookings/today
 *
 * 今日の予約を取得
 * - hpb_reservations から today の予約を取得
 * - customer_name, price, source を含む
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'

interface BookingToday {
  id: string
  time: string
  start_time: string
  end_time: string
  customer_name: string
  menu_name: string | null
  price: number | null
  source: string
}

type SalonMenuRow = {
  name: string
  price: number
  duration: number | null
}

type HpbReservationRow = {
  id: string
  start_time: string | null
  customer_name: string | null
  menu_name: string | null
  source: string | null
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: 認証確認
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: salon 特定
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError) {
      console.error('[GET /api/bookings/today] Salon lookup error:', salonError.message)
      return errorResponse('Salon lookup failed', 500)
    }

    if (!salon) {
      return errorResponse('Salon not found', 403)
    }

    const salonId = salon.id as string

    // Step 3: メニュー価格・期間マップ作成
    const { data: menus, error: menuError } = await supabase
      .from('salon_menus')
      .select('name, price, duration')
      .eq('salon_id', salonId)

    if (menuError) {
      console.error('[GET /api/bookings/today] Menu lookup error:', menuError.message)
      return errorResponse('Menu lookup failed', 500)
    }

    const priceMap = new Map((menus || []).map((m: SalonMenuRow) => [m.name, m.price]))
    const durationMap = new Map((menus || []).map((m: SalonMenuRow) => [m.name, m.duration || 60]))

    // Step 4: 今日の予約を取得（JST 基準）
    const now = new Date()
    const jstDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
    const todayJstStart = new Date(`${jstDateStr}T00:00:00+09:00`)
    const tomorrowJstStart = new Date(todayJstStart.getTime() + 24 * 60 * 60 * 1000)

    const { data: bookings, error: bookingsError } = await supabase
      .from('hpb_reservations')
      .select('id, start_time, customer_name, menu_name, source')
      .eq('salon_id', salonId)
      .eq('status', 'confirmed')
      .gte('start_time', todayJstStart.toISOString())
      .lt('start_time', tomorrowJstStart.toISOString())
      .order('start_time', { ascending: true })

    if (bookingsError) {
      console.error('[GET /api/bookings/today] Bookings fetch error:', bookingsError.message)
      return errorResponse('Failed to fetch bookings', 500)
    }

    // Step 5: レスポンス整形
    const result: BookingToday[] = (bookings || []).map((b: HpbReservationRow) => {
      const startTime = b.start_time ? new Date(b.start_time) : new Date()
      const timeStr = startTime.toLocaleTimeString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      const duration = durationMap.get(b.menu_name ?? '') ?? 60
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

      return {
        id: b.id,
        time: timeStr,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        customer_name: b.customer_name || 'ゲスト',
        menu_name: b.menu_name || null,
        price: priceMap.get(b.menu_name ?? '') ?? null,
        source: b.source || 'unknown',
      }
    })

    return successResponse(result)
  } catch (error) {
    console.error('[GET /api/bookings/today] Unexpected error:', error instanceof Error ? error.stack : error)
    return errorResponse('Internal server error', 500)
  }
}
