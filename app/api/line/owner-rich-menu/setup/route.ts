import { generateOwnerRichMenuImage } from '@/lib/line/generate-richmenu-image'
import {
  createOwnerRichMenu,
  uploadOwnerRichMenuImage,
  setDefaultOwnerRichMenu,
} from '@/lib/line/owner-richmenu-api'

export async function POST(request: Request) {
  try {
    // Verify ADMIN_SECRET authentication
    const authHeader = request.headers.get('Authorization') || ''
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret) {
      console.error('[Owner RichMenu Setup] ADMIN_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Admin secret not configured' }),
        { status: 500 }
      )
    }

    const expectedAuth = `Bearer ${adminSecret}`
    if (authHeader !== expectedAuth) {
      console.error('[Owner RichMenu Setup] Invalid authorization header')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
      })
    }

    // Verify LINE credentials
    const channelToken = process.env.LINE_OWNER_CHANNEL_ACCESS_TOKEN

    if (!channelToken) {
      console.error('[Owner RichMenu Setup] LINE_OWNER_CHANNEL_ACCESS_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'LINE credentials not configured' }),
        { status: 500 }
      )
    }

    console.log('[Owner RichMenu Setup] Starting rich menu setup...')

    // Step 1: Generate SVG → PNG
    console.log('[Owner RichMenu Setup] Generating PNG image from SVG...')
    const imageBuffer = await generateOwnerRichMenuImage()
    console.log(
      `[Owner RichMenu Setup] Image generated: ${imageBuffer.length} bytes`
    )

    // Step 2: Create rich menu
    console.log('[Owner RichMenu Setup] Creating rich menu via LINE API...')
    const richMenuId = await createOwnerRichMenu(channelToken)
    console.log(`[Owner RichMenu Setup] Rich menu created: ${richMenuId}`)

    // Step 3: Upload image
    console.log('[Owner RichMenu Setup] Uploading rich menu image...')
    await uploadOwnerRichMenuImage(richMenuId, imageBuffer, channelToken)
    console.log('[Owner RichMenu Setup] Image uploaded successfully')

    // Step 4: Set as default
    console.log('[Owner RichMenu Setup] Setting as default rich menu...')
    await setDefaultOwnerRichMenu(richMenuId, channelToken)
    console.log('[Owner RichMenu Setup] Rich menu set as default')

    console.log('[Owner RichMenu Setup] Rich menu setup completed')

    return new Response(
      JSON.stringify({
        status: 'ok',
        richMenuId,
        message: 'Owner rich menu setup completed successfully',
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('[Owner RichMenu Setup] Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to setup rich menu',
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    )
  }
}
