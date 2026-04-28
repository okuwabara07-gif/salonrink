import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const TEST_CONNECTION_TIMEOUT = 5000 // 5秒

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('LINE test-connection: No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('LINE test-connection: User authenticated:', user.id)

    const body = await req.json()
    const { channel_access_token } = body

    if (!channel_access_token) {
      return NextResponse.json(
        { error: 'Channel Access Token is required' },
        { status: 400 }
      )
    }

    console.log('LINE test-connection: Testing token validity')

    // LINE API: Get bot info with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TEST_CONNECTION_TIMEOUT)

    let response
    try {
      response = await fetch('https://api.line.me/v2/bot/info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${channel_access_token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('LINE test-connection: Timeout after 5 seconds')
        return NextResponse.json(
          { error: 'LINE APIへの接続がタイムアウトしました' },
          { status: 504 }
        )
      }
      throw fetchError
    }

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('LINE API error:', { status: response.status, data: errorData })

      let errorMessage = 'Connection failed'

      if (response.status === 401) {
        errorMessage = 'Channel Access Token が無効です。LINE Developers Console で確認してください。'
      } else if (response.status === 429) {
        errorMessage = 'リクエスト制限に達しました。しばらく待ってから再度お試しください。'
      } else if (response.status === 400) {
        errorMessage = 'リクエスト形式が不正です。Channel Access Token を確認してください。'
      } else {
        errorMessage = errorData.message || `LINE API エラー (HTTP ${response.status})`
      }

      return NextResponse.json(
        { error: errorMessage, status: response.status },
        { status: response.status }
      )
    }

    const botInfo = await response.json()
    console.log('LINE test-connection: Success', { botId: botInfo.userId })

    return NextResponse.json({
      success: true,
      message: '接続に成功しました',
      bot_info: {
        user_id: botInfo.userId,
        display_name: botInfo.displayName,
        status_message: botInfo.statusMessage,
        icon_url: botInfo.iconUrl,
      },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('LINE test-connection: Error', errorMsg)

    return NextResponse.json(
      { error: 'Internal server error', details: errorMsg },
      { status: 500 }
    )
  }
}
