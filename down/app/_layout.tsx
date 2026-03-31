// Root layout — auth gate + font loading + NativeWind

import "../global.css";

import { StyleSheet } from "react-native";
import { useEffect } from "react";

StyleSheet.setFlag?.("darkMode", "class");
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
} from "@expo-google-fonts/be-vietnam-pro";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { pendingInvite } from "../src/utils/pendingInvite";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
  });

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    if (session) {
      // After login, check if there's a saved invite token to resume
      pendingInvite.get().then((token) => {
        if (token) {
          router.replace(`/invite/${token}`);
        } else {
          router.replace('/(app)');
        }
      });
    } else {
      router.replace('/(auth)/login');
    }
  }, [session, isLoading, fontsLoaded]);

  if (!fontsLoaded || isLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="loading" />
        </Stack>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="invite" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
