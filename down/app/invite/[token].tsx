/**
 * Invite landing screen — handles deep links:  down://invite/TOKEN
 *
 * Flow A — Not logged in:
 *   Token stored → navigate to login → after login, RootLayout re-routes here
 *
 * Flow B — Logged in:
 *   Show "Join [group]?" confirm UI → accept invite → navigate to group
 */

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { acceptInvite } from '@down/common';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/services/supabase';
import { pendingInvite } from '../../src/utils/pendingInvite';
import type { InviteErrorCode } from '@down/common';

type ScreenState =
  | { kind: 'loading' }
  | { kind: 'confirm' }
  | { kind: 'accepting' }
  | { kind: 'success'; groupId: string; groupName: string }
  | { kind: 'error'; code: InviteErrorCode; message: string };

const ERROR_COPY: Record<InviteErrorCode, { heading: string; body: string }> = {
  expired:        { heading: 'Link expired 😬',         body: "This invite link has expired. Ask your crew to send a fresh one." },
  already_used:   { heading: 'Already claimed 👀',      body: "This invite link has already been used. Drop into the chat for a new one." },
  already_member: { heading: "You're already in! 🎉",   body: "You're already part of this squad. Head to your groups to see it." },
  not_found:      { heading: 'Invalid link 🤔',          body: "This invite link doesn't exist. Double-check the link and try again." },
  unauthenticated:{ heading: 'Hold up ✋',               body: "You need to be logged in to accept an invite." },
  unknown:        { heading: 'Something broke 💀',       body: "Something went wrong. Try again or get a new link from your squad." },
};

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { session } = useAuth();
  const [state, setState] = useState<ScreenState>({ kind: 'loading' });

  useEffect(() => {
    if (!token) {
      setState({ kind: 'error', code: 'not_found', message: 'No token provided' });
      return;
    }

    if (!session) {
      // Store token and send to login — RootLayout will route back here after auth
      pendingInvite.set(token).then(() => {
        router.replace('/(auth)/login');
      });
      return;
    }

    // Logged in — ready to confirm
    setState({ kind: 'confirm' });
  }, [token, session]);

  async function handleAccept() {
    if (!token) return;
    setState({ kind: 'accepting' });

    try {
      const result = await acceptInvite(supabase, token);
      await pendingInvite.clear();
      setState({ kind: 'success', groupId: result.groupId, groupName: result.groupName });
    } catch (err: any) {
      await pendingInvite.clear();
      const code: InviteErrorCode = err?.code ?? 'unknown';
      setState({ kind: 'error', code, message: err?.message ?? 'Unknown error' });
    }
  }

  function handleGoToGroup(groupId: string) {
    router.replace(`/(app)/group/${groupId}`);
  }

  function handleGoHome() {
    router.replace('/(app)');
  }

  // ─── Loading ──────────────────────────────────────────
  if (state.kind === 'loading' || state.kind === 'accepting') {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#3F6377" />
        <Text className="mt-4 text-on-surface-variant font-body text-sm">
          {state.kind === 'accepting' ? 'Joining squad...' : 'One sec...'}
        </Text>
      </SafeAreaView>
    );
  }

  // ─── Confirm ──────────────────────────────────────────
  if (state.kind === 'confirm') {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 items-center justify-center px-6 gap-6">
          <Text className="text-5xl">🤙</Text>

          <View className="items-center gap-2">
            <Text className="text-2xl font-heading font-bold text-on-surface text-center">
              You got an invite!
            </Text>
            <Text className="text-base font-body text-on-surface-variant text-center leading-relaxed">
              Someone wants you in their squad.{'\n'}You down?
            </Text>
          </View>

          <View className="w-full gap-3 mt-4">
            <Pressable
              onPress={handleAccept}
              className="w-full bg-primary rounded-2xl py-4 items-center active:opacity-80"
            >
              <Text className="text-on-primary font-heading font-bold text-base">
                I'm down 🤙
              </Text>
            </Pressable>

            <Pressable
              onPress={handleGoHome}
              className="w-full py-4 items-center"
            >
              <Text className="text-on-surface-variant font-body text-sm">
                Nah, maybe later
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Success ──────────────────────────────────────────
  if (state.kind === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 items-center justify-center px-6 gap-6">
          <Text className="text-5xl">🎉</Text>

          <View className="items-center gap-2">
            <Text className="text-2xl font-heading font-bold text-on-surface text-center">
              You're in!
            </Text>
            <Text className="text-base font-body text-on-surface-variant text-center leading-relaxed">
              Welcome to{' '}
              <Text className="font-semibold text-on-surface">{state.groupName}</Text>.
              {'\n'}Say less. 🫡
            </Text>
          </View>

          <Pressable
            onPress={() => handleGoToGroup(state.groupId)}
            className="w-full bg-primary rounded-2xl py-4 items-center active:opacity-80 mt-4"
          >
            <Text className="text-on-primary font-heading font-bold text-base">
              See the squad
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error ────────────────────────────────────────────
  const errCopy = ERROR_COPY[state.code];
  const isAlreadyMember = state.code === 'already_member';

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center px-6 gap-6">
        <Text className="text-5xl">😬</Text>

        <View className="items-center gap-2">
          <Text className="text-2xl font-heading font-bold text-on-surface text-center">
            {errCopy.heading}
          </Text>
          <Text className="text-base font-body text-on-surface-variant text-center leading-relaxed">
            {errCopy.body}
          </Text>
        </View>

        <Pressable
          onPress={handleGoHome}
          className="w-full bg-primary rounded-2xl py-4 items-center active:opacity-80 mt-4"
        >
          <Text className="text-on-primary font-heading font-bold text-base">
            {isAlreadyMember ? 'Go to my groups' : 'Go home'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
