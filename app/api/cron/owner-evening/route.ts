import { createAdminClient } from '@/lib/supabase/admin'
import { getTodayBookings } from '@/lib/owner-bookings/get-today-bookings'
import { getTomorrowBookings } from '@/lib/owner-bookings/get-tomorrow-bookings'
import { detectChurnRisk, type ChurnRiskCustomer } from '@/lib/owner-analytics/detect-churn-risk'
import { detectReviewCandidates, type ReviewCandidate } from '@/lib/owner-analytics/detect-review-candidates'
import { buildOwnerEveningFlex } from '@/lib/line-messages/owner-evening-flex'
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
      console.error('[Owner Evening Cron] Invalid CRON_SECRET')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    console.log('[Owner Evening Cron] Starting...')

    // Verify LINE credentials
    const channelToken = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN
    if (!channelToken) {
      console.error('[Owner Evening Cron] LINE_OWNER_CHANNEL_ACCESS_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'LINE credentials not configured' }),
        { status: 500 }
      )
    }

    const supabase = createAdminClient()
    const today = new Date()

    // Calculate current JST hour
    const jstHour = (new Date().getUTCHours() + 9) % 24

    // Step 1: Fetch active owners with evening_enabled = true and matching send hour
    const { data: owners, error: ownersErr } = await supabase
      .from('owner_line_links')
      .select('id, line_user_id, salon_id, last_evening_sent_at, evening_send_hour_jst')
      .eq('status', 'active')
      .eq('evening_enabled', true)
      .eq('evening_send_hour_jst', jstHour)

    if (ownersErr || !owners) {
      console.error('[Owner Evening Cron] Failed to fetch owners:', ownersErr)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch owners' }),
        { status: 500 }
      )
    }

    response.total = owners.length
    console.log(`[Owner Evening Cron] Found ${owners.length} active owners`)

    // Step 2: Process each owner
    for (const owner of owners) {
      const { id: ownerLinkId, line_user_id: lineUserId, salon_id: salonId, last_evening_sent_at } = owner

      try {
        // 2a: Check if already sent today
        if (last_evening_sent_at) {
          const lastSentDate = new Date(last_evening_sent_at)
          if (isSameDateJST(lastSentDate, today)) {
            console.log(`[Owner Evening Cron] Skipping ${lineUserId}: already sent today`)
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
          console.error(`[Owner Evening Cron] ${err}`)
          response.errors?.push(err)
          response.failed++
          continue
        }

        // 2c: Fetch today's bookings for stats
        const todayResult = await getTodayBookings(salonId)
        const visitCount = todayResult.totalCount
        const todayRevenue = todayResult.totalPrice

        // 2d: Get new customer count (created_at = today)
        const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)
        const { data: newCustomers } = await supabase
          .from('customers')
          .select('id')
          .eq('salon_id', salonId)
          .gte('created_at', dayStart.toISOString())
          .lt('created_at', dayEnd.toISOString())
        const newCustomerCount = newCustomers?.length || 0

        // 2e: Get draft karte count (created today)
        const { data: draftKartes } = await supabase
          .from('kartes')
          .select('id')
          .eq('salon_id', salonId)
          .eq('status', 'draft')
          .gte('created_at', dayStart.toISOString())
          .lt('created_at', dayEnd.toISOString())
        const draftKarteCount = draftKartes?.length || 0

        // 2f: Detect churn risk (graceful degradation)
        let churnRiskCustomers: ChurnRiskCustomer[] = []
        try {
          churnRiskCustomers = await detectChurnRisk(salonId)
        } catch (err) {
          console.warn(`[Owner Evening Cron] Churn risk detection failed for ${salonId}:`, err)
        }

        // 2g: Detect review candidates (graceful degradation)
        let reviewCandidates: ReviewCandidate[] = []
        try {
          reviewCandidates = await detectReviewCandidates(salonId)
        } catch (err) {
          console.warn(`[Owner Evening Cron] Review candidates detection failed for ${salonId}:`, err)
        }

        // 2h: Fetch tomorrow's bookings
        const tomorrowResult = await getTomorrowBookings(salonId)
        const tomorrowCount = tomorrowResult.totalCount
        const tomorrowPrice = tomorrowResult.totalPrice

        // 2i: Build Flex Message
        const flex = buildOwnerEveningFlex(
          salon.name,
          today,
          todayRevenue,
          visitCount,
          newCustomerCount,
          draftKarteCount,
          churnRiskCustomers,
          reviewCandidates,
          tomorrowCount,
          tomorrowPrice
        )

        // 2j: Push to owner
        const altText = `${salon.name} の本日のまとめ: 売上 ${todayRevenue.toLocaleString('ja-JP')}円`
        await pushFlexToOwner(lineUserId, altText, flex)
        console.log(`[Owner Evening Cron] Sent to ${lineUserId}`)

        // 2k: Update last_evening_sent_at
        const { error: updateErr } = await supabase
          .from('owner_line_links')
          .update({ last_evening_sent_at: new Date().toISOString() })
          .eq('id', ownerLinkId)

        if (updateErr) {
          console.warn(`[Owner Evening Cron] Failed to update last_evening_sent_at for ${ownerLinkId}`)
        }

        response.sent++
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error(`[Owner Evening Cron] Error processing owner ${lineUserId}:`, errMsg)
        response.errors?.push(`${lineUserId}: ${errMsg}`)
        response.failed++
      }
    }

    response.success = true
    console.log(
      `[Owner Evening Cron] Complete: sent=${response.sent}, skipped=${response.skipped}, failed=${response.failed}`
    )

    return new Response(JSON.stringify(response), { status: 200 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[Owner Evening Cron] Fatal error:', errMsg)
    return new Response(
      JSON.stringify({
        ...response,
        error: errMsg,
      }),
      { status: 500 }
    )
  }
}
