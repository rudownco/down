// Event Hub — main dashboard matching Stitch export3
// "The Social Sketchbook" aesthetic

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EventCardNew, JellybeanChip, FloatingActionButton, AvatarCircle } from "../../../components";
import { useAuth } from "../../../src/context/AuthContext";
import { getGreeting } from "../../../src/utils/greeting";
import { useGroupStore } from "../../../src/stores/groupStore";
import { useEventStore } from "../../../src/stores/eventStore";
import { useNotificationStore } from "../../../src/stores/notificationStore";

const FILTERS = [
  { label: "🔥 active now", key: "active" },
  { label: "📅 this weekend", key: "weekend" },
  { label: "🎨 all", key: "all" },
];

export default function EventHubScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("active");

  const { groups, loadGroups, isLoading: groupsLoading } = useGroupStore();
  const { events, loadEvents, isLoading: eventsLoading } = useEventStore();
  const { unreadCount } = useNotificationStore();

  const firstName = user?.name.split(" ")[0] ?? "";

  const firstGroup = groups[0] ?? null;

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (firstGroup) loadEvents(firstGroup.id);
  }, [firstGroup?.id]);

  const isBootstrapping =
    (groupsLoading && groups.length === 0) ||
    (!!firstGroup && eventsLoading);

  if (isBootstrapping) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#3F6377" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-2 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <Text className="font-heading-extrabold text-3xl text-primary italic tracking-tighter -rotate-3">
            down
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.push('/(app)/notifications')}
            className="relative"
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={24} color="#3F6377" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary items-center justify-center">
                <Text className="text-on-primary text-[9px] font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
          {user && <AvatarCircle user={user} size="md" tilt={0} />}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Greeting */}
        <View className="px-6 mt-4 mb-6">
          <Text className="font-label text-sm text-tertiary uppercase tracking-widest">
            {getGreeting()}, {firstName}!
          </Text>
          <Text className="font-heading-extrabold text-4xl text-primary leading-tight mt-1">
            the hub.
          </Text>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 10, paddingBottom: 4 }}
          className="mb-6"
        >
          {FILTERS.map((f) => (
            <JellybeanChip
              key={f.key}
              label={f.label}
              selected={activeFilter === f.key}
              variant={f.key === "active" ? "secondary" : f.key === "weekend" ? "primary" : "neutral"}
              onPress={() => setActiveFilter(f.key)}
            />
          ))}
        </ScrollView>

        {/* Squad pill */}
        {firstGroup && (
          <View className="px-6 mb-2">
            <View className="flex-row items-center gap-3 bg-surface-container-lowest rounded-card p-4"
              style={{ shadowColor: "#131D23", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 }}
            >
              <Text className="text-2xl">👥</Text>
              <View className="flex-1">
                <Text className="font-heading text-base text-on-surface">{firstGroup.name}</Text>
                <Text className="font-body text-xs text-on-surface-variant">
                  {firstGroup.memberCount ?? 0} members · {firstGroup.lastActivity}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Event cards */}
        <View className="px-6 gap-8">
          {events.map((event) => (
            <EventCardNew
              key={event.id}
              event={event}
              currentUserId={user?.id ?? ""}
              onPress={() =>
                router.push({
                  pathname: event.status === "voting"
                    ? "/(app)/event/[id]/vote"
                    : "/(app)/event/[id]/rsvp",
                  params: { id: event.id },
                })
              }
              onRSVP={(_status) => {}}
            />
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <FloatingActionButton
        onPress={() => router.push("/(app)/group-create")}
        icon="add"
      />
    </View>
  );
}
