import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  try {
    const iconPath = path.join(process.cwd(), 'public/logo/favicon-180.png')
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
          fontSize: '80px',
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
