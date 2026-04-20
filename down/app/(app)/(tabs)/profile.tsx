// Profile tab — settings + sign out
import React, { useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../src/context/AuthContext";
import { useTheme } from "../../../src/context/ThemeContext";
import { useThemeColors } from "../../../src/hooks/useThemeColors";
import { AvatarCircle, BouncyButton, SketchCard } from "../../../components";
import { uploadAvatar, updateProfile } from "@down/common";
import { supabase } from "../../../src/services/supabase";

const THEME_OPTIONS = [
  { key: "light" as const, label: "Light", icon: "sunny-outline" as const },
  { key: "dark" as const, label: "Dark", icon: "moon-outline" as const },
  { key: "system" as const, label: "System", icon: "phone-portrait-outline" as const },
];

export default function ProfileTab() {
  const { user, signOut, refreshProfile } = useAuth();
  const { mode, setMode } = useTheme();
  const tc = useThemeColors();
  const [isUploading, setIsUploading] = useState(false);

  function handleSignOut() {
    signOut();
    router.replace('/(auth)/login');
  }

  async function uploadFromResult(result: ImagePicker.ImagePickerResult) {
    if (result.canceled || !result.assets[0] || !user) return;
    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? "image/jpeg";
    const fileExt = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    if (!asset.base64) {
      Alert.alert("Error", "No image data returned. Try again.");
      return;
    }

    setIsUploading(true);
    try {
      const binary = atob(asset.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const publicUrl = await uploadAvatar(supabase, user.id, bytes, fileExt);
      await updateProfile(supabase, user.id, { avatar_url: publicUrl });
      await refreshProfile();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not update avatar. Try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow camera access to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    await uploadFromResult(result);
  }

  async function handleChooseFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to change your avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    await uploadFromResult(result);
  }

  function handlePickAvatar() {
    Alert.alert("Change avatar", "How do you want to update your pic?", [
      { text: "Take photo", onPress: handleTakePhoto },
      { text: "Choose from library", onPress: handleChooseFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        {user && (
          <Pressable onPress={handlePickAvatar} disabled={isUploading}>
            <View className="relative">
              <AvatarCircle user={user} size="xl" tilt={-2} />
              {isUploading ? (
                <View className="absolute inset-0 rounded-full bg-black/40 items-center justify-center">
                  <ActivityIndicator color="#fff" />
                </View>
              ) : (
                <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-surface">
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              )}
            </View>
          </Pressable>
        )}
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
