/**
 * Persists an invite token across the authentication flow using AsyncStorage.
 * Flow: user opens invite link → not logged in → token saved here → login →
 *       RootLayout detects token → routes back to invite screen → accept.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@down/pending_invite_token';

export const pendingInvite = {
  async set(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, token);
  },

  async get(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEY);
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
