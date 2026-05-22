// Owner OA Rich Menu SVG Template
// 2500x1686px, 6-square grid (3x2)
// Design Token T colors + green accent (#06C755)

export function generateOwnerRichMenuSvg(): string {
  const width = 2500
  const height = 1686
  const cols = 3
  const rows = 2
  const squareWidth = width / cols // 833px each
  const squareHeight = height / rows // 843px each
  const gridColor = '#E8E8E8'
  const bgColor = '#FFFBF7' // cream background
  const accentGreen = '#06C755'
  const darkText = '#2C2C2C'

  const items = [
    {
      label: '今日の予約',
      emoji: '📅',
      description: 'Booking Summary',
      color: '#3366FF', // token blue
      col: 0,
      row: 0,
    },
    {
      label: 'カルテ',
      emoji: '📋',
      description: 'Client Cards',
      color: '#FF6B6B', // token red
      col: 1,
      row: 0,
    },
    {
      label: '顧客',
      emoji: '👥',
      description: 'Customers',
      color: '#9933FF', // token purple
      col: 2,
      row: 0,
    },
    {
      label: 'メニュー',
      emoji: '✂️',
      description: 'Menu',
      color: '#FF9933', // token orange
      col: 0,
      row: 1,
    },
    {
      label: '設定',
      emoji: '⚙️',
      description: 'Settings',
      color: '#00B8A9', // token teal
      col: 1,
      row: 1,
    },
    {
      label: 'サポート',
      emoji: '💬',
      description: 'Support',
      color: accentGreen,
      col: 2,
      row: 1,
      isSupport: true,
    },
  ]

  // Embed fonts as data URIs (fallback: system fonts)
  const fontFaces = `
    <defs>
      <style>
        @font-face {
          font-family: 'Noto Serif JP';
          font-weight: 700;
          src: local('Noto Serif JP Bold'), local('NotoSerifJP-Bold');
        }
        @font-face {
          font-family: 'Noto Sans JP';
          font-weight: 400;
          src: local('Noto Sans JP'), local('NotoSansJP-Regular');
        }
        @font-face {
          font-family: 'Noto Sans JP';
          font-weight: 500;
          src: local('Noto Sans JP Medium'), local('NotoSansJP-Medium');
        }
      </style>
    </defs>
  `

  const gridLines = items
    .map(
      (item) => `
    <!-- Grid lines for square (${item.col}, ${item.row}) -->
    <line x1="${item.col * squareWidth}" y1="${item.row * squareHeight}"
          x2="${(item.col + 1) * squareWidth}" y2="${item.row * squareHeight}"
          stroke="${gridColor}" stroke-width="2"/>
    <line x1="${item.col * squareWidth}" y1="${(item.row + 1) * squareHeight}"
          x2="${(item.col + 1) * squareWidth}" y2="${(item.row + 1) * squareHeight}"
          stroke="${gridColor}" stroke-width="2"/>
    <line x1="${item.col * squareWidth}" y1="${item.row * squareHeight}"
          x2="${item.col * squareWidth}" y2="${(item.row + 1) * squareHeight}"
          stroke="${gridColor}" stroke-width="2"/>
    <line x1="${(item.col + 1) * squareWidth}" y1="${item.row * squareHeight}"
          x2="${(item.col + 1) * squareWidth}" y2="${(item.row + 1) * squareHeight}"
          stroke="${gridColor}" stroke-width="2"/>
    `
    )
    .join('')

  const squareContents = items
    .map((item) => {
      const x = item.col * squareWidth
      const y = item.row * squareHeight
      const cx = x + squareWidth / 2
      const cy = y + squareHeight / 2
      const emojiSize = 360
      const labelSize = 100
      const descSize = 60

      return `
    <!-- Square (${item.col}, ${item.row}): ${item.label} -->
    <g>
      <!-- Color accent bar (top) -->
      <rect x="${x}" y="${y}" width="${squareWidth}" height="60" fill="${item.color}" opacity="0.15"/>

      <!-- Emoji -->
      <text x="${cx}" y="${cy - 180}"
            font-size="${emojiSize}" text-anchor="middle" dominant-baseline="middle">${item.emoji}</text>

      <!-- Label -->
      <text x="${cx}" y="${cy + 120}"
            font-family="Noto Serif JP" font-size="${labelSize}" font-weight="700"
            text-anchor="middle" dominant-baseline="middle" fill="${darkText}">
        ${item.label}
      </text>

      <!-- Description (English) -->
      <text x="${cx}" y="${cy + 220}"
            font-family="Noto Sans JP" font-size="${descSize}" font-weight="400"
            text-anchor="middle" dominant-baseline="middle" fill="${item.color}">
        ${item.description}
      </text>
    </g>
    `
    })
    .join('')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  ${fontFaces}

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${bgColor}"/>

  <!-- Grid lines -->
  ${gridLines}

  <!-- Squares content -->
  ${squareContents}

  <!-- Outer border -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${gridColor}" stroke-width="2"/>
</svg>`

  return svg
}

// Type for rich menu configuration
export type RichMenuArea = {
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  action: {
    type: 'uri' | 'postback'
    label: string
    uri?: string
    data?: string
  }
}

// Generate rich menu areas (click zones)
export function generateRichMenuAreas(): RichMenuArea[] {
  const cols = 3
  const rows = 2
  const width = 2500
  const height = 1686
  const squareWidth = width / cols
  const squareHeight = height / rows

  const actions = [
    {
      label: 'today-booking',
      uri: 'https://salonrink.com/dashboard/bookings',
    },
    {
      label: 'karte',
      uri: 'https://salonrink.com/dashboard/karte',
    },
    {
      label: 'customers',
      uri: 'https://salonrink.com/dashboard/customers',
    },
    {
      label: 'menu',
      uri: 'https://salonrink.com/dashboard/menu',
    },
    {
      label: 'settings',
      uri: 'https://salonrink.com/dashboard/settings',
    },
    {
      label: 'support',
      data: 'action=help',
      postback: true,
    },
  ]

  return actions.map((action, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    return {
      bounds: {
        x: col * squareWidth,
        y: row * squareHeight,
        width: squareWidth,
        height: squareHeight,
      },
      action: {
        type: action.postback ? 'postback' : 'uri',
        label: action.label,
        uri: action.uri,
        data: action.data,
      },
    }
  })
}
