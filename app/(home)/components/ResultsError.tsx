'use client';

import { Button } from '@/components/ui/button';
import { SuggestResponse } from '@/types';

export function ResultsError({
  value,
  onUpgrade
}: {
  value: SuggestResponse.Error;
  onUpgrade: () => void;
}) {
  const { reason } = value;

  return (
    <div
      className="p-5 lg:p-7 mb-4 text-red-700 bg-red-100 rounded-lg"
      role="alert"
    >
      <div>
        <span className="font-bold">Sorry!</span> {getErrorMessage(reason)}
      </div>
      {reason === 'rate-limit-user' && (
        <div className="mt-4">
          <Button
            className="p-0 font-bold text-base text-red-700 underline"
            variant="link"
            onClick={onUpgrade}
          >
            Get more jokes →
          </Button>
        </div>
      )}
    </div>
  );
}

function getErrorMessage(reason: SuggestResponse.Error['reason']): string {
  switch (reason) {
    case 'prompt-too-short':
      return 'Please enter a longer joke set-up and try again. A complete sentence works best.';
    case 'prompt-too-long':
      return 'Please enter a shorter joke set-up and try again. A single sentence works best.';
    case 'profanity':
      return "Let's keep it clean, folks. Think Jim Gaffigan or Nate Bargatze.";
    case 'rate-limit-user':
      return "You've reached your daily joke limit. Come back tomorrow for more.";
    case 'rate-limit-global':
      return 'punchlines.ai is at capacity right now. Please try again shortly.';
    case 'unknown':
    default:
      return 'There was a problem generating your punchlines. Please try again shortly.';
  }
}
