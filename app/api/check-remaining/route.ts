import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getIp, getLookupKey, RATE_LIMIT_TOKENS } from '@/lib/rate-limit';
import { Database } from '@/types/db';

const redis = Redis.fromEnv();

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.json({ status: 'failed' });

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    const lookupKey = getLookupKey(userId || getIp(req));
    const used = await redis.get<number>(lookupKey);
    const remaining = RATE_LIMIT_TOKENS - (used ?? 0);
    return NextResponse.json({ status: 'success', remaining });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'failed' });
  }
}
