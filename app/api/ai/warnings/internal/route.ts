/**
 * POST /api/ai/warnings/internal
 * 内部用AI警告抽出エンドポイント（非認証・INTERNAL_API_SECRET検証）
 *
 * 責務:
 * - INTERNAL_API_SECRET 検証
 * - customer_id から最新 pre_counselings 取得
 * - Claude Haiku で警告抽出
 * - kartes.warnings を更新
 * - 非同期トリガー用（失敗は silent）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { callClaude } from '@/lib/ai/claude-client'
import { generateWarningsPrompt, validateWarningsResponse, type Warning } from '@/lib/ai/warnings-prompt'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: INTERNAL_API_SECRET 検証
    const authHeader = request.headers.get('x-internal-secret')
    const secretKey = process.env.INTERNAL_API_SECRET

    if (!secretKey || authHeader !== secretKey) {
      console.warn('Warnings API: unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2: body パース
    let body: { customer_id: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { customer_id } = body
    if (!customer_id) {
      return NextResponse.json({ error: 'Missing customer_id' }, { status: 400 })
    }

    // Step 3: admin クライアント初期化
    const admin = createAdminClient()

    // Step 4: customer の最新 pre_counselings 取得（submitted のみ）
    const { data: latestPC, error: pcError } = await admin
      .from('pre_counselings')
      .select('*')
      .eq('customer_id', customer_id)
      .not('answers', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (pcError || !latestPC) {
      console.error('Warnings API: pre_counselings not found for customer:', customer_id)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 5: プロンプト生成 + Claude Haiku 呼び出し
    const prompt = generateWarningsPrompt(
      latestPC.answers || {},
      null  // customers.allergies 列なし
    )

    let warnings: Warning[] = []
    try {
      const claudeResponse = await callClaude(prompt)
      const validation = validateWarningsResponse(claudeResponse.content)

      if (validation.valid && validation.warnings) {
        warnings = validation.warnings
      } else {
        console.warn('Warnings API: validation failed:', validation.error, 'raw:', validation.raw)
        warnings = []
      }
    } catch (err) {
      console.error('Warnings API: Claude call failed:', err)
      warnings = []
    }

    // Step 7: pre_counselings を更新
    const { error: updateError } = await admin
      .from('pre_counselings')
      .update({
        warnings,
        warnings_updated_at: new Date().toISOString(),
      })
      .eq('id', latestPC.id)

    if (updateError) {
      console.error('Warnings API: kartes update failed:', updateError)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Step 8: 常に 200 返却（非同期処理のため）
    return NextResponse.json(
      {
        success: true,
        customer_id,
        warnings_count: warnings.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Warnings API: unexpected error:', error)
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
