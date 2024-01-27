'use client';

import { ArrowRightCircleIcon } from '@heroicons/react/24/solid';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';
import Typist from 'react-typist-component';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { usePayInit } from '@/hooks/usePayInit';
import {
  asyncLoaded,
  asyncLoading,
  asyncNotStarted,
  AsyncValue,
  getAsyncLoadedValue,
  isLoaded,
  isLoading,
  isNotStarted
} from '@/lib/async';
import { getRandomExamples } from '@/lib/data';
import { SuggestResponse } from '@/types';

export function MainContent({
  examples: initialExamples,
  hasSubscription,
  isSignedIn
}: {
  examples: string[];
  hasSubscription: boolean;
  isSignedIn: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [examples, setExamples] = useState(initialExamples);
  const [remaining, setRemaining] = useState<number | null>();
  const [results, setResults] =
    useState<AsyncValue<SuggestResponse>>(asyncNotStarted());

  const buttonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const { handlePay } = usePayInit();

  // TODO: better name for this (and `results`)
  const result = useMemo(() => {
    const value = getAsyncLoadedValue(results);
    return value?.status === 'success' ? value : undefined;
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setPrompt('');
    }
  };

  const handleExampleClick = (text: string) => {
    setPrompt(text);
    buttonRef.current?.focus();
  };

  const handleRefreshExamples = () => {
    setExamples(getRandomExamples());
  };

  const handleSubmit = async () => {
    setResults(asyncLoading());
    setShowTyping(true);
    try {
      const res = await fetch(
        '/api/generate-punchlines',
        getRequestInit({ prompt })
      );
      const data = await res.json();
      setResults(asyncLoaded(data));
      if (data.status === 'success') setRemaining(data.remaining);
    } catch (_) {
      setResults(asyncLoaded({ status: 'error', reason: 'unknown' }));
    }
  };

  const handleTypingDone = () => {
    setShowTyping(false);
  };

  const handleClearResults = () => {
    setPrompt('');
    setResults(asyncNotStarted());
  };

  const handleCopy = (joke: string) => () => {
    navigator.clipboard.writeText(joke);
    toast.success('Copied!');
  };

  const handleUpgrade = () => {
    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      handlePay();
    }
  };

  const handleSave = (idx: number) => async () => {
    const id = result?.id;
    if (id == null) return;

    if (!isSignedIn) {
      toast.error('Sign in to save jokes');
      return;
    }

    const toastId = toast.loading('Saving...');
    try {
      const res = await fetch(
        '/api/save-punchline',
        getRequestInit({ id, punchlineIndex: idx })
      );
      const data = await res.json();
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

  const handleCheckRemaining = async () => {
    try {
      const res = await fetch('/api/check-remaining', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') setRemaining(data.remaining);
      else throw new Error('Failed to check remaining');
    } catch (err) {
      console.error(err);
      setRemaining(null); // TODO: better fail state
    }
  };

  useEffect(() => {
    handleCheckRemaining();
  }, [isSignedIn]);

  return (
    <>
      <div className="mb-10 lg:mb-12">
        <div className="flex flex-col w-full pl-2 py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white rounded-lg shadow-md">
          <TextareaAutosize
            rows={1}
            maxRows={5}
            placeholder="Add opening line..."
            className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-9 focus:ring-0 focus-visible:ring-0"
            style={{ overflowY: 'hidden' }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="absolute p-1 rounded-md text-slate-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-slate-100 disabled:hover:bg-transparent"
            disabled={prompt.length === 0}
            ref={buttonRef}
            onClick={handleSubmit}
          >
            <ArrowRightCircleIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 text-[11px] sm:text-xs text-center">
          {hasSubscription ? (
            <div>You have unlimited generations.</div>
          ) : remaining === undefined ? (
            <div className="py-[3px] h-4 animate-pulse">
              <div className="mx-auto h-full bg-slate-200 rounded-full w-3/6" />
            </div>
          ) : remaining === null ? (
            <div className="h-4" />
          ) : (
            <div>
              You have <strong>{Math.max(0, remaining)}</strong> jokes left
              today.{' '}
              {isSignedIn ? (
                <Button
                  className="p-0 h-auto text-[11px] sm:text-xs text-blue-600 underline underline-offset-4"
                  variant="link"
                  onClick={handlePay}
                >
                  <span className="sm:hidden">Get unlimited →</span>
                  <span className="hidden sm:inline">
                    Get unlimited jokes →
                  </span>
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
          )}
        </div>
      </div>

      {isNotStarted(results) && (
        <div className="grid gap-12 lg:gap-14">
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
                Example opening lines:
              </h2>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={handleRefreshExamples}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              {examples.map((ex, i) => (
                <div
                  key={i}
                  className="p-3 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  onClick={() => handleExampleClick(ex)}
                >
                  <span className="select-none">“</span>
                  {ex}
                  <span className="select-none">”</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
              How does it work?
            </h2>
            <p>
              <strong>punchlines.ai</strong> is an AI joke generation tool built
              on top of a large language model (LLM). It was fine-tuned on
              thousands of late night comedy monologue jokes. And boy are its
              arms tired!
            </p>
          </section>
        </div>
      )}

      {isLoading(results) && (
        <div className="animate-pulse">
          <div className="mb-3 h-5 bg-slate-200 rounded-full w-48 lg:w-64"></div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="mb-5 p-4 border border-2 border-slate-200 rounded-lg"
            >
              <div className="h-3 bg-slate-200 rounded-full w-5/6 mb-2.5"></div>
              <div className="h-3 bg-slate-200 rounded-full w-6/6 mb-2.5"></div>
              <div className="h-3 bg-slate-200 rounded-full w-4/6"></div>
            </div>
          ))}
        </div>
      )}

      {isLoaded(results) && results.value.status === 'error' && (
        <div
          className="p-5 lg:p-7 mb-4 text-red-700 bg-red-100 rounded-lg"
          role="alert"
        >
          <div>
            <span className="font-bold">Sorry!</span>{' '}
            {getErrorMessage(results.value.reason)}
          </div>
          {results.value.reason === 'rate-limit-user' && (
            <div className="mt-4">
              <Button
                className="p-0 font-bold text-base text-red-700 underline"
                variant="link"
                onClick={handleUpgrade}
              >
                Get more jokes →
              </Button>
            </div>
          )}
        </div>
      )}

      {isLoaded(results) && results.value.status === 'success' && (
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
            Punchline options:
          </h2>

          {showTyping ? (
            <Typist
              cursor={<span className="ml-1 animate-blink">▋</span>}
              typingDelay={25}
              onTypingDone={handleTypingDone}
            >
              <div className="grid gap-4">
                {results.value.results.map((punchline, i, arr) => (
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
          ) : (
            <React.Fragment>
              <div className="grid gap-4">
                {results.value.results.map((punchline, i) => {
                  const { id, prompt } =
                    results.value as SuggestResponse.Success;
                  const fullJoke = `${prompt ?? ''} ${punchline}`.trim();

                  return (
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
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
                              onClick={handleCopy(fullJoke)}
                            >
                              Copy to clipboard
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs" asChild>
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={makeTweetUrl(fullJoke)}
                              >
                                Share on Twitter
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Button
                    className="text-xs font-bold"
                    size="sm"
                    variant="secondary"
                    onClick={handleClearResults}
                  >
                    Clear results
                  </Button>
                  <Button
                    className="text-xs font-bold"
                    size="sm"
                    variant="secondary"
                    onClick={handleSubmit}
                  >
                    Submit again
                  </Button>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      )}
    </>
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

function getRequestInit(body: { [key: string]: any }) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function makeTweetUrl(joke: string) {
  const url = window.location.origin;
  const params = new URLSearchParams({ text: joke, url }).toString();
  return `https://twitter.com/intent/tweet?${params}`;
}
