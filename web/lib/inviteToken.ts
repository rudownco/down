/**
 * Persists an invite token across the authentication flow using sessionStorage.
 * Flow: user opens /invite/TOKEN → not logged in → token saved here → login →
 *       login page reads token → redirects back to /invite/TOKEN → accept.
 */

const SESSION_KEY = 'down_pending_invite_token';

export const inviteToken = {
  set(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_KEY, token);
  },

  get(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SESSION_KEY);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(SESSION_KEY);
  },
};
