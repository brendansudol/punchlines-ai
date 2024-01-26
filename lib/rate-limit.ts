import type { NextRequest } from 'next/server';

export const RATE_LIMIT_TOKENS = 8;
export const RATE_LIMIT_WINDOW = '6 h';
export const RATE_LIMIT_WINDOW_MS = 1_000 * 60 * 60 * 6; // 6 hours, keep in sync with above

export function getLookupKey(identifier: string) {
  return [
    '@upstash/ratelimit',
    identifier,
    Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS)
  ].join(':');
}

export function getIp(req: NextRequest): string {
  return (
    req.ip ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for') ??
    '__FALLBACK_IP__'
  );
}
