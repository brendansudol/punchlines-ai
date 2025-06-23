'use client';

import { Button } from '@/components/ui/button';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';

export function UpdateSubscriptionButton() {
  const { openPortal } = useCustomerPortal();

  return (
    <Button size="sm" onClick={openPortal} variant="secondary">
      Update subscription
    </Button>
  );
}
