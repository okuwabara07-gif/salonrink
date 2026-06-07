import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const size = {
  width: 192,
  height: 192,
}
export const contentType = 'image/png'

export default function Icon() {
  try {
    const iconPath = path.join(process.cwd(), 'public/logo/salonrink-mark.png')
    const image = fs.readFileSync(iconPath)
    return image
  } catch {
    // Fallback
    return new ImageResponse(
      <div
        style={{
          background: '#d4a574',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '100px',
          fontWeight: 'bold',
          color: '#fff',
        }}
      >
        S
      </div>,
      {
        ...size,
      }
    )
  }
}
