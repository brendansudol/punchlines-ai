'use client';

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z"
          ></path>
        </svg>
      </button>
    </div>
  );
}
