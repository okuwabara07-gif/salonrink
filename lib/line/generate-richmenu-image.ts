import sharp from 'sharp'
import { generateOwnerRichMenuSvg } from '@/lib/line-messages/owner-richmenu-svg'

export async function generateOwnerRichMenuImage(): Promise<Buffer> {
  try {
    const svg = generateOwnerRichMenuSvg()
    const svgBuffer = Buffer.from(svg)

    const pngBuffer = await sharp(svgBuffer).png().toBuffer()

    return pngBuffer
  } catch (error) {
    throw new Error(
      `Failed to generate rich menu image: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
