'use client';

/**
 * Web auth provider — thin wrapper around the shared useAuthState hook.
 * Only adds the Next.js router redirect on sign-out.
 */

import { createContext, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@down/common';
import type { AuthState } from '@down/common';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState(supabase);
  const router = useRouter();

  // Wrap signOut to also redirect to login (web-specific)
  const signOut = useCallback(async () => {
    await auth.signOut();
    router.replace('/login');
  }, [auth, router]);

  return (
    <AuthContext.Provider value={{ ...auth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
