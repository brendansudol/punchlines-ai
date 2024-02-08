'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ZeroState({
  examples,
  onClickExample,
  onRefreshExamples
}: {
  examples: string[];
  onClickExample: (text: string) => void;
  onRefreshExamples: () => void;
}) {
  return (
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
            onClick={onRefreshExamples}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {examples.map((ex, i) => (
            <div
              key={i}
              className="p-3 text-sm bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer"
              onClick={() => onClickExample(ex)}
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
          <strong>punchlines.ai</strong> is an AI joke generation tool built on
          top of a large language model (LLM). It was fine-tuned on thousands of
          late night comedy monologue jokes. And boy are its arms tired!
        </p>
      </section>
    </div>
  );
}
