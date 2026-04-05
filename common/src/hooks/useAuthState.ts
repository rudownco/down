/**
 * Shared auth state hook — works on both React Native and Next.js.
 *
 * Manages the Supabase session lifecycle:
 *   - Subscribes to auth state changes (login, logout, token refresh)
 *   - Loads the matching row from `profiles` before exposing domain `User`
 *   - Falls back to `user_metadata` when the profile row is missing or the query fails
 *   - Keeps `isLoading` true until session + profile resolution finish (logged-in case)
 *   - Provides a signOut helper
 *
 * Each platform wraps this in its own AuthProvider/Context to add
 * platform-specific behavior (e.g. Google sign-in, router redirects).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '../types';

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

type ProfileRow = { name: string | null; avatar_url: string | null };

function buildUser(session: Session, profile: ProfileRow | null): User {
  const meta = session.user.user_metadata ?? {};
  const metaName = (meta.full_name ?? meta.name) as string | undefined;
  const metaAvatar = meta.avatar_url as string | undefined;

  const profileName = profile?.name?.trim() ?? '';
  const profileAvatar = profile?.avatar_url?.trim() ?? '';

  const name =
    profileName ||
    (metaName && metaName.trim()) ||
    session.user.email ||
    'User';

  const avatarUrl =
    profileAvatar ||
    (typeof metaAvatar === 'string' && metaAvatar.trim() ? metaAvatar.trim() : undefined);

  return {
    id: session.user.id,
    name,
    avatarUrl,
  };
}

export function useAuthState(supabase: SupabaseClient): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const resolveGenerationRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile(userId: string): Promise<ProfileRow | null> {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', userId)
        .maybeSingle();
      if (error) return null;
      return data as ProfileRow | null;
    }

    function applyLoggedOut() {
      resolveGenerationRef.current += 1;
      setSession(null);
      setUser(null);
      setIsLoading(false);
    }

    async function resolveLoggedIn(newSession: Session) {
      const gen = ++resolveGenerationRef.current;
      setIsLoading(true);
      setUser(null);
      setSession(newSession);

      const profile = await fetchProfile(newSession.user.id);
      if (cancelled || gen !== resolveGenerationRef.current) return;

      setUser(buildUser(newSession, profile));
      setIsLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (cancelled) return;

      if (event === 'TOKEN_REFRESHED' && newSession) {
        setSession(newSession);
        return;
      }

      if (!newSession) {
        applyLoggedOut();
        return;
      }

      void resolveLoggedIn(newSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    resolveGenerationRef.current += 1;
    setSession(null);
    setUser(null);
    setIsLoading(false);
  }, [supabase]);

  return { session, user, isLoading, signOut };
}
