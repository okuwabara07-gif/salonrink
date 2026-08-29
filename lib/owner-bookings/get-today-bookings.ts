import { createAdminClient } from '@/lib/supabase/admin'

export interface TodayBooking {
  time: string // HH:mm format
  customerName: string
  menuName: string
  source: 'hpb' | 'manual'
  price?: number
}

export interface TodayBookingsResult {
  bookings: TodayBooking[]
  totalPrice: number
  totalCount: number
}

export async function getTodayBookings(salonId: string): Promise<TodayBookingsResult> {
  const supabase = createAdminClient()

  // Calculate today's date range (JST)
  const today = new Date()
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const startISO = dayStart.toISOString()
  const endISO = dayEnd.toISOString()

  const bookings: TodayBooking[] = []
  let totalPrice = 0

  // HPB reservations
  try {
    const { data: hpbData, error: hpbErr } = await supabase
      .from('hpb_reservations')
      .select('*')
      .eq('salon_id', salonId)
      .gte('start_time', startISO)
      .lt('start_time', endISO)
      .eq('status', 'confirmed')
      .order('start_time', { ascending: true })

    if (!hpbErr && hpbData) {
      for (const r of hpbData) {
        const dt = new Date(r.start_time)
        // HACK 2026/05/22: HPB scraper writes JST hours with off-by-12 bug. Adjust here.
        // TODO: Fix scraper on VPS (/root/salonrink-sync-bot) and revert this hack.
        const _adj = new Date(dt.getTime() + 12 * 60 * 60 * 1000)
        const time = `${String(_adj.getUTCHours()).padStart(2, '0')}:${String(_adj.getUTCMinutes()).padStart(2, '0')}`
        const price = Number(r.price) || 0
        bookings.push({
          time,
          customerName: r.customer_name || '（名前なし）',
          menuName: r.menu_name || '（メニューなし）',
          source: 'hpb',
          price,
        })
        totalPrice += price
      }
    }
  } catch (err) {
    console.error('[getTodayBookings] HPB fetch failed:', err)
  }

  // Manual reservations
  try {
    const { data: manualData, error: manualErr } = await supabase
      .from('reservations')
      .select('*')
      .eq('salon_id', salonId)
      .gte('datetime', startISO)
      .lt('datetime', endISO)
      .eq('status', 'confirmed')
      .order('datetime', { ascending: true })

    if (!manualErr && manualData) {
      for (const r of manualData) {
        const dt = new Date(r.datetime)
        const time = `${dt.getHours()}:${String(dt.getMinutes()).padStart(2, '0')}`
        const price = Number(r.price) || 0
        bookings.push({
          time,
          customerName: r.customer_name || '（名前なし）',
          menuName: r.menu_name || r.menu || '（メニューなし）',
          source: 'manual',
          price,
        })
        totalPrice += price
      }
    }
  } catch (err) {
    console.error('[getTodayBookings] Manual reservations fetch failed:', err)
  }

  // Sort by time (HH:mm)
  bookings.sort((a, b) => a.time.localeCompare(b.time))

  return {
    bookings,
    totalPrice,
    totalCount: bookings.length,
  }
}
