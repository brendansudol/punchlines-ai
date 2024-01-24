import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';

export function useSignOut() {
  const router = useRouter();
  const { supabase } = useSupabase();

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.refresh();
  }, [router, supabase]);

  return { signOut };
}
