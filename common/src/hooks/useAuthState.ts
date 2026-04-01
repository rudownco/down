/**
 * Shared auth state hook — works on both React Native and Next.js.
 *
 * Manages the Supabase session lifecycle:
 *   - Reads existing session on mount
 *   - Subscribes to auth state changes (login, logout, token refresh)
 *   - Maps Supabase User to our domain User type
 *   - Provides a signOut helper
 *
 * Each platform wraps this in its own AuthProvider/Context to add
 * platform-specific behavior (e.g. Google sign-in, router redirects).
 */

import { useCallback, useEffect, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '../types';

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuthState(supabase: SupabaseClient): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read persisted session (localStorage on web, AsyncStorage on RN)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    // Listen for login/logout/token-refresh events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Map Supabase user → domain User
  const user: User | null = session
    ? {
        id: session.user.id,
        name:
          session.user.user_metadata?.full_name ??
          session.user.user_metadata?.name ??
          session.user.email ??
          'User',
        avatarUrl: session.user.user_metadata?.avatar_url,
      }
    : null;

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, [supabase]);

  return { session, user, isLoading, signOut };
}
