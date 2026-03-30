import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Platform-agnostic Supabase client factory.
 *
 * - React Native: pass AsyncStorage as `storage`
 * - Web (Next.js): omit storage — defaults to browser localStorage
 *
 * @example (React Native)
 *   import AsyncStorage from '@react-native-async-storage/async-storage';
 *   import { createSupabaseClient } from '@down/common';
 *   export const supabase = createSupabaseClient(
 *     process.env.EXPO_PUBLIC_SUPABASE_URL!,
 *     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
 *     AsyncStorage,
 *   );
 *
 * @example (Next.js)
 *   import { createSupabaseClient } from '@down/common';
 *   export const supabase = createSupabaseClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 *   );
 */
export function createSupabaseClient(
  url: string,
  key: string,
  storage?: unknown
): SupabaseClient {
  return createClient(url, key, {
    auth: {
      ...(storage ? { storage: storage as any } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
}
