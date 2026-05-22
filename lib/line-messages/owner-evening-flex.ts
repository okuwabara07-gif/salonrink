import type { ChurnRiskCustomer } from '@/lib/owner-analytics/detect-churn-risk'
import type { ReviewCandidate } from '@/lib/owner-analytics/detect-review-candidates'

export interface FlexMessage {
  type: 'bubble' | 'carousel'
  body?: any
  footer?: any
  header?: any
}

function formatDate(date: Date): string {
  const m = date.getMonth() + 1
  const d = date.getDate()
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']
  const dayName = dayNames[date.getDay()]
  return `${m}月${d}日(${dayName})`
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`
}

export function buildOwnerEveningFlex(
  salonName: string,
  date: Date,
  todayRevenue: number,
  visitCount: number,
  newCustomerCount: number,
  draftKarteCount: number,
  churnRiskCustomers: ChurnRiskCustomer[],
  reviewCandidates: ReviewCandidate[],
  tomorrowCount: number,
  tomorrowPrice: number
): FlexMessage {
  const dateStr = formatDate(date)
  const accentColor = '#06C755'

  // Header
  const header = {
    type: 'box',
    layout: 'vertical',
    spacing: 'sm',
    backgroundColor: accentColor,
    paddingAll: '20px',
    contents: [
      {
        type: 'text',
        text: '🌙 本日のまとめ',
        size: 'xl',
        weight: 'bold',
        color: '#FFFFFF',
      },
      {
        type: 'text',
        text: dateStr,
        size: 'sm',
        color: '#FFFFFF',
        margin: 'md',
      },
    ],
  }

  const bodyContents: any[] = []

  // Today's performance
  bodyContents.push({
    type: 'box',
    layout: 'vertical',
    margin: 'md',
    spacing: 'sm',
    paddingAll: '16px',
    backgroundColor: '#F5F5F5',
    contents: [
      {
        type: 'box',
        layout: 'baseline',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: '売上',
            size: 'sm',
            color: '#999999',
            flex: 0,
          },
          {
            type: 'text',
            text: formatPrice(todayRevenue),
            size: 'md',
            weight: 'bold',
            color: '#2C2C2C',
            flex: 1,
            align: 'right',
          },
        ],
      },
      {
        type: 'box',
        layout: 'baseline',
        spacing: 'md',
        margin: 'sm',
        contents: [
          {
            type: 'text',
            text: '来店',
            size: 'sm',
            color: '#999999',
            flex: 0,
          },
          {
            type: 'text',
            text: `${visitCount}件`,
            size: 'md',
            weight: 'bold',
            color: '#2C2C2C',
            flex: 1,
            align: 'right',
          },
        ],
      },
      {
        type: 'box',
        layout: 'baseline',
        spacing: 'md',
        margin: 'sm',
        contents: [
          {
            type: 'text',
            text: '新規',
            size: 'sm',
            color: '#999999',
            flex: 0,
          },
          {
            type: 'text',
            text: `${newCustomerCount}人`,
            size: 'md',
            weight: 'bold',
            color: '#06C755',
            flex: 1,
            align: 'right',
          },
        ],
      },
    ],
  })

  // Draft kartes
  if (draftKarteCount > 0) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      spacing: 'sm',
      paddingAll: '12px',
      backgroundColor: '#E7F3FF',
      contents: [
        {
          type: 'text',
          text: `📋 AIカルテ生成済み ${draftKarteCount}件`,
          size: 'sm',
          color: '#0066CC',
          weight: 'bold',
        },
        {
          type: 'text',
          text: 'ダッシュボードで承認待ち',
          size: 'xs',
          color: '#0066CC',
          margin: 'sm',
        },
      ],
    })
  }

  // Churn risk details
  if (churnRiskCustomers.length > 0) {
    const displayCount = Math.min(churnRiskCustomers.length, 5)
    const churnNames = churnRiskCustomers.slice(0, displayCount).map(c => c.customerName).join('、')
    const remaining = churnRiskCustomers.length - displayCount

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      spacing: 'sm',
      paddingAll: '12px',
      backgroundColor: '#F8D7DA',
      contents: [
        {
          type: 'text',
          text: `⚠️ 離脱予兆 ${churnRiskCustomers.length}人`,
          size: 'sm',
          color: '#721C24',
          weight: 'bold',
        },
        {
          type: 'text',
          text: churnNames + (remaining > 0 ? `、+${remaining}名` : ''),
          size: 'xs',
          color: '#721C24',
          margin: 'sm',
          wrap: true,
        },
      ],
    })
  }

  // Review candidates
  if (reviewCandidates.length > 0) {
    const displayCount = Math.min(reviewCandidates.length, 3)
    const reviewNames = reviewCandidates
      .slice(0, displayCount)
      .map(c => {
        let label = c.customerName
        if (c.isFirstVisit) label += ' 🆕'
        if (c.isVip) label += ' ⭐'
        return label
      })
      .join('、')

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      spacing: 'sm',
      paddingAll: '12px',
      backgroundColor: '#FFF3CD',
      contents: [
        {
          type: 'text',
          text: `⭐ 口コミ依頼候補 ${reviewCandidates.length}人`,
          size: 'sm',
          color: '#856404',
          weight: 'bold',
        },
        {
          type: 'text',
          text: reviewNames + (reviewCandidates.length > displayCount ? `、+${reviewCandidates.length - displayCount}人` : ''),
          size: 'xs',
          color: '#856404',
          margin: 'sm',
          wrap: true,
        },
      ],
    })
  }

  // Tomorrow preview
  bodyContents.push({
    type: 'box',
    layout: 'vertical',
    margin: 'md',
    spacing: 'sm',
    paddingAll: '16px',
    backgroundColor: '#F0F8FF',
    contents: [
      {
        type: 'text',
        text: `📅 明日の予約 ${tomorrowCount}件 / ${formatPrice(tomorrowPrice)}`,
        size: 'sm',
        weight: 'bold',
        color: '#0066CC',
      },
    ],
  })

  // Footer
  const footer = {
    type: 'box',
    layout: 'vertical',
    spacing: 'sm',
    margin: 'md',
    paddingAll: '16px',
    backgroundColor: '#F5F5F5',
    contents: [
      {
        type: 'button',
        style: 'primary',
        height: 'sm',
        action: {
          type: 'uri',
          label: 'ダッシュボードを開く',
          uri: 'https://salonrink.com/dashboard',
        },
        color: accentColor,
      },
      {
        type: 'text',
        text: '今日もお疲れさまでした',
        size: 'xs',
        color: '#999999',
        align: 'center',
        margin: 'md',
      },
    ],
  }

  return {
    type: 'bubble',
    header,
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: bodyContents,
    },
    footer,
  }
}
