import { PropsWithChildren } from 'react';

export function Container({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto p-5 lg:p-6 max-w-screen-sm min-h-screen">
      {children}
    </div>
  );
}
