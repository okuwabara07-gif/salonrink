/**
 * pushFlexApproval
 * approval_queue の pending を owner へ Flex push
 *
 * pushFlexToOwner を使用して統一 (LINE_OWNER_CHANNEL_ACCESS_TOKEN)
 */

import type { ApprovalQueue } from '@/lib/types/approval'
import { buildFlexApprovalTemplate } from '@/lib/line/flex-approval-template'
import { pushFlexToOwner, getActiveOwnerLineUserId } from '@/lib/line/owner-push'

export async function pushFlexApproval(approval: ApprovalQueue): Promise<boolean> {
  try {
    // Step 1: 朝cronの正解パターンで宛先を取得
    const ownerLineUserId = await getActiveOwnerLineUserId()
    if (!ownerLineUserId) {
      console.error('[pushFlexApproval] No active owner found')
      throw new Error('No active owner LINE user ID')
    }

    // Step 2: Flex テンプレート生成
    const flexTemplate = buildFlexApprovalTemplate(approval)

    // Step 3: pushFlexToOwner で LINE へ push (LINE_OWNER_CHANNEL_ACCESS_TOKEN を使用)
    const altText = `[承認待機] ${approval.kind}`
    // flexTemplate = { type: 'flex', altText, contents: {...} }
    // pushFlexToOwner が要求する FlexMessage は contents の bubble/carousel
    const flexMessage = flexTemplate.contents as unknown as Parameters<typeof pushFlexToOwner>[2]
    await pushFlexToOwner(ownerLineUserId, altText, flexMessage)

    return true
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[pushFlexApproval] ERROR:', errMsg)
    throw error
  }
}
