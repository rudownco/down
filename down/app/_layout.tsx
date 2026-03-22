// Root layout — auth gate + providers
// Translated from ios/down/App/RootView.swift + DownApp.swift

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';

export default function RootLayout() {
  const { user, isRestoringSession, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {isRestoringSession ? (
          <Stack.Screen name="loading" />
        ) : user ? (
          <Stack.Screen name="(app)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </>
  );
}
