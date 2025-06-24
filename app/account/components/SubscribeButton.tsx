'use client';

import { Button } from '@/components/ui/button';
import { usePay } from '@/hooks/usePay';

export function SubscribeButton() {
  const { handlePay } = usePay();
  return (
    <Button size="sm" onClick={handlePay} variant="secondary">
      Subscribe for unlimited jokes
    </Button>
  );
}
