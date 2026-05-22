import type { TodayBooking } from '@/lib/owner-bookings/get-today-bookings'
import type { ChurnRiskCustomer } from '@/lib/owner-analytics/detect-churn-risk'
import type { AllergyWarning } from '@/lib/owner-analytics/detect-allergy-warnings'

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

export function buildOwnerMorningFlex(
  salonName: string,
  date: Date,
  bookings: TodayBooking[],
  totalPrice: number,
  churnRiskCustomers: ChurnRiskCustomer[],
  allergyWarnings: AllergyWarning[]
): FlexMessage {
  const dateStr = formatDate(date)
  const accentColor = '#06C755'

  // Header section
  const header = {
    type: 'box',
    layout: 'vertical',
    spacing: 'sm',
    backgroundColor: accentColor,
    paddingAll: '20px',
    contents: [
      {
        type: 'text',
        text: '🌅 今日の予約',
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

  // Summary section with count + expected revenue
  const bookingCount = bookings.length
  let summaryText: string
  if (bookingCount === 0) {
    summaryText = '本日の予約はありません'
  } else {
    const priceText = totalPrice > 0 ? ` / 予想売上 ${formatPrice(totalPrice)}` : ''
    summaryText = `${bookingCount}件${priceText}`
  }

  const bodyContents: any[] = [
    {
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      spacing: 'sm',
      paddingAll: '16px',
      contents: [
        {
          type: 'text',
          text: summaryText,
          size: 'xxl',
          weight: 'bold',
          color: '#2C2C2C',
          align: 'center',
        },
      ],
    },
  ]

  // Allergy warnings section (if any)
  if (allergyWarnings.length > 0) {
    const allergyNames = allergyWarnings.map(a => a.customerName).join('、')
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
          text: `⚠️ アレルギー注意 ${allergyWarnings.length}件 (${allergyNames})`,
          size: 'sm',
          color: '#856404',
          weight: 'bold',
          wrap: true,
        },
      ],
    })
  }

  // Booking list (max 10)
  if (bookingCount > 0) {
    const bookingItems: any[] = []
    const displayCount = Math.min(bookings.length, 10)

    for (let i = 0; i < displayCount; i++) {
      const b = bookings[i]
      bookingItems.push({
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        margin: 'md',
        contents: [
          {
            type: 'box',
            layout: 'baseline',
            spacing: 'md',
            contents: [
              {
                type: 'text',
                text: b.time,
                size: 'sm',
                weight: 'bold',
                color: '#2C2C2C',
                flex: 0,
              },
              {
                type: 'text',
                text: `${b.customerName} 様`,
                size: 'sm',
                color: '#2C2C2C',
                flex: 1,
              },
            ],
          },
          {
            type: 'text',
            text: b.menuName,
            size: 'xs',
            color: '#999999',
            margin: 'sm',
          },
        ],
      })

      // Add separator between bookings
      if (i < displayCount - 1) {
        bookingItems.push({
          type: 'separator',
          margin: 'md',
        })
      }
    }

    // If more than 10, add "+N件" indicator
    if (bookings.length > 10) {
      const remaining = bookings.length - 10
      bookingItems.push({
        type: 'separator',
        margin: 'md',
      })
      bookingItems.push({
        type: 'text',
        text: `+${remaining}件、ダッシュボードで全件確認`,
        size: 'xs',
        color: '#06C755',
        weight: 'bold',
        align: 'center',
        margin: 'md',
      })
    }

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      spacing: 'sm',
      paddingAll: '16px',
      contents: bookingItems,
    })
  }

  // Churn risk section (if any)
  if (churnRiskCustomers.length > 0) {
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
          text: '詳細は夜のサマリでご確認ください',
          size: 'xs',
          color: '#721C24',
          margin: 'sm',
        },
      ],
    })
  }

  // Footer with button and text
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
          uri: 'https://salonrink.com/liff/dashboard',
        },
        color: accentColor,
      },
      {
        type: 'text',
        text: 'お気をつけて、いってらっしゃい',
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
