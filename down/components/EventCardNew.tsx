import React, { useMemo } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SketchCard } from "./SketchCard";
import { AvatarStack } from "./AvatarStack";
import { RSVPButtonRow } from "./RSVPButtonRow";
import { randomTilt } from "../lib/animations";
import type { EventSuggestion, RSVPStatus } from "../src/types";

interface EventCardNewProps {
  event: EventSuggestion;
  onPress?: () => void;
  onRSVP?: (status: RSVPStatus) => void;
  currentUserId?: string;
}

const CATEGORY_TAGS: Record<string, string> = {
  food: "🍕 FOOD",
  drinks: "🍹 DRINKS",
  movie: "🍿 MOVIE",
  outdoor: "🌲 OUTDOORS",
  games: "🎮 GAMES",
};

export function EventCardNew({
  event,
  onPress,
  onRSVP,
  currentUserId,
}: EventCardNewProps) {
  const tilt = useMemo(() => randomTilt(1.5), []);
  const goingCount = event.rsvps?.filter((r) => r.status === "going").length ?? 0;
  const currentRSVP = event.rsvps?.find((r) => r.userId === currentUserId)?.status;

  return (
    <Pressable onPress={onPress}>
      <SketchCard tilt={tilt} className="gap-4">
        {/* Cover image placeholder */}
        <View className="h-44 rounded-input overflow-hidden bg-surface-container relative">
          <View className="w-full h-full bg-primary-container/30 items-center justify-center">
            <Text className="text-4xl">
              {event.title.match(/[\p{Emoji}]/u)?.[0] ?? "🎉"}
            </Text>
          </View>
          {/* Category tag */}
          <View className="absolute top-3 right-3 bg-surface-container-lowest/90 px-3 py-1 rounded-chip">
            <Text className="font-heading text-xs text-primary">
              {event.status === "voting" ? "📊 VOTING" : "🎉 EVENT"}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View className="gap-1.5">
          <Text className="font-heading text-xl text-on-surface">
            {event.title}
          </Text>
          {event.date && (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="calendar-outline" size={14} color="#76574E" />
              <Text className="font-body text-sm text-tertiary">
                {event.date}{event.time ? ` at ${event.time}` : ""}
              </Text>
            </View>
          )}
          {event.location && (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="location-outline" size={14} color="#76574E" />
              <Text className="font-body text-sm text-tertiary">
                {event.location}
              </Text>
            </View>
          )}
        </View>

        {/* Attendees + count */}
        <View className="flex-row items-center justify-between">
          {event.attendees && event.attendees.length > 0 && (
            <AvatarStack
              users={event.attendees}
              maxVisible={3}
              size="sm"
              borderColor="#FFFFFF"
            />
          )}
          {goingCount > 0 && (
            <Text className="font-heading text-sm text-secondary italic">
              {goingCount} are DOWN!
            </Text>
          )}
        </View>

        {/* RSVP buttons */}
        {onRSVP && (
          <RSVPButtonRow
            selectedStatus={currentRSVP}
            onSelect={onRSVP}
          />
        )}

        {/* Voting CTA */}
        {event.status === "voting" && !onRSVP && (
          <View className="bg-primary-container/30 rounded-input py-2.5 items-center">
            <Text className="font-heading text-sm text-primary">
              🗳️ {event.votingOptions?.length ?? 0} options — tap to vote
            </Text>
          </View>
        )}
      </SketchCard>
    </Pressable>
  );
}
