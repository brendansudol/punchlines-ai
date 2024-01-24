'use client';

import { Button } from '@/components/ui/button';
import '@/styles/global.css';

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="p-3 flex flex-col items-center justify-center space-y-4 h-screen">
          <div>
            <strong>Uh-oh!</strong> Something went wrong.
          </div>
          <Button size="sm" variant="outline" onClick={reset}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
