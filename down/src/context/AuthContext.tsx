import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../services/supabase';
import { User } from '../types';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isSigningIn = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    if (isSigningIn.current) return;
    isSigningIn.current = true;
    setError(null);
    setIsLoading(true);

    try {
      const redirectTo = 'down://auth';

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (oauthError) throw oauthError;
      if (!data.url) throw new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success') {
        // Implicit flow returns tokens in the URL hash fragment
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionError) throw sessionError;
        }
      }
    } catch (e: any) {
      console.error('[Auth] signInWithGoogle error:', e.message);
      setError(e.message ?? 'Sign in failed');
    } finally {
      isSigningIn.current = false;
      setIsLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const user: User | null = session
    ? {
        id: session.user.id,
        name:
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email ||
          'User',
      }
    : null;

  return (
    <AuthContext.Provider value={{ session, user, isLoading, error, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
