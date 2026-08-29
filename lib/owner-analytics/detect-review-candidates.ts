import { createAdminClient } from '@/lib/supabase/admin'

export interface ReviewCandidate {
  customerId: string | null
  customerName: string
  source: 'hpb' | 'manual'
  isFirstVisit: boolean
  isVip: boolean
}

export async function detectReviewCandidates(salonId: string): Promise<ReviewCandidate[]> {
  const supabase = createAdminClient()

  try {
    // Calculate today's date range (JST)
    const today = new Date()
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const startISO = dayStart.toISOString()
    const endISO = dayEnd.toISOString()

    const completedCustomers: Map<string, ReviewCandidate> = new Map()

    // HPB reservations with status='completed'
    try {
      const { data: hpbData } = await supabase
        .from('hpb_reservations')
        .select('*')
        .eq('salon_id', salonId)
        .gte('start_time', startISO)
        .lt('start_time', endISO)
        .eq('status', 'completed')

      if (hpbData) {
        for (const r of hpbData) {
          const customerName = r.customer_name || '（名前なし）'
          if (!completedCustomers.has(customerName)) {
            completedCustomers.set(customerName, {
              customerId: null,
              customerName,
              source: 'hpb',
              isFirstVisit: false,
              isVip: false,
            })
          }
        }
      }
    } catch (err) {
      console.warn('[detectReviewCandidates] HPB fetch failed:', err)
    }

    // Manual reservations with status='completed'
    try {
      const { data: manualData } = await supabase
        .from('reservations')
        .select('*')
        .eq('salon_id', salonId)
        .gte('datetime', startISO)
        .lt('datetime', endISO)
        .eq('status', 'completed')

      if (manualData) {
        for (const r of manualData) {
          const customerName = r.customer_name || '（名前なし）'
          if (!completedCustomers.has(customerName)) {
            completedCustomers.set(customerName, {
              customerId: r.customer_id || null,
              customerName,
              source: 'manual',
              isFirstVisit: false,
              isVip: false,
            })
          }
        }
      }
    } catch (err) {
      console.warn('[detectReviewCandidates] Manual reservations fetch failed:', err)
    }

    if (completedCustomers.size === 0) {
      return []
    }

    // Get customer details (VIP flag, visit count)
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, created_at')
      .eq('salon_id', salonId)

    const customerMap = new Map(customers?.map(c => [c.name, c]) || [])

    // Check for first visit and VIP status
    const candidates: ReviewCandidate[] = []
    for (const [name, candidate] of completedCustomers) {
      const customerData = customerMap.get(name)
      if (customerData) {
        candidate.customerId = customerData.id
        // Check if first visit (created today)
        if (customerData.created_at) {
          const createdDate = new Date(customerData.created_at)
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          candidate.isFirstVisit = createdDate >= todayStart
        }
        // TODO: Check vip_flag when schema is confirmed
        // candidate.isVip = customerData.vip_flag || false
      }
      candidates.push(candidate)
    }

    // TODO: Filter out customers with review request history
    // SELECT DISTINCT customer_name FROM reviews_requested
    // WHERE salon_id = salonId AND requested_at >= now() - interval '90 days'

    // Sort: first visit + VIP first, then others
    candidates.sort((a, b) => {
      const aScore = (a.isFirstVisit ? 10 : 0) + (a.isVip ? 5 : 0)
      const bScore = (b.isFirstVisit ? 10 : 0) + (b.isVip ? 5 : 0)
      return bScore - aScore
    })

    // Return max 5
    return candidates.slice(0, 5)
  } catch (err) {
    console.error('[detectReviewCandidates] Fatal error:', err)
    return []
  }
}
