/**
 * lib/ig/compose-post.ts
 * Instagram カルーセル 1080x1080 画像合成
 *
 * 入力: hookText, cardContents[], baseImagePaths[]
 * 出力: /tmp/ig-drafts/{timestamp}/ に cover.png + card-1.png ... card-4.png
 */

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

interface ComposeInput {
  hookText: string
  cardContents: string[]
  baseImagePaths: string[]
  logoPath: string
}

interface ComposeOutput {
  outputDir: string
  files: string[]
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function resizeLogoForCard(logoPath: string): Promise<Buffer> {
  return sharp(logoPath)
    .resize(180, 273, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

async function composeCard(
  baseImagePath: string,
  overlayContent: {
    type: 'hook' | 'text'
    text: string
  },
  logoBuffer: Buffer
): Promise<Buffer> {
  const baseImage = fs.readFileSync(baseImagePath)

  // Step 1: Base image → 1080x1080 center-crop
  let composed = sharp(baseImage)
    .resize(1080, 1080, { fit: 'cover', position: 'center' })

  // Step 2: Create SVG overlay based on type
  let svgOverlay: string
  if (overlayContent.type === 'hook') {
    // 1枚目: 下半分に黒ベール + 大文字フック
    svgOverlay = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="textShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.6" />
        </filter>
      </defs>
      <rect x="0" y="540" width="1080" height="540" fill="rgba(0,0,0,0.45)" />
      <text
        x="540"
        y="620"
        text-anchor="middle"
        font-family="'Noto Serif JP', 'Noto Serif', 'Cormorant Garamond', serif"
        font-size="64"
        font-weight="700"
        fill="white"
        filter="url(#textShadow)"
      >${escapeXml(overlayContent.text)}</text>
    </svg>`
  } else {
    // 2-5枚目: 下部に白ベール + テキスト
    svgOverlay = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="600" width="1080" height="480" fill="rgba(255,255,255,0.85)" />
      <text
        x="540"
        y="720"
        text-anchor="middle"
        font-family="'Noto Serif JP', 'Noto Serif', 'Cormorant Garamond', serif"
        font-size="42"
        font-weight="500"
        fill="#2a1f15"
      >${escapeXml(overlayContent.text)}</text>
    </svg>`
  }

  // Step 3: Composite SVG overlay + logo
  composed = composed
    .composite([
      {
        input: Buffer.from(svgOverlay),
        left: 0,
        top: 0,
        blend: 'over',
      },
      {
        input: logoBuffer,
        left: 54,
        top: 54,
        blend: 'over',
      },
    ])
    .png()

  return composed.toBuffer()
}

export async function composeSocialPost(input: ComposeInput): Promise<ComposeOutput> {
  // Validate inputs
  if (!input.hookText || input.hookText.length === 0) {
    throw new Error('hookText is required')
  }
  if (!input.cardContents || input.cardContents.length !== 4) {
    throw new Error('cardContents must have exactly 4 items')
  }
  if (!input.baseImagePaths || input.baseImagePaths.length !== 5) {
    throw new Error('baseImagePaths must have exactly 5 items')
  }

  // Create output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const outputDir = path.join('/tmp', 'ig-drafts', timestamp)
  fs.mkdirSync(outputDir, { recursive: true })

  try {
    // Pre-process logo
    const resizedLogo = await resizeLogoForCard(input.logoPath)

    // Compose 1枚目: hookText
    console.log('[compose-post] Composing cover (hookText)...')
    const cover = await composeCard(
      input.baseImagePaths[0],
      { type: 'hook', text: input.hookText },
      resizedLogo
    )
    const coverPath = path.join(outputDir, 'cover.png')
    fs.writeFileSync(coverPath, cover)
    console.log(`[compose-post] Saved: ${coverPath}`)

    // Compose 2-5枚目: cardContents
    const files: string[] = ['cover.png']
    for (let i = 0; i < 4; i++) {
      console.log(`[compose-post] Composing card ${i + 1}/${4}...`)
      const cardBuffer = await composeCard(
        input.baseImagePaths[i + 1],
        { type: 'text', text: input.cardContents[i] },
        resizedLogo
      )
      const cardPath = path.join(outputDir, `card-${i + 1}.png`)
      fs.writeFileSync(cardPath, cardBuffer)
      files.push(`card-${i + 1}.png`)
      console.log(`[compose-post] Saved: ${cardPath}`)
    }

    return {
      outputDir,
      files,
    }
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true })
    }
    throw error
  }
}
