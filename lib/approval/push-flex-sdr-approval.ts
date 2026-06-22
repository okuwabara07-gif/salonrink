/**
 * pushFlexSdrApproval
 * SDR営業ドラフト承認Flex を owner へ push
 *
 * 表示内容:
 * - 対象サロン名
 * - メール件名
 * - メール本文先頭（プレビュー）
 * - 承認ボタン（postback: agentact:approve:{id}）
 * - 却下ボタン（postback: agentact:reject:{id}）
 */

import { pushFlexToOwner } from '@/lib/line/owner-push'
import type { FlexMessage } from '@/lib/line-messages/owner-morning-flex'
import type { SalonProspect } from '@/lib/types/agent'

export async function pushFlexSdrApproval(
  agentActionId: string,
  prospect: SalonProspect,
  subject: string
): Promise<void> {
  try {
    // メール本文から最初のテキスト（HTMLタグ除去）を抽出してプレビュー
    // payload.html は <html><body>...<p>text</p>...</body></html> 形式
    const bodyPreview = subject.substring(0, 60)

    const flex: FlexMessage = {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📧 営業メール承認待ち',
            weight: 'bold',
            size: 'lg',
            color: '#0f1614',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                margin: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: 'サロン',
                    color: '#6b746f',
                    size: 'sm',
                    flex: 0,
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: prospect.salon_name,
                    color: '#0f1614',
                    size: 'sm',
                    flex: 1,
                    wrap: true,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                margin: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '地域',
                    color: '#6b746f',
                    size: 'sm',
                    flex: 0,
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: prospect.region,
                    color: '#0f1614',
                    size: 'sm',
                    flex: 1,
                    wrap: true,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                margin: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '担当者',
                    color: '#6b746f',
                    size: 'sm',
                    flex: 0,
                    weight: 'bold',
                  },
                  {
                    type: 'text',
                    text: prospect.contact_name,
                    color: '#0f1614',
                    size: 'sm',
                    flex: 1,
                    wrap: true,
                  },
                ],
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '【件名】',
                weight: 'bold',
                size: 'sm',
                color: '#3a4340',
              },
              {
                type: 'text',
                text: subject,
                size: 'sm',
                color: '#0f1614',
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                height: 'sm',
                action: {
                  type: 'postback',
                  label: '✅ 承認',
                  data: `agentact:approve:${agentActionId}`,
                },
                color: '#06C755',
              },
              {
                type: 'button',
                style: 'secondary',
                height: 'sm',
                action: {
                  type: 'postback',
                  label: '❌ 却下',
                  data: `agentact:reject:${agentActionId}`,
                },
                color: '#ff0000',
              },
            ],
          },
        ],
      },
    }

    // Note: pushFlexToOwner は内部で owner_line_links から userId を取得するため、ここでは空にして OK
    await pushFlexToOwner('', `営業メール承認: ${prospect.salon_name}`, flex)
  } catch (error) {
    console.error('[pushFlexSdrApproval] Error:', error)
    throw error
  }
}
