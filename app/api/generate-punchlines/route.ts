import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { profanity } from '@/lib/profanity';
import {
  buildPunchlineRequest,
  getPunchlineModel,
  parsePunchlines
} from '@/lib/punchlines';
import { getIp, RATE_LIMIT_TOKENS, RATE_LIMIT_WINDOW } from '@/lib/rate-limit';
import { addPunchlinesToDb } from '@/lib/supabase-admin';
import { SuggestResponse } from '@/types';
import { Database } from '@/types/db';

const CACHE = new Map();
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(RATE_LIMIT_TOKENS, RATE_LIMIT_WINDOW),
  ephemeralCache: CACHE
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('prompt-too-short', 400);
  }
  const input =
    body && typeof body === 'object' && 'prompt' in body
      ? body.prompt
      : undefined;
  const prompt = typeof input === 'string' ? input.trim() : '';
  await sleep(500); // prevent loading ui flash, slow down requests

  // Validate prompt
  if (prompt == null || typeof prompt !== 'string' || prompt.length < 5) {
    return errorResponse('prompt-too-short', 400);
  } else if (prompt.length > 150) {
    return errorResponse('prompt-too-long', 400);
  } else if (profanity.check(prompt)) {
    return errorResponse('profanity', 400);
  }

  // Get user details
  let userDetails: { userId: string; hasSubscription: boolean } | undefined;
  try {
    userDetails = await getUserDetails();
  } catch {
    console.error('Error getting user details');
  }

  // Rate limiting (if not subscribed)
  const { userId, hasSubscription } = userDetails ?? {};
  let remaining: number | undefined;
  if (!hasSubscription) {
    try {
      const rateLimitId = userId || getIp(req);
      const result = await ratelimit.limit(rateLimitId);
      remaining = result.remaining;
      if (!result.success) return errorResponse('rate-limit-user', 429);
    } catch {
      console.error('Error with rate limiter');
    }
  }

  // Fetch and parse joke suggestions
  try {
    const model = getPunchlineModel(process.env.OPENAI_MODEL_ID);
    const completion = await openai.chat.completions.create(
      buildPunchlineRequest(prompt, model)
    );
    const results = parsePunchlines(completion, prompt);

    // Save results to db
    let id: string | undefined;
    try {
      id = await addPunchlinesToDb({ userId, setup: prompt, results });
    } catch {
      console.error('Error saving generated punchlines');
    }

    return NextResponse.json({
      status: 'success',
      id,
      remaining,
      prompt,
      results
    });
  } catch (error: unknown) {
    if (error instanceof OpenAI.APIError && error.status === 429) {
      return errorResponse('rate-limit-global', 429);
    }

    console.error('Error getting suggestions', {
      name: error instanceof Error ? error.name : 'UnknownError',
      status: error instanceof OpenAI.APIError ? error.status : undefined,
      requestId: error instanceof OpenAI.APIError ? error.requestID : undefined
    });
    return errorResponse('unknown');
  }
}

function errorResponse(reason: SuggestResponse.Error['reason'], status = 500) {
  return NextResponse.json({ status: 'error', reason }, { status });
}

async function getUserDetails() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (userId == null) return;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle()
    .throwOnError();

  return {
    userId,
    hasSubscription: subscription != null
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
