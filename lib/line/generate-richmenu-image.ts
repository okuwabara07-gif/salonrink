import sharp from 'sharp'
import { generateOwnerRichMenuSvg } from '@/lib/line-messages/owner-richmenu-svg'

// Generate PNG image from SVG for owner rich menu
export async function generateOwnerRichMenuImage(): Promise<Buffer> {
  const svg = generateOwnerRichMenuSvg()

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer()

  return buffer
}

// Type for rich menu image upload response from LINE
export type RichMenuImageResponse = {
  status: number
  body: string
}
