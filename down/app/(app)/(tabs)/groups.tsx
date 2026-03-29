import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGroupStore } from "../../../src/stores/groupStore";

export default function GroupsTab() {
  const router = useRouter();
  const { groups, isLoading, error, loadGroups } = useGroupStore();

  useEffect(() => {
    loadGroups();
  }, []);

  if (isLoading && groups.length === 0) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#3F6377" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row justify-between items-center">
        <Text className="font-heading-extrabold text-3xl text-primary italic tracking-tighter -rotate-1">
          squads
        </Text>
        <Pressable
          onPress={() => router.push("/(app)/group-create")}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {error && (
        <Text className="font-body text-sm text-red-500 px-6 mb-2">{error}</Text>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadGroups} />
        }
      >
        {groups.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-24 gap-4">
            <Text className="text-5xl">👥</Text>
            <Text className="font-heading text-xl text-primary">no squads yet</Text>
            <Text className="font-body text-sm text-on-surface-variant text-center">
              create one and get your crew together
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/group-create")}
              className="mt-2 bg-primary px-6 py-3 rounded-button"
            >
              <Text className="font-heading text-white text-base">Create a squad</Text>
            </Pressable>
          </View>
        ) : (
          groups.map((group) => (
            <Pressable
              key={group.id}
              onPress={() => router.push({ pathname: "/(app)/group/[id]", params: { id: group.id } })}
              className="bg-surface-container-lowest rounded-card p-4 flex-row items-center gap-4"
              style={{
                shadowColor: "#131D23",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
                elevation: 2,
              }}
            >
              <View className="w-12 h-12 rounded-full bg-primary-container items-center justify-center">
                <Text className="text-xl">👥</Text>
              </View>
              <View className="flex-1">
                <Text className="font-heading text-base text-on-surface">{group.name}</Text>
                <Text className="font-body text-xs text-on-surface-variant">
                  {group.memberCount ?? group.members.length} members · {group.lastActivity}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#677A86" />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
