'use client';

import { ArrowRightCircleIcon } from '@heroicons/react/24/solid';
import TextareaAutosize from 'react-textarea-autosize';

export function PromptInput({
  value,
  onChange,
  onSubmit
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onChange('');
    }
  };

  return (
    <div className="flex flex-col w-full pl-2 py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white rounded-lg shadow-md">
      <TextareaAutosize
        rows={1}
        maxRows={5}
        placeholder="Add opening line..."
        className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-9 focus:ring-0 focus-visible:ring-0"
        style={{ overflowY: 'hidden' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="absolute p-1 rounded-md text-slate-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-slate-100 disabled:hover:bg-transparent"
        disabled={value.length === 0}
        onClick={onSubmit}
      >
        <ArrowRightCircleIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
