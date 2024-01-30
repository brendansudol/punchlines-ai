'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Session, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { Database } from '@/types/db';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  session: Session | undefined;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: PropsWithChildren) {
  const [supabase] = useState(() => createPagesBrowserClient());
  const [session, setSession] = useState<Session>();
  const router = useRouter();

  const contextValue = useMemo(
    () => ({ supabase, session }),
    [supabase, session]
  );

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? undefined);
      if (event === 'SIGNED_IN') router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <Context.Provider value={contextValue}>
      <>{children}</>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context == null) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }

  return context;
};
