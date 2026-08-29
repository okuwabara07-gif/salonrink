// Owner OA Rich Menu SVG Template
// 2500x1686px, 6-square grid (3x2)
// Design Token T colors + green accent (#06C755)

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function generateOwnerRichMenuSvg(): string {
  const width = 2500
  const height = 1686
  const cols = 3
  const rows = 2
  const squareWidth = width / cols // 833.33px
  const squareHeight = height / rows // 843px
  const gridColor = '#E5E5E5'
  const bgColor = '#FFFBF7' // cream
  const accentGreen = '#06C755'
  const darkText = '#2C2C2C'

  const items = [
    {
      emoji: '📅',
      label: '今日の予約',
      desc: 'Booking',
      accentColor: '#3366FF',
      col: 0,
      row: 0,
    },
    {
      emoji: '📋',
      label: 'カルテ',
      desc: 'Records',
      accentColor: '#FF6B6B',
      col: 1,
      row: 0,
    },
    {
      emoji: '👥',
      label: '顧客',
      desc: 'Customers',
      accentColor: '#9933FF',
      col: 2,
      row: 0,
    },
    {
      emoji: '✂️',
      label: 'メニュー',
      desc: 'Menu',
      accentColor: '#FF9933',
      col: 0,
      row: 1,
    },
    {
      emoji: '⚙️',
      label: '設定',
      desc: 'Settings',
      accentColor: '#00B8A9',
      col: 1,
      row: 1,
    },
    {
      emoji: '💬',
      label: 'サポート',
      desc: 'Support',
      accentColor: accentGreen,
      col: 2,
      row: 1,
      isSupport: true,
    },
  ]

  // Grid lines (vertical + horizontal)
  const gridLines = items
    .map((item) => {
      const x = item.col * squareWidth
      const y = item.row * squareHeight
      return `<line x1="${x}" y1="${item.row * squareHeight}" x2="${x}" y2="${(item.row + 1) * squareHeight}" stroke="${gridColor}" stroke-width="3"/>`
    })
    .concat([
      // Top and bottom horizontal lines
      `<line x1="0" y1="0" x2="${width}" y2="0" stroke="${gridColor}" stroke-width="3"/>`,
      `<line x1="0" y1="${squareHeight}" x2="${width}" y2="${squareHeight}" stroke="${gridColor}" stroke-width="3"/>`,
      `<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="${gridColor}" stroke-width="3"/>`,
      // Vertical lines
      `<line x1="${squareWidth}" y1="0" x2="${squareWidth}" y2="${height}" stroke="${gridColor}" stroke-width="3"/>`,
      `<line x1="${squareWidth * 2}" y1="0" x2="${squareWidth * 2}" y2="${height}" stroke="${gridColor}" stroke-width="3"/>`,
      `<line x1="${width}" y1="0" x2="${width}" y2="${height}" stroke="${gridColor}" stroke-width="3"/>`,
    ])
    .join('\n')

  const squareContents = items
    .map((item) => {
      const x = item.col * squareWidth
      const y = item.row * squareHeight
      const cx = x + squareWidth / 2
      const cy = y + squareHeight / 2

      const emojiSize = 200
      const labelFontSize = 160
      const descFontSize = 70

      return `
    <!-- Square (${item.col}, ${item.row}): ${escapeXml(item.label)} -->
    <g>
      <!-- Color accent bar (top) -->
      <rect x="${x}" y="${y}" width="${squareWidth}" height="80" fill="${item.accentColor}" opacity="${item.isSupport ? 0.25 : 0.12}"/>

      <!-- Emoji -->
      <text x="${cx}" y="${cy - 120}" font-size="${emojiSize}" text-anchor="middle" dominant-baseline="middle">${item.emoji}</text>

      <!-- Label (Japanese) -->
      <text x="${cx}" y="${cy + 100}" font-family="sans-serif" font-size="${labelFontSize}" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="${darkText}">${escapeXml(item.label)}</text>

      <!-- Description (English) -->
      <text x="${cx}" y="${cy + 240}" font-family="sans-serif" font-size="${descFontSize}" font-weight="400" text-anchor="middle" dominant-baseline="middle" fill="${item.accentColor}" opacity="0.7">${escapeXml(item.desc)}</text>
    </g>
    `
    })
    .join('\n')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${bgColor}"/>

  <!-- Grid lines -->
  ${gridLines}

  <!-- Squares -->
  ${squareContents}
</svg>`

  return svg
}

// Generate click areas for rich menu
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

export function generateRichMenuAreas(): RichMenuArea[] {
  const width = 2500
  const height = 1686
  const cols = 3
  const rows = 2
  const squareWidth = width / cols
  const squareHeight = height / rows

  const actions = [
    { label: 'booking', type: 'uri' as const, uri: 'https://liff.line.me/2010171194-dkeKAzwz/booking' },
    { label: 'records', type: 'uri' as const, uri: 'https://liff.line.me/2010171194-dkeKAzwz/cons' },
    { label: 'customers', type: 'uri' as const, uri: 'https://liff.line.me/2010171194-dkeKAzwz/customers' },
    { label: 'menu', type: 'uri' as const, uri: 'https://liff.line.me/2010171194-dkeKAzwz/settings' },
    { label: 'settings', type: 'uri' as const, uri: 'https://liff.line.me/2010171194-dkeKAzwz/settings' },
    { label: 'support', type: 'postback' as const, data: 'action=help' },
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
        type: action.type,
        label: action.label,
        uri: action.uri,
        data: action.data,
      },
    }
  })
}
