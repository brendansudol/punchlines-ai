import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { getStripe } from '@/lib/stripe';

export function usePayInit(hasSubscription: boolean = false) {
  const handlePay = useCallback(async () => {
    if (hasSubscription) {
      toast('You have already paid!');
      return;
    }

    const toastId = toast.loading('Loading...');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      const sessionId = data?.sessionId;
      if (sessionId == null) throw new Error('No session id');

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong', { id: toastId });
    }
  }, [hasSubscription]);

  return { handlePay };
}
