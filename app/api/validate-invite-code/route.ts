import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'コードを入力してください' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: inviteCode, error } = await supabase
      .from('invite_codes')
      .select('id, code, is_active')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !inviteCode) {
      return NextResponse.json(
        { valid: false, error: '無効な招待コードです' },
        { status: 400 }
      )
    }

    if (!inviteCode.is_active) {
      return NextResponse.json(
        { valid: false, error: 'このコードは使用できません' },
        { status: 400 }
      )
    }

    // 使用回数をインクリメント
    await supabase
      .from('invite_codes')
      .update({ usage_count: inviteCode.usage_count + 1 })
      .eq('id', inviteCode.id)

    return NextResponse.json({
      valid: true,
      plan: 'free',
      message: '招待コードが有効です'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Validate invite code error:', errorMessage)
    return NextResponse.json(
      { valid: false, error: 'コード検証に失敗しました' },
      { status: 500 }
    )
  }
}
