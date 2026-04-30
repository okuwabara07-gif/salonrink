import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VPS_URL = process.env.HPB_VPS_URL || 'http://160.251.213.197'
const VPS_API_KEY = process.env.HPB_VPS_API_KEY
const VPS_TEST_ENDPOINT = `${VPS_URL}/test`
const VPS_REQUEST_TIMEOUT = 60000 // 60秒

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // VPS API キー確認
    if (!VPS_API_KEY) {
      console.error('HPB test connection: VPS_API_KEY not configured')
      return NextResponse.json(
        { success: false, message: 'サーバー設定エラー: VPS API キー未設定' },
        { status: 500 }
      )
    }

    const { hpb_login_id, hpb_password, hpb_salon_id } = await req.json()

    if (!hpb_login_id || !hpb_password || !hpb_salon_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // VPS /test エンドポイント呼び出し
    console.log(`HPB test connection: Calling VPS ${VPS_TEST_ENDPOINT}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), VPS_REQUEST_TIMEOUT)

    try {
      const vpsResponse = await fetch(VPS_TEST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VPS_API_KEY}`,
        },
        body: JSON.stringify({
          hpb_login_id,
          hpb_password,
          hpb_salon_id,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!vpsResponse.ok) {
        const vpsError = await vpsResponse.json().catch(() => ({}))
        console.error('HPB test connection: VPS error', { status: vpsResponse.status, error: vpsError })
        return NextResponse.json(
          {
            success: false,
            message: vpsError.message || 'HPB接続テストに失敗しました。ログインIDとパスワードを確認してください。',
            error_code: vpsError.code,
          },
          { status: 200 }
        )
      }

      const vpsData = await vpsResponse.json()
      console.log('HPB test connection: VPS success', { shop_name: vpsData.shop_name })

      return NextResponse.json({
        success: true,
        message: '接続成功',
        shop_name: vpsData.shop_name || '不明',
        shop_id: vpsData.shop_id || hpb_salon_id,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('HPB test connection: VPS timeout')
        return NextResponse.json(
          {
            success: false,
            message: 'VPS接続がタイムアウトしました。ネットワークを確認してください。',
          },
          { status: 200 }
        )
      }

      console.error('HPB test connection: Fetch error', fetchError)
      return NextResponse.json(
        {
          success: false,
          message: 'VPS接続エラーが発生しました。しばらく経ってからお試しください。',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('HPB test connection: Error', errorMsg)
    return NextResponse.json(
      {
        success: false,
        message: 'エラーが発生しました',
        details: errorMsg,
      },
      { status: 500 }
    )
  }
}
