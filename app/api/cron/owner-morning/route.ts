import { createAdminClient } from '@/lib/supabase/admin'
import { getTodayBookings } from '@/lib/owner-bookings/get-today-bookings'
import { detectChurnRisk, type ChurnRiskCustomer } from '@/lib/owner-analytics/detect-churn-risk'
import { detectAllergyWarnings, type AllergyWarning } from '@/lib/owner-analytics/detect-allergy-warnings'
import { buildOwnerMorningFlex } from '@/lib/line-messages/owner-morning-flex'
import { pushFlexToOwner } from '@/lib/line/owner-push'

interface CronResponse {
  success: boolean
  sent: number
  skipped: number
  failed: number
  total: number
  errors?: string[]
}

function validateCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization') || ''
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return false
  }

  const expectedAuth = `Bearer ${secret}`
  return authHeader === expectedAuth
}

function isSameDateJST(date1: Date, date2: Date): boolean {
  const y1 = date1.getFullYear()
  const m1 = date1.getMonth()
  const d1 = date1.getDate()
  const y2 = date2.getFullYear()
  const m2 = date2.getMonth()
  const d2 = date2.getDate()
  return y1 === y2 && m1 === m2 && d1 === d2
}

export async function GET(request: Request) {
  const response: CronResponse = {
    success: false,
    sent: 0,
    skipped: 0,
    failed: 0,
    total: 0,
    errors: [],
  }

  try {
    // Verify CRON_SECRET
    if (!validateCronSecret(request)) {
      console.error('[Owner Morning Cron] Invalid CRON_SECRET')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    console.log('[Owner Morning Cron] Starting...')

    // Verify LINE credentials
    const channelToken = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN
    if (!channelToken) {
      console.error('[Owner Morning Cron] LINE_OWNER_CHANNEL_ACCESS_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'LINE credentials not configured' }),
        { status: 500 }
      )
    }

    const supabase = createAdminClient()
    const today = new Date()

    // Step 1: Fetch active owners with morning_enabled = true
    const { data: owners, error: ownersErr } = await supabase
      .from('owner_line_links')
      .select('id, line_user_id, salon_id, last_morning_sent_at')
      .eq('status', 'active')
      .eq('morning_enabled', true)

    if (ownersErr || !owners) {
      console.error('[Owner Morning Cron] Failed to fetch owners:', ownersErr)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch owners' }),
        { status: 500 }
      )
    }

    response.total = owners.length
    console.log(`[Owner Morning Cron] Found ${owners.length} active owners`)

    // Step 2: Process each owner
    for (const owner of owners) {
      const { id: ownerLinkId, line_user_id: lineUserId, salon_id: salonId, last_morning_sent_at } = owner

      try {
        // 2a: Check if already sent today
        if (last_morning_sent_at) {
          const lastSentDate = new Date(last_morning_sent_at)
          if (isSameDateJST(lastSentDate, today)) {
            console.log(`[Owner Morning Cron] Skipping ${lineUserId}: already sent today`)
            response.skipped++
            continue
          }
        }

        // 2b: Fetch salon name
        const { data: salon, error: salonErr } = await supabase
          .from('salons')
          .select('name')
          .eq('id', salonId)
          .maybeSingle()

        if (salonErr || !salon) {
          const err = `salon not found for ${salonId}`
          console.error(`[Owner Morning Cron] ${err}`)
          response.errors?.push(err)
          response.failed++
          continue
        }

        // 2c: Fetch today's bookings (with total price)
        const bookingsResult = await getTodayBookings(salonId)
        const { bookings, totalPrice, totalCount } = bookingsResult
        console.log(
          `[Owner Morning Cron] Fetched ${totalCount} bookings for salon ${salon.name}`
        )

        // 2d: Detect churn risk (graceful degradation if fails)
        let churnRiskCustomers: ChurnRiskCustomer[] = []
        try {
          churnRiskCustomers = await detectChurnRisk(salonId)
          console.log(`[Owner Morning Cron] Detected ${churnRiskCustomers.length} churn risk customers`)
        } catch (err) {
          console.warn(`[Owner Morning Cron] Churn risk detection failed for ${salonId}:`, err)
          // Continue with empty list
        }

        // 2e: Detect allergy warnings (graceful degradation if fails)
        let allergyWarnings: AllergyWarning[] = []
        try {
          allergyWarnings = await detectAllergyWarnings(salonId, bookings)
          console.log(`[Owner Morning Cron] Detected ${allergyWarnings.length} allergy warnings`)
        } catch (err) {
          console.warn(`[Owner Morning Cron] Allergy detection failed for ${salonId}:`, err)
          // Continue with empty list
        }

        // 2f: Build Flex Message (with all data)
        const flex = buildOwnerMorningFlex(
          salon.name,
          today,
          bookings,
          totalPrice,
          churnRiskCustomers,
          allergyWarnings
        )

        // 2g: Push to owner
        const altText = `${salon.name} の今日の予約: ${totalCount}件`
        await pushFlexToOwner(lineUserId, altText, flex)
        console.log(`[Owner Morning Cron] Sent to ${lineUserId}`)

        // 2h: Update last_morning_sent_at
        const { error: updateErr } = await supabase
          .from('owner_line_links')
          .update({ last_morning_sent_at: new Date().toISOString() })
          .eq('id', ownerLinkId)

        if (updateErr) {
          console.warn(`[Owner Morning Cron] Failed to update last_morning_sent_at for ${ownerLinkId}`)
        }

        response.sent++
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error(`[Owner Morning Cron] Error processing owner ${lineUserId}:`, errMsg)
        response.errors?.push(`${lineUserId}: ${errMsg}`)
        response.failed++
        // Continue to next owner
      }
    }

    response.success = true
    console.log(
      `[Owner Morning Cron] Complete: sent=${response.sent}, skipped=${response.skipped}, failed=${response.failed}`
    )

    return new Response(JSON.stringify(response), { status: 200 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[Owner Morning Cron] Fatal error:', errMsg)
    return new Response(
      JSON.stringify({
        ...response,
        error: errMsg,
      }),
      { status: 500 }
    )
  }
}
