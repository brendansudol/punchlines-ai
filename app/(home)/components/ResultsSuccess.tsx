'use client';

import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Typist from 'react-typist-component';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { fetchPost } from '@/lib/utils';
import { SuggestResponse } from '@/types';

export function ResultsSuccess({
  value,
  isSignedIn,
  showTyping,
  onTypingDone,
  onClear,
  onResubmit
}: {
  value: SuggestResponse.Success;
  isSignedIn: boolean;
  showTyping: boolean;
  onTypingDone: () => void;
  onClear: () => void;
  onResubmit: () => void;
}) {
  const { id, prompt, results } = value;

  const router = useRouter();

  const handleSave = (idx: number) => async () => {
    if (id == null) return;

    if (!isSignedIn) {
      toast.error('Sign in to save jokes');
      return;
    }

    const toastId = toast.loading('Saving...');
    try {
      const params = { id, punchlineIndex: idx };
      const data = await fetchPost('/api/save-punchline', params);
      const savedId = data?.data?.id;

      if (data.status !== 'success' || savedId == null) {
        console.error(data);
        throw new Error('Failed to save joke.');
      }

      toast.success('Success!', { id: toastId });
      setTimeout(() => router.push(`/p/${savedId}`), 500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save', { id: toastId });
    }
  };

  const handleCopy = (joke: string) => () => {
    navigator.clipboard.writeText(joke);
    toast.success('Copied!');
  };

  const title = (
    <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
      Punchline options:
    </h2>
  );

  if (showTyping) {
    return (
      <div>
        {title}
        <Typist
          cursor={<span className="ml-1 animate-blink">▋</span>}
          typingDelay={25}
          onTypingDone={onTypingDone}
        >
          <div className="grid gap-4">
            {results.map((punchline, i, arr) => (
              <div
                key={i}
                className="relative p-4 border border-slate-200 rounded-lg"
              >
                <div className="whitespace-pre-line pr-4">
                  {i + 1}. {punchline}
                  {i < arr.length - 1 && <Typist.Delay ms={1_000} />}
                </div>
              </div>
            ))}
          </div>
        </Typist>
      </div>
    );
  }

  return (
    <div>
      {title}
      <div className="grid gap-4">
        {results.map((punchline, i) => (
          <div
            key={i}
            className="relative p-4 border border-slate-200 rounded-lg"
          >
            <div className="whitespace-pre-line pr-4">
              {i + 1}. {punchline}
            </div>
            <div className="more-menu-container absolute top-1 right-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44" align="end">
                  {id != null && (
                    <DropdownMenuItem
                      className="text-xs"
                      onClick={handleSave(i)}
                    >
                      Save punchline
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-xs"
                    onClick={handleCopy(toFullJoke(prompt, punchline))}
                  >
                    Copy to clipboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs" asChild>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={makeTweetUrl(toFullJoke(prompt, punchline))}
                    >
                      Share on Twitter
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <Button
            className="text-xs font-bold"
            size="sm"
            variant="secondary"
            onClick={onClear}
          >
            Clear results
          </Button>
          <Button
            className="text-xs font-bold"
            size="sm"
            variant="secondary"
            onClick={onResubmit}
          >
            Submit again
          </Button>
        </div>
      </div>
    </div>
  );
}

function toFullJoke(prompt: string | undefined, punchline: string) {
  return `${prompt ?? ''} ${punchline}`.trim();
}

function makeTweetUrl(joke: string) {
  const url = window.location.origin;
  const params = new URLSearchParams({ text: joke, url }).toString();
  return `https://twitter.com/intent/tweet?${params}`;
}
