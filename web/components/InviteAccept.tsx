'use client';

/**
 * Client component for invite accept flow on web.
 *
 * Flow A — Not logged in:
 *   Token saved to sessionStorage → redirect to /login?redirect=/invite/TOKEN
 *
 * Flow B — Logged in:
 *   Show "Join squad?" confirmation → accept → show success or error
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInvite } from '@down/common';
import { supabase } from '../lib/supabase';
import { inviteToken } from '../lib/inviteToken';
import type { InviteErrorCode } from '@down/common';

type ScreenState =
  | { kind: 'loading' }
  | { kind: 'confirm' }
  | { kind: 'accepting' }
  | { kind: 'success'; groupId: string; groupName: string }
  | { kind: 'error'; code: InviteErrorCode; message: string };

const ERROR_COPY: Record<InviteErrorCode, { heading: string; body: string }> = {
  expired:         { heading: 'Link expired 😬',        body: "This invite link has expired. Ask your crew to send a fresh one." },
  already_used:    { heading: 'Already claimed 👀',     body: "This invite link has already been used. Drop into the chat for a new one." },
  already_member:  { heading: "You're already in! 🎉",  body: "You're already part of this squad. Head to your groups to see it." },
  not_found:       { heading: 'Invalid link 🤔',         body: "This invite link doesn't exist. Double-check the link and try again." },
  unauthenticated: { heading: 'Hold up ✋',              body: "You need to be logged in to accept an invite." },
  unknown:         { heading: 'Something broke 💀',      body: "Something went wrong. Try again or get a new link from your squad." },
};

interface Props {
  token: string;
}

export function InviteAccept({ token }: Props) {
  const router = useRouter();
  const [state, setState] = useState<ScreenState>({ kind: 'loading' });

  useEffect(() => {
    if (!token) {
      setState({ kind: 'error', code: 'not_found', message: 'No token provided' });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Store token and redirect to login with return path
        inviteToken.set(token);
        router.replace(`/login?redirect=/invite/${encodeURIComponent(token)}`);
        return;
      }
      // Logged in — ready to confirm
      setState({ kind: 'confirm' });
    });
  }, [token, router]);

  async function handleAccept() {
    setState({ kind: 'accepting' });
    try {
      const result = await acceptInvite(supabase, token);
      inviteToken.clear();
      setState({ kind: 'success', groupId: result.groupId, groupName: result.groupName });
    } catch (err: any) {
      inviteToken.clear();
      const code: InviteErrorCode = err?.code ?? 'unknown';
      setState({ kind: 'error', code, message: err?.message ?? 'Unknown error' });
    }
  }

  // ─── Loading ──────────────────────────────────────────
  if (state.kind === 'loading' || state.kind === 'accepting') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-on-surface-variant font-body">
          {state.kind === 'accepting' ? 'Joining squad...' : 'One sec...'}
        </p>
      </div>
    );
  }

  // ─── Confirm ──────────────────────────────────────────
  if (state.kind === 'confirm') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <span className="text-6xl">🤙</span>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              You got an invite!
            </h1>
            <p className="text-base font-body text-on-surface-variant leading-relaxed">
              Someone wants you in their squad.
              <br />
              You down?
            </p>
          </div>

          <div className="w-full space-y-3 mt-2">
            <button
              onClick={handleAccept}
              className="w-full bg-primary text-on-primary font-heading font-bold text-base py-4 rounded-2xl hover:opacity-90 active:opacity-80 transition-opacity"
            >
              I&apos;m down 🤙
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Nah, maybe later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success ──────────────────────────────────────────
  if (state.kind === 'success') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <span className="text-6xl">🎉</span>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              You&apos;re in!
            </h1>
            <p className="text-base font-body text-on-surface-variant leading-relaxed">
              Welcome to{' '}
              <span className="font-semibold text-on-surface">{state.groupName}</span>.
              <br />
              Say less. 🫡
            </p>
          </div>

          <button
            onClick={() => router.push(`/groups/${state.groupId}`)}
            className="w-full bg-primary text-on-primary font-heading font-bold text-base py-4 rounded-2xl hover:opacity-90 active:opacity-80 transition-opacity mt-2"
          >
            See the squad
          </button>
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────
  const errCopy = ERROR_COPY[state.code];
  const isAlreadyMember = state.code === 'already_member';

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <span className="text-6xl">😬</span>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-bold text-on-surface">
            {errCopy.heading}
          </h1>
          <p className="text-base font-body text-on-surface-variant leading-relaxed">
            {errCopy.body}
          </p>
        </div>

        <button
          onClick={() => router.push(isAlreadyMember ? '/groups' : '/dashboard')}
          className="w-full bg-primary text-on-primary font-heading font-bold text-base py-4 rounded-2xl hover:opacity-90 active:opacity-80 transition-opacity mt-2"
        >
          {isAlreadyMember ? 'Go to my groups' : 'Go home'}
        </button>
      </div>
    </div>
  );
}
