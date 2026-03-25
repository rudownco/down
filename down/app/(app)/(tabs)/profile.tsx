// Profile tab — placeholder
import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useAuthStore } from "../../../src/stores/authStore";
import { AvatarCircle } from "../../../components/AvatarCircle";
import { BouncyButton } from "../../../components/BouncyButton";

export default function ProfileTab() {
  const { user, signOut } = useAuthStore();

  return (
    <View className="flex-1 bg-surface items-center justify-center gap-6 px-6">
      {user && <AvatarCircle user={user} size="xl" tilt={-2} />}
      <Text className="font-heading-extrabold text-2xl text-on-surface">
        {user?.name ?? ""}
      </Text>
      <BouncyButton
        title="Sign Out"
        variant="outline"
        fullWidth={false}
        onPress={() =>
          Alert.alert("Sign Out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: signOut },
          ])
        }
      />
    </View>
  );
}
