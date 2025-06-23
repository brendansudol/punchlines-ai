import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { fetchPost } from '@/lib/utils';

export function useCustomerPortal() {
  const openPortal = useCallback(async () => {
    const toastId = toast.loading('Loading...');
    try {
      const data = await fetchPost('/api/create-portal-session');
      const url = data?.url as string | undefined;
      if (url == null) throw new Error('No portal url');
      window.location.assign(url);
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong', { id: toastId });
    }
  }, []);

  return { openPortal };
}
