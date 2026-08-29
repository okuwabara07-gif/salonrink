/**
 * GET /api/approvals
 * 管理者向け: approval_queue をサーバー側(service_role)で取得
 *
 * Query params:
 *   status?: 'pending' | 'approved' | 'rejected' (omit = all)
 *
 * RLS: approval_queue は service_role=all なので、サーバー側でのみ読取可能
 */

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    // Lazy init: 関数内で遅延生成
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()

    let query = admin.from('approval_queue').select('*')

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/approvals] Query error:', error.message)
      return errorResponse('Failed to fetch approvals', 500)
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[GET /api/approvals] Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
