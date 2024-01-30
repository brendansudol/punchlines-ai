import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { profanity } from '@/lib//profanity';
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
  if (req.method !== 'POST') return errorResponse('unknown', 405);

  const { prompt } = await req.json();
  await sleep(500); // prevent loading ui flash, slow down requests

  // Validate prompt
  if (prompt == null || typeof prompt !== 'string' || prompt.length < 5) {
    return errorResponse('prompt-too-short');
  } else if (prompt.length > 150) {
    return errorResponse('prompt-too-long');
  } else if (profanity.check(prompt)) {
    return errorResponse('profanity');
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
    } catch (err) {
      console.error('Error with rate limiter', err);
      // todo: early exit?
    }
  }

  // Fetch and parse joke suggestions
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_ID ?? '',
      max_tokens: 100,
      n: 3,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'You are a creative and hilarious comedy writer that loves to craft jokes'
        },
        {
          role: 'user',
          content: formatPrompt(prompt)
        }
      ]
    });

    const results = completion.choices
      .map(({ message }) => message.content?.trim())
      .filter(isNonNullable);

    // Save results to db
    let id: string | undefined;
    try {
      id = await addPunchlinesToDb({ userId, setup: prompt, results });
    } catch (err) {
      console.error('Error saving to db', err);
    }

    return NextResponse.json({
      status: 'success',
      id,
      remaining,
      prompt,
      results
    });
  } catch (error: any) {
    if (typeof error === 'object' && error?.response?.status === 429) {
      return errorResponse('rate-limit-global', 429);
    }

    console.error('Error getting suggestions', error);
    return errorResponse('unknown');
  }
}

function errorResponse(
  reason: SuggestResponse.Error['reason'],
  statusCode = 500
) {
  return NextResponse.json({ status: 'error', reason }, { status: statusCode });
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

function isNonNullable<T>(value: T | undefined | null): value is T {
  return value != null;
}

function formatPrompt(prompt: string): string {
  return maybeAddPeriod(prompt.trim());
}

function maybeAddPeriod(str: string) {
  const lastChar = str.slice(-1);
  const punctuationMarks = ['.', '!', '?', '"', '”', '…'];
  return punctuationMarks.includes(lastChar) ? str : `${str}.`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
