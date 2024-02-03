import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import {
  manageSubscriptionStatusChange,
  upsertPriceRecord,
  upsertProductRecord
} from '@/lib/supabase-admin';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (signature == null || secret == null) return;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    const message = `Webhook error: ${JSON.stringify(error)}`;
    console.log(message);
    return new Response(message, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          }
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response(
        'Webhook handler failed. View your nextjs function logs.',
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
