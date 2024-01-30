import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createOrRetrieveCustomer } from '@/lib/supabase-admin';
import { getURL } from '@/lib/utils';
import { Database } from '@/types/db';

export async function POST(req: Request) {
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405);

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: userData } = await supabase.auth.getUser();
    const { id: uuid, email } = userData.user ?? {};
    if (uuid == null) return errorResponse('Must be signed in');

    const customer = await createOrRetrieveCustomer({ uuid, email });
    const sessionParams = getSessionCreateParams(customer);
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    return errorResponse('Unknown');
  }
}

function errorResponse(reason: string, statusCode = 500) {
  return NextResponse.json({ status: 'error', reason }, { status: statusCode });
}

function getSessionCreateParams(
  customer: string,
  priceId: string = process.env.STRIPE_PRICE_ID ?? '',
  mode: 'payment' | 'subscription' = 'subscription'
): Stripe.Checkout.SessionCreateParams {
  const homeUrl = getURL();

  return {
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    customer,
    customer_update: { address: 'auto' },
    line_items: [{ price: priceId, quantity: 1 }],
    mode,
    allow_promotion_codes: true,
    success_url: homeUrl,
    cancel_url: homeUrl
  };
}
