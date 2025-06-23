import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
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
    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url: getURL() + 'account'
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return errorResponse('Unknown');
  }
}

function errorResponse(reason: string, status = 500) {
  return NextResponse.json({ status: 'error', reason }, { status });
}
