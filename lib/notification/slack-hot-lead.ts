interface HotLeadSlackParams {
  email: string
  contact_name?: string | null
  salon_name?: string | null
  score: number
  leadId: string
}

export async function notifySlackHotLead(params: HotLeadSlackParams): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('[slack-hot-lead] SLACK_WEBHOOK_URL not configured')
    return false
  }

  const message = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🔥 ホットリード検出!' }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*リードID:*\n${params.leadId}` },
          { type: 'mrkdwn', text: `*スコア:*\n${params.score}` },
          { type: 'mrkdwn', text: `*メール:*\n${params.email}` },
          { type: 'mrkdwn', text: `*サロン名:*\n${params.salon_name || '(未登録)'}` },
          { type: 'mrkdwn', text: `*担当者名:*\n${params.contact_name || '(未登録)'}` },
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'ホットリードメールを送信しました。返信があれば対応してください。'
        }
      }
    ]
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error(`[slack-hot-lead] HTTP ${response.status}`)
      return false
    }

    console.log(`[slack-hot-lead] Notified for lead ${params.leadId}`)
    return true
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[slack-hot-lead] Failed:', errMsg)
    return false
  }
}
