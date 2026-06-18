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
      const site = String(sns.site || '-')
      const platform = String(sns.platform || '-')
      const caption = String(sns.caption || '(未指定)')
      title = `📱 SNS投稿 - ${site}/${platform}`
      subtitle = caption.length > 0 ? `キャプション: "${caption.substring(0, 30)}"` : 'キャプション: (未指定)'
      payloadDisplay = `📌 サイト: ${site}\n📌 プラットフォーム: ${platform}\n📌 トピック: ${String(sns.topic || '-')}\n📌 コンプラ: ${approval.lint_status === 'pass' ? '✅ Pass' : '⚠️ Flag'}`
      break
    }

    case 'nurture_msg': {
      const nurture = approval.payload as Record<string, unknown>
      const channel = String(nurture.channel || '-')
      const step = String(nurture.sequence_step || '-')
      const scheduled = String(nurture.scheduled_at || '-')
      title = '📧 フォロー送信'
      subtitle = `チャネル: ${channel}`
      payloadDisplay = `📌 チャネル: ${channel}\n📌 Step: ${step}\n📌 スケジュール: ${scheduled}\n📌 コンプラ: ${approval.lint_status === 'pass' ? '✅ Pass' : '⚠️ Flag'}`
      break
    }

    case 'outbound': {
      const outbound = approval.payload as Record<string, unknown>
      const type = String(outbound.outbound_type || '-')
      const target = String(outbound.webhook_url || outbound.target || '-')
      title = '🔗 外部連携'
      subtitle = `タイプ: ${type}`
      payloadDisplay = `📌 タイプ: ${type}\n📌 ターゲット: ${target}\n📌 コンプラ: ${approval.lint_status === 'pass' ? '✅ Pass' : '⚠️ Flag'}`
      break
    }

    case 'product_push': {
      const product = approval.payload as Record<string, unknown>
      const productId = String(product.product_id || '-')
      const segment = String(product.target_segment || '-')
      title = '🛍️ 商品プッシュ'
      subtitle = `商品: ${productId}`
      payloadDisplay = `📌 商品ID: ${productId}\n📌 ターゲット: ${segment}\n📌 コンプラ: ${approval.lint_status === 'pass' ? '✅ Pass' : '⚠️ Flag'}`
      break
    }

    default:
      title = '⚙️ 承認待機'
      subtitle = `種別: ${approval.kind || '未定義'}`
      payloadDisplay = `📌 ID: ${approval.id}\n📌 種別: ${approval.kind || '未定義'}`
  }

  // payloadDisplay が空の場合はデフォルト
  if (!payloadDisplay || payloadDisplay.trim() === '') {
    payloadDisplay = '📌 詳細情報は利用できません'
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
