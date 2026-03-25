// Event Hub — main dashboard matching Stitch export3
// "The Social Sketchbook" aesthetic

import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { EventCardNew } from "../../../components/EventCardNew";
import { JellybeanChip } from "../../../components/JellybeanChip";
import { FloatingActionButton } from "../../../components/FloatingActionButton";
import { AvatarCircle } from "../../../components/AvatarCircle";
import { useAuthStore } from "../../../src/stores/authStore";
import { getGreeting } from "../../../src/utils/greeting";
import { MockEvents, MockGroups } from "../../../src/mocks/data";

const FILTERS = [
  { label: "🔥 active now", key: "active" },
  { label: "📅 this weekend", key: "weekend" },
  { label: "🎨 all", key: "all" },
];

export default function EventHubScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState("active");

  const firstName = user?.name.split(" ")[0] ?? "Alex";

  // Hardcoded preview data
  const previewGroup = MockGroups.fridaySquad;
  const previewEvents = [MockEvents.pizzaNight, MockEvents.movieMarathon, MockEvents.gamingSession];

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-2 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <Text className="font-heading-extrabold text-3xl text-primary italic tracking-tighter -rotate-3">
            down
          </Text>
        </View>
        {user && (
          <AvatarCircle user={user} size="md" tilt={0} />
        )}
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
        <View className="px-6 mb-2">
          <View className="flex-row items-center gap-3 bg-surface-container-lowest rounded-card p-4"
            style={{ shadowColor: "#131D23", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 }}
          >
            <Text className="text-2xl">👥</Text>
            <View className="flex-1">
              <Text className="font-heading text-base text-on-surface">{previewGroup.name}</Text>
              <Text className="font-body text-xs text-on-surface-variant">
                {previewGroup.members.length} members · 2h ago
              </Text>
            </View>
            <View className="flex-row -space-x-2">
              {previewGroup.members.slice(0, 3).map((m) => (
                <AvatarCircle key={m.id} user={m} size="xs" tilt={0} />
              ))}
            </View>
          </View>
        </View>

        {/* Event cards */}
        <View className="px-6 gap-8">
          {previewEvents.map((event) => (
            <EventCardNew
              key={event.id}
              event={event}
              currentUserId={user?.id ?? "u1"}
              onPress={() =>
                router.push({
                  pathname: event.status === "voting"
                    ? "/(app)/event/[id]/vote"
                    : "/(app)/event/[id]/rsvp",
                  params: { id: event.id },
                })
              }
              onRSVP={(status) => {
                // Handle inline RSVP
              }}
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
