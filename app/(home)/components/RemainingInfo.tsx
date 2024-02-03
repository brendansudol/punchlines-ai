'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function RemainingInfo({
  remaining,
  isSignedIn,
  hasSubscription,
  onPay
}: {
  remaining: number | null | undefined;
  isSignedIn: boolean;
  hasSubscription: boolean;
  onPay: () => void;
}) {
  if (hasSubscription) {
    return (
      <div className="mt-3 text-[11px] sm:text-xs text-center">
        You have unlimited generations.
      </div>
    );
  }

  // loading state
  if (remaining === undefined) {
    return (
      <div className="mt-3">
        <div className="py-[3px] h-4 animate-pulse">
          <div className="mx-auto h-full bg-slate-200 rounded-full w-3/6" />
        </div>
      </div>
    );
  }

  // error state
  if (remaining === null) {
    return (
      <div className="mt-3">
        <div className="h-4" />
      </div>
    );
  }

  return (
    <div className="mt-3 text-[11px] sm:text-xs text-center">
      You have <strong>{Math.max(0, remaining)}</strong> jokes left today.{' '}
      {isSignedIn ? (
        <Button
          className="p-0 h-auto text-[11px] sm:text-xs text-blue-600 underline underline-offset-4"
          variant="link"
          onClick={onPay}
        >
          <span className="sm:hidden">Get unlimited →</span>
          <span className="hidden sm:inline">Get unlimited jokes →</span>
        </Button>
      ) : (
        <Link
          className="text-[11px] sm:text-xs text-blue-600 underline underline-offset-4"
          href="/sign-in"
        >
          Sign in for more →
        </Link>
      )}
    </div>
  );
}
