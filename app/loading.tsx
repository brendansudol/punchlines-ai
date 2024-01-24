import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="p-3 flex flex-col items-center justify-center space-y-4 h-screen">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
