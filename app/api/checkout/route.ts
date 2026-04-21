import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let plan: string
    try {
      const body = await req.json()
      plan = body.plan
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!plan || !['basic', 'small', 'medium'].includes(plan)) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const PRICE_IDS: Record<string, string | undefined> = {
      basic: process.env.STRIPE_PRICE_ID_BASIC,
      small: process.env.STRIPE_PRICE_ID_SMALL,
      medium: process.env.STRIPE_PRICE_ID_MEDIUM,
    }

    const priceId = PRICE_IDS[plan]
    if (!priceId) {
      console.error(`Missing price ID for plan: ${plan}`)
      return Response.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set')
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'https://salonrink.com'
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: { plan },
      },
      metadata: { plan },
      client_reference_id: user.id,
      customer_email: user.email,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      allow_promotion_codes: true,
    })

    if (!session.url) {
      console.error('Stripe session created but no URL returned')
      return Response.json(
        { error: 'Failed to get checkout URL' },
        { status: 500 }
      )
    }

    return Response.json({ url: session.url })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Checkout error:', errorMessage, error)
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
