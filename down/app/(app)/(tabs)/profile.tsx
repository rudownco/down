// Profile tab — settings + sign out
import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../src/context/AuthContext";
import { useTheme } from "../../../src/context/ThemeContext";
import { useThemeColors } from "../../../src/hooks/useThemeColors";
import { AvatarCircle, BouncyButton, SketchCard } from "../../../components";

const THEME_OPTIONS = [
  { key: "light" as const, label: "Light", icon: "sunny-outline" as const },
  { key: "dark" as const, label: "Dark", icon: "moon-outline" as const },
  { key: "system" as const, label: "System", icon: "phone-portrait-outline" as const },
];

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const { mode, setMode } = useTheme();
  const tc = useThemeColors();

  function handleSignOut() {
    signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        {user && <AvatarCircle user={user} size="xl" tilt={-2} />}
        <Text className="font-heading-extrabold text-2xl text-on-surface">
          {user?.name ?? ""}
        </Text>

        {/* Theme toggle */}
        <SketchCard tilt={0.8} className="w-full gap-3">
          <Text className="font-heading text-lg text-primary">
            appearance
          </Text>
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setMode(opt.key)}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-chip ${
                  mode === opt.key
                    ? "bg-primary-container"
                    : "bg-surface-container-high"
                }`}
              >
                <Ionicons
                  name={opt.icon}
                  size={16}
                  color={mode === opt.key ? tc.onPrimaryContainer : tc.onSurfaceVariant}
                />
                <Text
                  className={`font-heading-semibold text-sm ${
                    mode === opt.key
                      ? "text-on-primary-container"
                      : "text-on-surface-variant"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </SketchCard>

        <BouncyButton
          title="Sign Out"
          variant="outline"
          fullWidth={false}
          onPress={() =>
            Alert.alert("Sign Out", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: handleSignOut },
            ])
          }
        />
      </View>
    </View>
  );
}
