import { createAdminClient } from '@/lib/supabase/admin'
import type { TodayBooking } from '@/lib/owner-bookings/get-today-bookings'

export interface AllergyWarning {
  customerName: string
  allergyInfo: string
}

export async function detectAllergyWarnings(
  salonId: string,
  todayBookings: TodayBooking[]
): Promise<AllergyWarning[]> {
  const supabase = createAdminClient()

  if (todayBookings.length === 0) {
    return []
  }

  try {
    const allergyWarnings: AllergyWarning[] = []
    const customerNames = todayBookings.map(b => b.customerName)

    // Get all customers for the salon
    const { data: customers, error: customerErr } = await supabase
      .from('customers')
      .select('id, name')
      .eq('salon_id', salonId)

    if (customerErr || !customers) {
      console.error('[detectAllergyWarnings] Failed to fetch customers:', customerErr)
      return []
    }

    // Create a map for quick lookup
    const customerMap = new Map(customers.map(c => [c.name, c.id]))

    // For each customer in today's bookings
    for (const bookingName of customerNames) {
      const customerId = customerMap.get(bookingName)
      if (!customerId) continue

      try {
        // Get latest karte for this customer
        const { data: kartes, error: karteErr } = await supabase
          .from('kartes')
          .select('allergies, treatment_note')
          .eq('customer_id', customerId)
          .eq('salon_id', salonId)
          .order('visit_date', { ascending: false })
          .limit(1)

        if (karteErr || !kartes || kartes.length === 0) {
          continue
        }

        const karte = kartes[0]
        const allergyText = karte.allergies || ''
        const noteText = karte.treatment_note || ''

        // Check for allergy-related keywords
        const allergyKeywords = ['アレルギー', 'アレルゲン', '不可', '禁止', 'NG']
        const hasAllergyInfo =
          allergyKeywords.some(k => allergyText.includes(k)) ||
          allergyKeywords.some(k => noteText.includes(k))

        if (hasAllergyInfo) {
          // Extract allergy info (first 30 chars to keep it brief)
          const allergyInfo = (allergyText || noteText).substring(0, 30)
          allergyWarnings.push({
            customerName: bookingName,
            allergyInfo,
          })
        }
      } catch (err) {
        console.warn(`[detectAllergyWarnings] Error checking karte for ${bookingName}:`, err)
        continue
      }
    }

    return allergyWarnings
  } catch (err) {
    console.error('[detectAllergyWarnings] Fatal error:', err)
    return []
  }
}
