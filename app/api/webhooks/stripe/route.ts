import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  const body = await req.text()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return Response.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const stripe = getStripe()
  const supabase = createAdminClient()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.client_reference_id
        const customerId = session.customer
        const subscriptionId = session.subscription
        const plan = session.metadata?.plan || 'basic'

        if (!userId || !customerId || !subscriptionId) {
          console.warn('Incomplete session data:', {
            userId,
            customerId,
            subscriptionId,
          })
          break
        }

        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId as string
        )) as any

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          plan,
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const customerId = subscription.customer
        const status = subscription.status

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (sub) {
          await supabase
            .from('subscriptions')
            .update({
              status,
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('id', sub.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const customerId = subscription.customer

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        console.error('Payment failed for invoice:', invoice.id, {
          customerId: invoice.customer,
          amount: invoice.amount_due,
          reason: invoice.status_transitions?.finalized_at,
        })
        break
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
