import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { getStripe } from '@/lib/stripe';
import { fetchPost } from '@/lib/utils';

export function usePay(hasSubscription: boolean = false) {
  const handlePay = useCallback(async () => {
    if (hasSubscription) {
      toast('You have already paid!');
      return;
    }

    const toastId = toast.loading('Loading...');
    try {
      const data = await fetchPost('/api/create-checkout-session');

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
