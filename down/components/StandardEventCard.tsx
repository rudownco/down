import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SketchCard } from "./SketchCard";
import { RSVPButtonRow } from "./RSVPButtonRow";
import { getConfirmedTimeOption, EventCategoryMeta, DressCodeMeta } from "@down/common";
import { useThemeColors } from "../src/hooks/useThemeColors";
import type { EventSuggestion, RSVPStatus } from "../src/types";

interface StandardEventCardProps {
  event: EventSuggestion;
  onPress?: () => void;
  onRSVP?: (status: RSVPStatus) => void;
  currentUserId?: string;
}

export function StandardEventCard({
  event,
  onPress,
  onRSVP,
  currentUserId,
}: StandardEventCardProps) {
  const tc = useThemeColors();
  const currentRSVP = event.rsvps?.find((r) => r.userId === currentUserId)?.status;

  // Resolved time: prefer confirmed voting option, then event.date/time
  const confirmedOption = getConfirmedTimeOption(event);
  const displayDate = confirmedOption?.date ?? event.date;
  const displayTime = confirmedOption?.time ?? event.time;

  // Category tag
  const catMeta =
    event.category && event.category in EventCategoryMeta
      ? EventCategoryMeta[event.category]
      : null;

  // Dress code tag
  const dressMeta =
    event.dressCode && event.dressCode in DressCodeMeta
      ? DressCodeMeta[event.dressCode]
      : null;

  const [localRsvp, setLocalRsvp] = useState<RSVPStatus | null>(
    currentRSVP ?? null
  );

  useEffect(() => {
    setLocalRsvp(currentRSVP ?? null);
  }, [event.id, currentUserId, currentRSVP]);

  const handleRsvpSelect = (status: RSVPStatus) => {
    setLocalRsvp(status);
    onRSVP?.(status);
  };

  const serverStatus = currentRSVP ?? null;

  const handleCardPress = () => {
    if (
      onRSVP != null &&
      localRsvp != null &&
      localRsvp !== serverStatus
    ) {
      onRSVP(localRsvp);
    }
    onPress?.();
  };

  return (
    <SketchCard tilt={0} className="px-6 py-7 gap-6">
      {/* Category tag — top right */}
      {catMeta && (
        <View className="absolute top-4 right-4 bg-surface-container-high px-3 py-1.5 rounded-chip flex-row items-center gap-1.5 z-10">
          <Text className="text-xs">{catMeta.emoji}</Text>
          <Text className="font-heading text-[10px] text-on-surface-variant uppercase tracking-wider">
            {catMeta.label}
          </Text>
        </View>
      )}

      <Pressable onPress={handleCardPress} className="gap-2 pr-24">
        <Text className="font-heading-extrabold text-3xl text-on-surface leading-tight">
          {event.title}
        </Text>
        {displayDate && (
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="calendar-outline" size={16} color={tc.onSurfaceVariant} />
            <Text className="font-body text-base text-on-surface-variant">
              {displayDate}{displayTime ? ` at ${displayTime}` : ""}
            </Text>
          </View>
        )}
        {event.location && (
          <View className="flex-row items-center gap-2">
            <Ionicons name="location-outline" size={16} color={tc.onSurfaceVariant} />
            <Text className="font-body text-base text-on-surface-variant">
              {event.location}
            </Text>
          </View>
        )}
        {event.description && (
          <Text className="font-body text-sm text-on-surface-variant mt-2">
            {event.description}
          </Text>
        )}
        {dressMeta && (
          <View className="flex-row items-center gap-2 mt-3">
            <View className="bg-surface-container-high px-3 py-1.5 rounded-chip flex-row items-center gap-1.5">
              <Text className="text-xs">{dressMeta.emoji}</Text>
              <Text className="font-heading text-[10px] text-on-surface-variant uppercase tracking-wider">
                {dressMeta.label}
              </Text>
            </View>
            {event.dressCodeNote && (
              <Text className="font-body text-xs text-on-surface-variant italic flex-1" numberOfLines={2}>
                {event.dressCodeNote}
              </Text>
            )}
          </View>
        )}
      </Pressable>

      {/* RSVP buttons — outside card Pressable so taps never navigate */}
      {onRSVP && (
        <RSVPButtonRow
          eventId={event.id}
          selectedStatus={localRsvp ?? undefined}
          onSelect={handleRsvpSelect}
        />
      )}
    </SketchCard>
  );
}
