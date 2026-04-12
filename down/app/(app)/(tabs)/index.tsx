// Event Hub — main dashboard matching Stitch export3
// "The Social Sketchbook" aesthetic

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EventCardNew, JellybeanChip, FloatingActionButton, AvatarCircle } from "../../../components";
import { useAuth } from "../../../src/context/AuthContext";
import { useThemeColors } from "../../../src/hooks/useThemeColors";
import { useGroupStore } from "../../../src/stores/groupStore";
import { useEventStore } from "../../../src/stores/eventStore";
import { useNotificationStore } from "../../../src/stores/notificationStore";
import * as api from "../../../src/services/api";
import type { EventSuggestion, RSVPStatus } from "../../../src/types";

const FILTERS = [
  { label: "🔥 active now", key: "active" },
  { label: "📅 this weekend", key: "weekend" },
  { label: "🎨 all", key: "all" },
];

export default function EventHubScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const tc = useThemeColors();
  const [activeFilter, setActiveFilter] = useState("active");

  const { groups, loadGroups, isLoading: groupsLoading } = useGroupStore();
  const { events, loadEvents, updateEvent, isLoading: eventsLoading } =
    useEventStore();
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

  const handleHubRsvp = useCallback(
    (event: EventSuggestion) => (status: RSVPStatus) => {
      if (!user) return;
      const prev =
        useEventStore.getState().events.find((e) => e.id === event.id) ??
        event;
      const optimistic = {
        id: `optimistic-${event.id}-${user.id}`,
        userId: user.id,
        eventId: event.id,
        status,
        updatedAt: new Date().toISOString(),
      };
      const nextRsvps = [
        ...(prev.rsvps ?? []).filter((r) => r.userId !== user.id),
        optimistic,
      ];
      updateEvent({ ...prev, rsvps: nextRsvps });

      void api
        .submitRSVP(event.id, status)
        .then((rsvp) => {
          const latest =
            useEventStore.getState().events.find((e) => e.id === event.id) ??
            prev;
          const merged = [
            ...(latest.rsvps ?? []).filter((r) => r.userId !== user.id),
            rsvp,
          ];
          updateEvent({ ...latest, rsvps: merged });
        })
        .catch((e: unknown) => {
          updateEvent(prev);
          Alert.alert(
            "Error",
            e instanceof Error ? e.message : "Could not update RSVP"
          );
        });
    },
    [updateEvent, user]
  );

  if (isBootstrapping) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={tc.primary} />
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
            <Ionicons name="notifications-outline" size={24} color={tc.primary} />
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
            welcome back, {firstName}!
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
              onRSVP={handleHubRsvp(event)}
            />
          ))}
        </View>
      </ScrollView>

      {/* FAB — Create Event */}
      <FloatingActionButton
        onPress={() => {
          router.push({
            pathname: "/(app)/event/create",
            params: firstGroup ? { groupId: firstGroup.id } : {},
          });
        }}
        icon="add"
      />
    </View>
  );
}
