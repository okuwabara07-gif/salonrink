import { Resend } from 'resend'

interface HotLeadEmailParams {
  email: string
  contact_name?: string | null
  salon_name?: string | null
  score: number
}

export async function sendHotLeadEmail(params: HotLeadEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('[hot-lead] RESEND_API_KEY not configured')
    return false
  }

  const resend = new Resend(apiKey)

  // 挨拶文をパーソナライズ
  const greeting = params.contact_name
    ? (params.salon_name
        ? `${params.contact_name}様(${params.salon_name})`
        : `${params.contact_name}様`)
    : 'こんにちは'

  const html = `
    <p>${greeting}</p>

    <p>いつも SalonRink のコンテンツをご覧いただきありがとうございます。</p>

    <p>最近、料金や機能について何度かご確認いただいているようですね。<br>
    もしご質問やご相談がございましたら、ぜひお気軽にお声がけください。</p>

    <h3>ご検討に役立つかもしれません</h3>
    <ul>
      <li><strong>14日間無料トライアル</strong>(クレジットカード不要、すぐ始められます)</li>
      <li><strong>個別オンライン相談</strong>(30分・無料)</li>
      <li><strong>AIカルテのご案内</strong></li>
    </ul>

    <p>このメールにそのままご返信いただければ、私が直接お答えします。</p>

    <p>SalonRink 編集部<br>
    <a href="https://salonrink.com">salonrink.com</a></p>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@salonrink.com',
      to: params.email,
      subject: 'SalonRinkについて、お話しできる機会はございますか?',
      html,
    })

    if (error) {
      console.error('[hot-lead] Resend error:', error)
      return false
    }

    console.log(`[hot-lead] Email sent to ${params.email} (score: ${params.score})`)
    return true
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[hot-lead] Failed:', errMsg)
    return false
  }
}
