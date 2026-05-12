/**
 * POST/GET /api/cron/score-leads
 * Vercel Cron: 毎日 17:00 UTC (02:00 JST) 実行
 *
 * 役割:
 * - 全リードの行動イベントから自動スコアリング(0-100)
 * - グレード判定(A/B/C)
 * - lp_leads の score, score_grade を更新
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendHotLeadEmail } from '@/lib/email/hot-lead'
import { notifySlackHotLead } from '@/lib/notification/slack-hot-lead'

interface Lead {
  id: string
  created_at: string
  score: number
  score_grade: string
  email: string
  contact_name?: string | null
  salon_name?: string | null
  hot_lead_notified_at?: string | null
}

interface LeadEvent {
  id: string
  lead_id: string
  event_type: string
  created_at: string
}

interface ScoringResult {
  success: boolean
  scored: number
  distribution: {
    A: number
    B: number
    C: number
  }
  error?: string
}

// ───── Helper: 認証チェック ─────

function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret) {
    return false
  }

  const expectedAuth = `Bearer ${secret}`
  return authHeader === expectedAuth
}

// ───── Helper: スコア計算 ─────

function calculateScore(lead: Lead, events: LeadEvent[]): number {
  let score = 10 // ベース

  const now = Date.now()
  const leadAge = (now - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)

  // 行動ボーナス
  for (const event of events) {
    switch (event.event_type) {
      case 'ai_experience_completed':
        score += 20
        break
      case 'email_opened':
        score += 3
        break
      case 'email_clicked':
        score += 10
        break
      case 'lp_revisit':
        score += 5
        break
      case 'signup':
        score += 100 // コンバート済み
        break
    }
  }

  // 7日以内の複数アクション ボーナス
  const recentEvents = events.filter((e) => {
    const eventAge = (now - new Date(e.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return eventAge < 7
  })
  if (recentEvents.length >= 3) score += 15

  // 時間減衰
  if (leadAge > 30) score -= 10
  if (leadAge > 60) score -= 20
  if (leadAge > 90) score -= 30

  // 0-100 にクランプ
  return Math.max(0, Math.min(100, Math.round(score)))
}

function calculateGrade(score: number): 'A' | 'B' | 'C' {
  if (score >= 70) return 'A'
  if (score >= 40) return 'B'
  return 'C'
}

// ───── Main Cron Handler ─────

async function handleCronRequest(request: NextRequest): Promise<NextResponse> {
  // 認証チェック
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      {
        error: 'CRON_SECRET not configured',
        message: 'Environment variable CRON_SECRET is required',
      },
      { status: 500 }
    )
  }

  if (!validateCronSecret(request)) {
    console.warn('Unauthorized cron request: score-leads')
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing authorization' },
      { status: 401 }
    )
  }

  const result: ScoringResult = {
    success: true,
    scored: 0,
    distribution: { A: 0, B: 0, C: 0 },
  }

  try {
    const supabase = createAdminClient()

    // Step 1: 全リード取得(opted_out = false のみ)
    console.log('[score-leads] Fetching all active leads...')
    const { data: leads, error: leadsError } = await supabase
      .from('lp_leads')
      .select('id, created_at, score, score_grade, email, contact_name, salon_name, hot_lead_notified_at')
      .eq('opted_out', false)

    if (leadsError) {
      throw new Error(`Failed to fetch leads: ${leadsError.message}`)
    }

    if (!leads || leads.length === 0) {
      console.log('[score-leads] No active leads found')
      return NextResponse.json(result, { status: 200 })
    }

    console.log(`[score-leads] Found ${leads.length} active leads, fetching events...`)

    // Step 2: 全リードのイベントを一度に取得
    const leadIds = leads.map((l) => l.id)
    const { data: allEvents, error: eventsError } = await supabase
      .from('lead_events')
      .select('id, lead_id, event_type, created_at')
      .in('lead_id', leadIds)

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`)
    }

    // Step 3: メモリ上でグループ化
    const eventsByLeadId = new Map<string, LeadEvent[]>()
    for (const event of allEvents || []) {
      if (!eventsByLeadId.has(event.lead_id)) {
        eventsByLeadId.set(event.lead_id, [])
      }
      eventsByLeadId.get(event.lead_id)!.push(event)
    }

    console.log(`[score-leads] Processing ${leads.length} leads for scoring...`)

    // Step 4: 各リードをスコアリング + 更新
    const salesEnabled = process.env.SALES_AGENTS_ENABLED === 'true'

    for (const lead of leads) {
      try {
        const events = eventsByLeadId.get(lead.id) || []
        const newScore = calculateScore(lead as Lead, events)
        const newGrade = calculateGrade(newScore)

        // DB 更新
        const { error: updateError } = await supabase
          .from('lp_leads')
          .update({
            score: newScore,
            score_grade: newGrade,
          })
          .eq('id', lead.id)

        if (updateError) {
          console.error(`[score-leads] Update failed for lead ${lead.id}: ${updateError.message}`)
          // 継続（個別エラーで全体を止めない）
          continue
        }

        // ホットリード判定(70点を初めて超えた場合)
        if (newScore >= 70 && !lead.hot_lead_notified_at && salesEnabled) {
          console.log(`[score-leads] Hot lead detected: ${lead.email} (score: ${newScore})`)

          const emailSent = await sendHotLeadEmail({
            email: lead.email,
            contact_name: lead.contact_name,
            salon_name: lead.salon_name,
            score: newScore,
          })

          if (emailSent) {
            await notifySlackHotLead({
              leadId: lead.id,
              email: lead.email,
              contact_name: lead.contact_name,
              salon_name: lead.salon_name,
              score: newScore,
            })

            // 送信済みフラグを更新(重複送信防止)
            await supabase.from('lp_leads')
              .update({ hot_lead_notified_at: new Date().toISOString() })
              .eq('id', lead.id)
          }
        }

        result.scored++
        result.distribution[newGrade]++

        if (result.scored % 100 === 0) {
          console.log(`[score-leads] Processed ${result.scored} leads...`)
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`[score-leads] Processing failed for lead ${lead.id}: ${errMsg}`)
        // 継続
      }
    }

    console.log(
      `[score-leads] Complete. Scored: ${result.scored}, Distribution: A=${result.distribution.A}, B=${result.distribution.B}, C=${result.distribution.C}`
    )

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[score-leads] Fatal error:', errMsg)

    return NextResponse.json(
      {
        success: false,
        error: errMsg,
        scored: result.scored,
        distribution: result.distribution,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleCronRequest(request)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleCronRequest(request)
}
