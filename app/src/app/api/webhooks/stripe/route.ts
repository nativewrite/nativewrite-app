import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

async function getEmailFromSubscription(subscription: Stripe.Subscription): Promise<string | null> {
  const customerRef = subscription.customer;
  if (!customerRef) return null;
  if (typeof customerRef === 'string') {
    const cust = await stripe.customers.retrieve(customerRef);
    if ('deleted' in cust && cust.deleted) return null;
    return (cust as Stripe.Customer).email ?? null;
  }
  // customerRef is expanded
  if ('deleted' in customerRef && customerRef.deleted) return null;
  return (customerRef as Stripe.Customer).email ?? null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'invoice.payment_succeeded':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const email = await getEmailFromSubscription(subscription);
        if (email) {
          await supabase
            .from('profiles')
            .update({ subscription_status: subscription.status })
            .eq('email', email);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const email = await getEmailFromSubscription(subscription);
        if (email) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'canceled' })
            .eq('email', email);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
