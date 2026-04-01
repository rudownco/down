/**
 * React Native auth provider — wraps the shared useAuthState hook.
 * Adds platform-specific Google sign-in via expo-web-browser.
 */

import React, { createContext, useContext, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useAuthState } from '@down/common';
import type { AuthState } from '@down/common';
import type { User } from '../types';
import { supabase } from '../services/supabase';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue extends AuthState {
  error: string | null;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState(supabase);
  const [error, setError] = useState<string | null>(null);
  const isSigningIn = useRef(false);

  async function signInWithGoogle() {
    if (isSigningIn.current) return;
    isSigningIn.current = true;
    setError(null);

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
        // Implicit flow: tokens are returned in the URL hash fragment
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
    }
  }

  return (
    <AuthContext.Provider value={{ ...auth, error, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
