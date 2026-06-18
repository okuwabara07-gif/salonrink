/**
 * LINE Flex テンプレート：管理者承認
 *
 * approval_queue の pending を @901bsvrb OA へ push
 * 承認/却下ボタン → /api/approve へ postback
 */

import type { ApprovalQueue } from '@/lib/types/approval'

export function buildFlexApprovalTemplate(approval: ApprovalQueue): {
  type: 'flex'
  altText: string
  contents: Record<string, unknown>
} {
  let title = ''
  let subtitle = ''
  let payloadDisplay = ''

  switch (approval.kind) {
    case 'sns_post': {
      const sns = approval.payload as Record<string, unknown>
      const site = String(sns.site || 'unknown')
      const platform = String(sns.platform || 'unknown')
      const caption = String(sns.caption || '')
      title = `📱 SNS投稿 - ${site}/${platform}`
      subtitle = `キャプション: "${caption.substring(0, 30)}..."`
      payloadDisplay = `
📌 サイト: ${site}
📌 プラットフォーム: ${platform}
📌 トピック: ${String(sns.topic || '-')}
📌 コンプラ: ${approval.lint_status === 'pass' ? '✅ Pass' : '⚠️ Flag'}`.trim()
      break
    }

    case 'nurture_msg': {
      const nurture = approval.payload as Record<string, unknown>
      const channel = String(nurture.channel || 'unknown')
      const step = String(nurture.sequence_step || '-')
      const scheduled = String(nurture.scheduled_at || '-')
      title = '📧 フォロー送信'
      subtitle = `チャネル: ${channel}`
      payloadDisplay = `
📌 チャネル: ${channel}
📌 Step: ${step}
📌 スケジュール: ${scheduled}
📌 コンプラ: ${approval.lint_status === 'pass' ? '✅ Pass' : '⚠️ Flag'}`.trim()
      break
    }

    case 'outbound': {
      const outbound = approval.payload as Record<string, unknown>
      const type = String(outbound.outbound_type || 'unknown')
      const target = String(outbound.webhook_url || outbound.target || '-')
      title = '🔗 外部連携'
      subtitle = `タイプ: ${type}`
      payloadDisplay = `
📌 タイプ: ${type}
📌 ターゲット: ${target}
📌 コンプラ: ${approval.lint_status === 'pass' ? '✅ Pass' : '⚠️ Flag'}`.trim()
      break
    }

    case 'product_push': {
      const product = approval.payload as Record<string, unknown>
      const productId = String(product.product_id || 'unknown')
      const segment = String(product.target_segment || '-')
      title = '🛍️ 商品プッシュ'
      subtitle = `商品: ${productId}`
      payloadDisplay = `
📌 商品ID: ${productId}
📌 ターゲット: ${segment}
📌 コンプラ: ${approval.lint_status === 'pass' ? '✅ Pass' : '⚠️ Flag'}`.trim()
      break
    }

    default:
      title = '⚙️ 承認待機'
      subtitle = `種別: ${approval.kind}`
      payloadDisplay = `📌 ID: ${approval.id}`
  }

  // Lint notes があれば追加
  let lintSection = ''
  if (approval.lint_status === 'flag' && approval.lint_notes) {
    lintSection = `\n⚠️ ${approval.lint_notes}`
  }

  return {
    type: 'flex',
    altText: `[承認待機] ${title}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: title,
            weight: 'bold',
            size: 'lg',
            color: '#ffffff',
          },
          {
            type: 'text',
            text: subtitle,
            size: 'sm',
            color: '#f0f0f0',
            margin: 'md',
          },
        ],
        backgroundColor:
          approval.lint_status === 'pass' ? '#007bff' : '#ff9800',
        paddingAll: 'md',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: payloadDisplay,
                size: 'xs',
                color: '#666666',
                wrap: true,
                margin: 'none',
              },
            ],
            paddingAll: 'md',
            backgroundColor: '#f5f5f5',
            cornerRadius: 'md',
          },
          ...(lintSection
            ? [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: lintSection,
                      size: 'xs',
                      color: '#ff6b6b',
                      wrap: true,
                      margin: 'none',
                    },
                  ],
                  paddingAll: 'md',
                  backgroundColor: '#ffe0e0',
                  cornerRadius: 'md',
                  marginTop: 'md',
                },
              ]
            : []),
        ],
        spacing: 'md',
        paddingAll: 'md',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '✅ 承認',
              data: `action=approve&id=${approval.id}`,
              displayText: '承認しました',
            },
            color: '#17c950',
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '❌ 却下',
              data: `action=reject&id=${approval.id}`,
              displayText: '却下しました',
            },
            color: '#e74c3c',
            margin: 'sm',
          },
        ],
        spacing: 'sm',
        paddingAll: 'md',
        backgroundColor: '#f9f9f9',
      },
    },
  }
}
