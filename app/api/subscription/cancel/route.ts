import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { cancellation_reason } = body

    // Get subscription info
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, cancel_at_period_end')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    if (subscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'Subscription is already marked for cancellation' },
        { status: 409 }
      )
    }

    // Cancel subscription (at period end)
    const stripe = getStripe()
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
      metadata: {
        cancellation_reason: cancellation_reason || '',
        cancelled_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Subscription marked for cancellation',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Subscription cancel error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: errorMessage },
      { status: 500 }
    )
  }
}
