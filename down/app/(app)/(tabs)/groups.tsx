import React, { useEffect, useMemo } from "react";
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
import { SketchCard, AvatarStack, FloatingActionButton, FilledInput } from "../../../components";
import { useGroupStore } from "../../../src/stores/groupStore";
import { useNotificationStore } from "../../../src/stores/notificationStore";
import { useThemeColors } from "../../../src/hooks/useThemeColors";
import { getGroupEmoji } from "@down/common";
import { randomTilt } from "../../../lib/animations";
import type { DownGroup } from "../../../src/types";

/** Deterministic icon bg color from group name */
const ICON_BG_COLORS = [
  "bg-secondary-container",
  "bg-primary-container",
  "bg-tertiary-container",
] as const;

function getIconBg(name: string): string {
  let hash = 5381;
  for (let i = 0; i < name.length; i++) hash = (hash * 33) ^ name.charCodeAt(i);
  return ICON_BG_COLORS[Math.abs(hash) % ICON_BG_COLORS.length];
}

function GroupCard({ group, hasUnread }: { group: DownGroup; hasUnread: boolean }) {
  const router = useRouter();
  const tc = useThemeColors();
  const tilt = useMemo(() => randomTilt(1.2), []);

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/(app)/group/[id]", params: { id: group.id } })
      }
    >
      <SketchCard tilt={tilt} className="gap-4">
        {/* Top row: icon + info + status badge */}
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            {/* Group icon */}
            <View
              className={`w-14 h-14 rounded-full items-center justify-center ${getIconBg(group.name)}`}
            >
              <Text className="text-2xl">{getGroupEmoji(group.name)}</Text>
            </View>

            {/* Name + member avatars */}
            <View className="flex-1 gap-1">
              <Text className="font-heading text-lg text-on-surface">
                {group.name}
              </Text>
              {group.members.length > 0 && (
                <AvatarStack
                  users={group.members}
                  maxVisible={3}
                  size="xs"
                  borderColor={tc.surfaceContainerLowest}
                />
              )}
            </View>
          </View>

          {/* Unread / activity badge */}
          {hasUnread && (
            <View className="bg-primary px-3 py-1 rounded-chip flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-on-primary" />
              <Text className="font-heading text-[10px] text-on-primary uppercase tracking-wider">
                Active
              </Text>
            </View>
          )}
        </View>

        {/* Footer: last activity + chevron */}
        <View className="pt-3 border-t border-surface-variant flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={14} color={tc.outline} />
            <Text className="font-body text-sm text-outline">
              {group.lastActivity}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={tc.primary} />
        </View>
      </SketchCard>
    </Pressable>
  );
}

export default function GroupsTab() {
  const router = useRouter();
  const tc = useThemeColors();
  const { groups, isLoading, error, loadGroups } = useGroupStore();
  const { unreadGroupIds } = useNotificationStore();

  useEffect(() => {
    loadGroups();
  }, []);

  if (isLoading && groups.length === 0) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={tc.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row justify-between items-center">
        <Text className="font-heading-extrabold text-2xl text-primary tracking-tight">
          my squads
        </Text>
        <Pressable
          onPress={() => router.push("/(app)/group-create")}
          hitSlop={8}
        >
          <Ionicons name="add-circle" size={30} color={tc.primary} />
        </Pressable>
      </View>

      {error && (
        <Text className="font-body text-sm text-red-500 px-6 mb-2">{error}</Text>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadGroups} />
        }
      >
        {/* Section header */}
        <View className="flex-row items-baseline justify-between mt-2">
          <Text className="font-heading text-xl text-primary tracking-tight">
            your people
          </Text>
          <Text className="font-label text-sm text-tertiary">squad goals</Text>
        </View>

        {groups.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-24 gap-4">
            <Text className="text-5xl">👥</Text>
            <Text className="font-heading text-xl text-primary">no squads yet</Text>
            <Text className="font-body text-sm text-on-surface-variant text-center">
              create one and get your crew together
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              hasUnread={unreadGroupIds.includes(group.id)}
            />
          ))
        )}

        {/* Empty state footer */}
        <View className="py-12 items-center gap-2">
          <Ionicons name="brush-outline" size={48} color="rgba(63,99,119,0.1)" />
          <Text className="font-label text-sm text-tertiary opacity-60">
            more squads coming soon...
          </Text>
        </View>
      </ScrollView>

      {/* FAB — Create Squad */}
      <FloatingActionButton
        onPress={() => router.push("/(app)/group-create")}
        icon="rocket-outline"
      />
    </View>
  );
}
