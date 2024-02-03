'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { usePay } from '@/hooks/usePay';
import {
  asyncLoaded,
  asyncLoading,
  asyncNotStarted,
  AsyncValue,
  isLoaded,
  isLoading,
  isNotStarted
} from '@/lib/async';
import { getRandomExamples } from '@/lib/data';
import { fetchPost } from '@/lib/utils';
import { SuggestResponse } from '@/types';
import { Loading } from './Loading';
import { PromptInput } from './PromptInput';
import { RemainingInfo } from './RemainingInfo';
import { ResultsError } from './ResultsError';
import { ResultsSuccess } from './ResultsSuccess';
import { ZeroState } from './ZeroState';

export function MainContent({
  examples: initialExamples,
  isSignedIn,
  hasSubscription
}: {
  examples: string[];
  isSignedIn: boolean;
  hasSubscription: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [examples, setExamples] = useState(initialExamples);
  const [remaining, setRemaining] = useState<number | null>();
  const [results, setResults] =
    useState<AsyncValue<SuggestResponse>>(asyncNotStarted());

  const router = useRouter();
  const { handlePay } = usePay();

  const handleExampleClick = (text: string) => {
    setPrompt(text);
  };

  const handleRefreshExamples = () => {
    setExamples(getRandomExamples());
  };

  const handleSubmit = async () => {
    setResults(asyncLoading());
    setShowTyping(true);
    try {
      const data: SuggestResponse = await fetchPost(
        '/api/generate-punchlines',
        { prompt }
      );
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

  const handleUpgrade = () => {
    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      handlePay();
    }
  };

  const handleCheckRemaining = async () => {
    try {
      const data = await fetchPost('/api/check-remaining');
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
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleSubmit}
        />
        <RemainingInfo
          remaining={remaining}
          isSignedIn={isSignedIn}
          hasSubscription={hasSubscription}
          onPay={handlePay}
        />
      </div>

      {isNotStarted(results) && (
        <ZeroState
          examples={examples}
          onClickExample={handleExampleClick}
          onRefreshExamples={handleRefreshExamples}
        />
      )}

      {isLoading(results) && <Loading />}

      {isLoaded(results) && results.value.status === 'error' && (
        <ResultsError value={results.value} onUpgrade={handleUpgrade} />
      )}

      {isLoaded(results) && results.value.status === 'success' && (
        <ResultsSuccess
          value={results.value}
          isSignedIn={isSignedIn}
          showTyping={showTyping}
          onTypingDone={handleTypingDone}
          onClear={handleClearResults}
          onResubmit={handleSubmit}
        />
      )}
    </>
  );
}
