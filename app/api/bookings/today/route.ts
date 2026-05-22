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
  customer_name: string
  menu_name: string | null
  price: number | null
  source: string
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

    // Step 3: 今日の予約を取得
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: bookings, error: bookingsError } = await supabase
      .from('hpb_reservations')
      .select('id, start_time, customer_name, menu_name, price, source')
      .eq('salon_id', salonId)
      .eq('status', 'confirmed')
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .order('start_time', { ascending: true })

    if (bookingsError) {
      console.error('[GET /api/bookings/today] Bookings fetch error:', bookingsError.message)
      return errorResponse('Failed to fetch bookings', 500)
    }

    // Step 4: レスポンス整形
    type BookingRow = {
      id: string
      start_time: string | null
      customer_name: string | null
      menu_name: string | null
      price: number | null
      source: string | null
    }

    const result: BookingToday[] = (bookings || []).map((b: BookingRow) => {
      const startTime = b.start_time ? new Date(b.start_time) : new Date()
      const timeStr = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`

      return {
        id: b.id,
        time: timeStr,
        customer_name: b.customer_name || 'ゲスト',
        menu_name: b.menu_name || null,
        price: b.price,
        source: b.source || 'unknown',
      }
    })

    return successResponse(result)
  } catch (error) {
    console.error('[GET /api/bookings/today] Unexpected error:', error instanceof Error ? error.stack : error)
    return errorResponse('Internal server error', 500)
  }
}
