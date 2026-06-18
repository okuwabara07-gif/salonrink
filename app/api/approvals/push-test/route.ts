/**
 * POST /api/approvals/push-test
 * 指定した approval_queue id の Flex メッセージをオーナーに送信（テスト用）
 *
 * Request: { id: string (uuid) }
 * Response: { success: boolean, message: string }
 *
 * 用途: LINEタップ承認の実機テスト
 * 認証: Supabase セッション（オーナーのみ）
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api/response'
import type { ApprovalQueue } from '@/lib/types/approval'

const pushTestSchema = z.object({
  id: z.string().uuid('Invalid approval ID'),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: 認証チェック（オーナーのみ）
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[POST /api/approvals/push-test] Auth error:', authError?.message)
      return errorResponse('Unauthorized', 401)
    }

    // Step 2: リクエストボディのパース＆バリデーション
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return errorResponse('Invalid JSON', 400)
    }

    const validation = pushTestSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse('Validation error: id must be a valid UUID', 400)
    }

    const { id } = validation.data

    // Step 3: Admin クライアント取得
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()

    // Step 4: approval_queue から該当行を取得
    const { data: approvalRow, error: fetchError } = await admin
      .from('approval_queue')
      .select('*')
      .eq('id', id)
      .maybeSingle() as { data: ApprovalQueue | null; error: Record<string, unknown> | null }

    if (fetchError) {
      console.error('[POST /api/approvals/push-test] Fetch error:', fetchError.message)
      return errorResponse('Failed to fetch approval queue', 500)
    }

    if (!approvalRow) {
      return errorResponse('Approval queue not found', 404)
    }

    // Step 5: Flex メッセージを push
    const { pushFlexApproval } = await import('@/lib/approval/push-flex-approval')
    const pushSuccess = await pushFlexApproval(approvalRow)

    if (!pushSuccess) {
      return errorResponse('Failed to push Flex message to owner', 500)
    }

    console.log(`[POST /api/approvals/push-test] Success: pushed approval ${id} to owner`)

    return successResponse({
      success: true,
      message: `Flex message sent to owner for approval ${id}`,
    })
  } catch (error) {
    console.error(
      '[POST /api/approvals/push-test] Unexpected error:',
      error instanceof Error ? error.stack : error
    )
    return errorResponse('Internal server error', 500)
  }
}
