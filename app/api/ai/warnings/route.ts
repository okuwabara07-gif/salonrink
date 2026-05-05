/**
 * POST /api/ai/warnings
 * 手動再実行用エンドポイント（Supabase Auth 必須・認可チェック）
 *
 * 責務:
 * - Supabase Auth + 認可（salon owner）確認
 * - customer_id から最新 pre_counselings 取得
 * - Claude Haiku で警告抽出（内部と同じロジック）
 * - kartes.warnings を更新
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { callClaude } from '@/lib/ai/claude-client'
import { generateWarningsPrompt, validateWarningsResponse, type Warning } from '@/lib/ai/warnings-prompt'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: 認証確認
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2: body パース
    let body: { customer_id: string; salon_id: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { customer_id, salon_id } = body
    if (!customer_id || !salon_id) {
      return NextResponse.json(
        { error: 'Missing customer_id or salon_id' },
        { status: 400 }
      )
    }

    // Step 3: 認可確認（該当 salon の owner のみ）
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id, owner_user_id')
      .eq('id', salon_id)
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (salonError || !salon) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Step 4: admin クライアント初期化
    const admin = createAdminClient()

    // Step 5: customer の最新 pre_counselings 取得
    const { data: latestPC } = await admin
      .from('pre_counselings')
      .select('*')
      .eq('customer_id', customer_id)
      .eq('salon_id', salon_id)
      .not('answers', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!latestPC) {
      return NextResponse.json(
        { error: 'No pre-counseling found' },
        { status: 404 }
      )
    }

    // Step 6: customer の既存アレルギー情報取得
    const { data: customer } = await admin
      .from('customers')
      .select('allergies')
      .eq('id', customer_id)
      .maybeSingle()

    // Step 7: プロンプト生成 + Claude Haiku 呼び出し
    const prompt = generateWarningsPrompt(
      latestPC.answers || {},
      customer?.allergies || null
    )

    let warnings: Warning[] = []
    try {
      const claudeResponse = await callClaude(prompt)
      const validation = validateWarningsResponse(claudeResponse.content)

      if (validation.valid && validation.warnings) {
        warnings = validation.warnings
      } else {
        console.warn('Warnings API: validation failed:', validation.error)
        warnings = []
      }
    } catch (err) {
      console.error('Warnings API: Claude call failed:', err)
      return NextResponse.json(
        { error: 'AI analysis failed' },
        { status: 500 }
      )
    }

    // Step 8: kartes を更新
    const { error: updateError } = await admin
      .from('kartes')
      .update({
        warnings,
        warnings_updated_at: new Date().toISOString(),
      })
      .eq('customer_id', customer_id)
      .eq('salon_id', salon_id)

    if (updateError) {
      console.error('Warnings API: kartes update failed:', updateError)
      return NextResponse.json(
        { error: 'Failed to save warnings' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        customer_id,
        salon_id,
        warnings_count: warnings.length,
        warnings,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Warnings API: unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
