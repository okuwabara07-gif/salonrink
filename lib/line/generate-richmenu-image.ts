// Static PNG approach: pre-rendered locally on Mac (Japanese fonts available)
// Committed at public/line/owner-richmenu.png
// Fetched at runtime via Vercel CDN to avoid librsvg font issues on serverless

export async function generateOwnerRichMenuImage(): Promise<Buffer> {
  const url = 'https://salonrink.com/line/owner-richmenu.png'
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch owner rich menu PNG: ${response.status} ${response.statusText}`
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
