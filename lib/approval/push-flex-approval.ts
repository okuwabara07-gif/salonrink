/**
 * pushFlexApproval
 * approval_queue の pending を owner へ Flex push
 *
 * pushFlexToOwner を使用して統一 (LINE_OWNER_CHANNEL_ACCESS_TOKEN)
 */

import type { ApprovalQueue } from '@/lib/types/approval'
import { buildFlexApprovalTemplate } from '@/lib/line/flex-approval-template'
import { pushFlexToOwner } from '@/lib/line/owner-push'

// グローバル単一 OA user ID
const OWNER_OA_LINE_USER_ID = process.env.OWNER_OA_LINE_USER_ID || 'U1234567890abcdef1234567890abcdef'

export async function pushFlexApproval(approval: ApprovalQueue): Promise<boolean> {
  try {
    // Step 1: Flex テンプレート生成
    const flexTemplate = buildFlexApprovalTemplate(approval)

    // Step 2: pushFlexToOwner で LINE へ push (LINE_OWNER_CHANNEL_ACCESS_TOKEN を使用)
    const altText = `[承認待機] ${approval.kind}`
    // flexTemplate = { type: 'flex', altText, contents: {...} }
    // pushFlexToOwner が要求する FlexMessage は contents の bubble/carousel
    const flexMessage = flexTemplate.contents as unknown as Parameters<typeof pushFlexToOwner>[2]
    await pushFlexToOwner(OWNER_OA_LINE_USER_ID, altText, flexMessage)

    console.log(`[pushFlexApproval] Flex pushed successfully: ${approval.id}`)
    return true
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[pushFlexApproval] ERROR:', errMsg)
    throw error
  }
}
