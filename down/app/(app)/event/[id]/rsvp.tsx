// RSVP screen — Social Sketchbook aesthetic

import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SketchCard, RSVPButtonRow, BouncyButton, AvatarCircle, SectionLabel } from "../../../../components";
import { useAuth } from "../../../../src/context/AuthContext";
import { useEventStore } from "../../../../src/stores/eventStore";
import * as api from "../../../../src/services/api";
import type { EventSuggestion, RSVPStatus } from "../../../../src/types";

export default function RSVPScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { events, updateEvent } = useEventStore();
  const event = events.find((e) => e.id === id);

  const [selectedStatus, setSelectedStatus] = useState<RSVPStatus | undefined>(
    event?.rsvps?.find((r) => r.userId === user?.id)?.status
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="font-body text-on-surface-variant">Event not found</Text>
      </View>
    );
  }

  const goingRSVPs = event.rsvps?.filter((r) => r.status === "going") ?? [];
  const maybeRSVPs = event.rsvps?.filter((r) => r.status === "maybe") ?? [];
  const notGoingRSVPs = event.rsvps?.filter((r) => r.status === "not_going") ?? [];

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    setIsSubmitting(true);
    try {
      const rsvp = await api.submitRSVP(event.id, selectedStatus);
      // Update the event in the store with the new/updated RSVP
      const updatedRsvps = [
        ...(event.rsvps ?? []).filter((r) => r.userId !== rsvp.userId),
        rsvp,
      ];
      updateEvent({ ...event, rsvps: updatedRsvps } as EventSuggestion);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row items-center gap-4">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#3F6377" />
        </Pressable>
        <Text className="font-heading text-lg text-on-surface flex-1">
          RSVP
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 120, gap: 24 }}
      >
        {/* Event hero */}
        <SketchCard tilt={-0.8} className="gap-3">
          <Text className="font-heading-extrabold text-2xl text-on-surface">
            {event.title}
          </Text>
          {event.date && (
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={16} color="#76574E" />
              <Text className="font-body text-sm text-tertiary">
                {event.date}{event.time ? ` at ${event.time}` : ""}
              </Text>
            </View>
          )}
          {event.location && (
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={16} color="#76574E" />
              <Text className="font-body text-sm text-tertiary">
                {event.location}
              </Text>
            </View>
          )}
          {event.description && (
            <Text className="font-body text-sm text-on-surface-variant mt-1">
              {event.description}
            </Text>
          )}
        </SketchCard>

        {/* RSVP selector */}
        <View className="gap-3">
          <Text className="font-heading text-xl text-primary">
            are you down?
          </Text>
          <RSVPButtonRow
            selectedStatus={selectedStatus}
            onSelect={setSelectedStatus}
          />
          <Text className="font-body-medium text-xs text-outline italic text-center mt-1">
            Don't flake 👀
          </Text>
        </View>

        {/* Attendee lists */}
        {goingRSVPs.length > 0 && (
          <View className="gap-3">
            <SectionLabel text={`going (${goingRSVPs.length})`} />
            <View className="flex-row flex-wrap gap-3">
              {goingRSVPs.map((r) => {
                const attendee = event.attendees?.find((a) => a.id === r.userId);
                if (!attendee) return null;
                return (
                  <View key={r.id} className="items-center gap-1">
                    <AvatarCircle user={attendee} size="md" tilt={1} />
                    <Text className="font-body text-xs text-on-surface">
                      {attendee.name.split(" ")[0]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {maybeRSVPs.length > 0 && (
          <View className="gap-3">
            <SectionLabel text={`maybe (${maybeRSVPs.length})`} />
            <View className="flex-row flex-wrap gap-3">
              {maybeRSVPs.map((r) => {
                const attendee = event.attendees?.find((a) => a.id === r.userId);
                if (!attendee) return null;
                return (
                  <View key={r.id} className="items-center gap-1">
                    <AvatarCircle user={attendee} size="md" tilt={-1} />
                    <Text className="font-body text-xs text-on-surface-variant">
                      {attendee.name.split(" ")[0]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Submit */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-surface/90">
        <BouncyButton
          title="Confirm RSVP"
          onPress={handleSubmit}
          disabled={!selectedStatus || isSubmitting}
          loading={isSubmitting}
        />
      </View>
    </View>
  );
}
