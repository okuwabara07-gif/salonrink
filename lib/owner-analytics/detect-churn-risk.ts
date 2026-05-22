import { createAdminClient } from '@/lib/supabase/admin'

export interface ChurnRiskCustomer {
  customerName: string
  lastVisitDate: Date
  daysSinceLastVisit: number
  visitCount: number
}

const CHURN_THRESHOLD_DAYS = 90

export async function detectChurnRisk(salonId: string): Promise<ChurnRiskCustomer[]> {
  const supabase = createAdminClient()

  try {
    // Fetch all customers for the salon
    const { data: customers, error: customerErr } = await supabase
      .from('customers')
      .select('id, name')
      .eq('salon_id', salonId)

    if (customerErr || !customers) {
      console.error('[detectChurnRisk] Failed to fetch customers:', customerErr)
      return []
    }

    const churnRiskList: ChurnRiskCustomer[] = []
    const now = new Date()

    // For each customer, check last visit
    for (const customer of customers) {
      try {
        // Get all bookings for this customer (combined from both sources)
        // HPB reservations
        const { data: hpbBookings } = await supabase
          .from('hpb_reservations')
          .select('start_time')
          .eq('salon_id', salonId)
          .eq('customer_name', customer.name)
          .order('start_time', { ascending: false })
          .limit(10)

        // Manual reservations
        const { data: manualBookings } = await supabase
          .from('reservations')
          .select('datetime')
          .eq('salon_id', salonId)
          .eq('customer_name', customer.name)
          .order('datetime', { ascending: false })
          .limit(10)

        // Combine and sort
        const allDates: Date[] = []
        if (hpbBookings) {
          allDates.push(...hpbBookings.map(b => new Date(b.start_time)))
        }
        if (manualBookings) {
          allDates.push(...manualBookings.map(b => new Date(b.datetime)))
        }

        if (allDates.length === 0) continue

        allDates.sort((a, b) => b.getTime() - a.getTime())
        const lastVisit = allDates[0]
        const visitCount = allDates.length

        // Filter: only customers with 2+ visits (to avoid false positives on new customers)
        if (visitCount < 2) continue

        const daysSince = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))

        // Check if in churn risk (90+ days since last visit)
        if (daysSince >= CHURN_THRESHOLD_DAYS) {
          churnRiskList.push({
            customerName: customer.name,
            lastVisitDate: lastVisit,
            daysSinceLastVisit: daysSince,
            visitCount,
          })
        }
      } catch (err) {
        console.warn(`[detectChurnRisk] Error checking customer ${customer.name}:`, err)
        continue
      }
    }

    // Sort by lastVisitDate (oldest first)
    churnRiskList.sort((a, b) => a.lastVisitDate.getTime() - b.lastVisitDate.getTime())

    return churnRiskList
  } catch (err) {
    console.error('[detectChurnRisk] Fatal error:', err)
    return []
  }
}
