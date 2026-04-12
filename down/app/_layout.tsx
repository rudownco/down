// Root layout — auth gate + font loading + NativeWind

import "../global.css";

import { View } from "react-native";
import { useEffect } from "react";
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
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { darkThemeVars } from "../src/theme/themeVars";
import { pendingInvite } from "../src/utils/pendingInvite";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const { isDark } = useTheme();
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
      <View style={isDark ? darkThemeVars : undefined} className="flex-1">
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="loading" />
        </Stack>
      </View>
    );
  }

  return (
    <View style={isDark ? darkThemeVars : undefined} className="flex-1">
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="invite" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
