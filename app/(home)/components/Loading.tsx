'use client';

export function Loading() {
  return (
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
  );
}
