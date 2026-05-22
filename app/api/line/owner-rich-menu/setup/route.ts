import { generateOwnerRichMenuImage } from '@/lib/line/generate-richmenu-image'
import {
  createOwnerRichMenu,
  uploadOwnerRichMenuImage,
  setDefaultOwnerRichMenu,
} from '@/lib/line/owner-richmenu-api'

// POST /api/line/owner-rich-menu/setup
// Sets up the owner OA rich menu (admin operation)
// Requires ADMIN_SECRET Bearer token authentication

export async function POST(request: Request) {
  try {
    // Verify ADMIN_SECRET
    const authHeader = request.headers.get('Authorization') || ''
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret) {
      console.error('[Owner RichMenu Setup] ADMIN_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Admin secret not configured' }),
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${adminSecret}`) {
      console.error('[Owner RichMenu Setup] Unauthorized')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
      })
    }

    // Get LINE credentials
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
    console.log('[Owner RichMenu Setup] Generating image...')
    const imageBuffer = await generateOwnerRichMenuImage()
    console.log(`[Owner RichMenu Setup] Image generated: ${imageBuffer.length} bytes`)

    // Step 2: Create rich menu
    console.log('[Owner RichMenu Setup] Creating rich menu...')
    const richMenuId = await createOwnerRichMenu(channelToken, 'owner-dashboard-v1')
    console.log(`[Owner RichMenu Setup] Rich menu created: ${richMenuId}`)

    // Step 3: Upload image
    console.log('[Owner RichMenu Setup] Uploading rich menu image...')
    await uploadOwnerRichMenuImage(richMenuId, imageBuffer, channelToken)
    console.log('[Owner RichMenu Setup] Image uploaded')

    // Step 4: Set as default
    console.log('[Owner RichMenu Setup] Setting as default rich menu...')
    await setDefaultOwnerRichMenu(richMenuId, channelToken)
    console.log('[Owner RichMenu Setup] Rich menu set as default')

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
