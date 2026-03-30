// Group Detail screen — Social Sketchbook aesthetic

import React, { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EventCardNew, AvatarCircle, SectionLabel, FloatingActionButton } from "../../../components";
import { useAuth } from "../../../src/context/AuthContext";
import { useGroupStore } from "../../../src/stores/groupStore";
import { useEventStore } from "../../../src/stores/eventStore";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { groups } = useGroupStore();
  const { events, loadEvents } = useEventStore();

  const group = groups.find((g) => g.id === id);

  useEffect(() => {
    if (id) loadEvents(id);
  }, [id]);

  if (!group) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="font-body text-on-surface-variant">Group not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row items-center gap-4">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#3F6377" />
        </Pressable>
        <View className="flex-1">
          <Text className="font-heading-extrabold text-2xl text-on-surface">
            {group.name}
          </Text>
          <Text className="font-body text-xs text-on-surface-variant">
            {group.memberCount} members
          </Text>
        </View>
        <Pressable>
          <Ionicons name="settings-outline" size={22} color="#677A86" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, gap: 24 }}
      >
        {/* Members */}
        <View className="gap-3">
          <SectionLabel text="members" className="px-6" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {group.members.map((member) => (
              <View key={member.id} className="items-center gap-1.5">
                <AvatarCircle user={member} size="lg" tilt={1} />
                <Text className="font-body-medium text-xs text-on-surface">
                  {member.name.split(" ")[0]}
                </Text>
              </View>
            ))}
            <Pressable className="items-center gap-1.5">
              <View className="w-14 h-14 rounded-full border-2 border-dashed border-outline-variant items-center justify-center">
                <Ionicons name="add" size={22} color="#677A86" />
              </View>
              <Text className="font-body-medium text-xs text-outline">Invite</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Events */}
        <View className="px-6 gap-4">
          <SectionLabel text="hangouts" />
          {events.length === 0 ? (
            <View className="items-center py-12 gap-4">
              <Text className="text-4xl">📭</Text>
              <Text className="font-heading text-lg text-on-surface">no hangouts planned yet</Text>
              <Text className="font-body text-sm text-on-surface-variant text-center">
                be the first to suggest something!
              </Text>
            </View>
          ) : (
            <View className="gap-8">
              {events.map((event) => (
                <EventCardNew
                  key={event.id}
                  event={event}
                  currentUserId={user?.id}
                  onPress={() =>
                    router.push({
                      pathname: event.status === "voting"
                        ? "/(app)/event/[id]/vote"
                        : "/(app)/event/[id]/rsvp",
                      params: { id: event.id },
                    })
                  }
                  onRSVP={() => {}}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={() =>
          router.push({
            pathname: "/(app)/event/create",
            params: { groupId: id },
          })
        }
      />
    </View>
  );
}
