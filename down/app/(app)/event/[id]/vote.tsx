// Voting screen — Social Sketchbook aesthetic

import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SketchCard, BouncyButton, AvatarStack, FilledInput, SectionLabel } from "../../../../components";
import { useAuth } from "../../../../src/context/AuthContext";
import { useGroupStore } from "../../../../src/stores/groupStore";
import { useEventStore } from "../../../../src/stores/eventStore";
import * as api from "../../../../src/services/api";
import { hasPermission, useVotingCountdown } from "@down/common";
import { cn } from "../../../../lib/utils";

export default function VoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { groups } = useGroupStore();
  const { events, updateEvent } = useEventStore();
  const event = events.find((e) => e.id === id);

  const { timeLeft, isExpired } = useVotingCountdown(event?.votingEndsAt);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggest time state
  const [suggestDate, setSuggestDate] = useState("");
  const [suggestTime, setSuggestTime] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);

  if (!event) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="font-body text-on-surface-variant">Event not found</Text>
      </View>
    );
  }

  // Find user's role in this event's group
  const eventGroup = groups.find((g) =>
    g.members.some((m) => m.id === user?.id)
  );
  const myRole = eventGroup?.members.find((m) => m.id === user?.id)?.role;
  const canSuggestTime = myRole ? hasPermission(myRole, 'event.suggest_time') : false;

  const toggleOption = (optionId: string) => {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedOptionIds.size === 0) return;
    setIsSubmitting(true);
    try {
      const updated = await api.submitVotes(event.id, Array.from(selectedOptionIds));
      updateEvent(updated);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
      setIsSubmitting(false);
    }
  };

  const handleSuggestTime = async () => {
    if (!suggestDate.trim() && !suggestTime.trim()) return;
    setIsSuggesting(true);
    try {
      const updated = await api.suggestTimeOption({
        event_id: event.id,
        date: suggestDate.trim() || "TBD",
        time: suggestTime.trim() || "TBD",
      });
      updateEvent(updated);
      setSuggestDate("");
      setSuggestTime("");
    } catch (e: any) {
      Alert.alert("Couldn't suggest time", e.message);
    } finally {
      setIsSuggesting(false);
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
          Vote
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 120, gap: 24 }}
      >
        {/* Event info */}
        <SketchCard tilt={-1} variant="accent" className="gap-3">
          <Text className="font-heading-extrabold text-2xl text-on-tertiary-container">
            {event.title}
          </Text>
          {event.description && (
            <Text className="font-body text-on-tertiary-container/80 text-base leading-relaxed">
              {event.description}
            </Text>
          )}
          <View className="flex-row items-center gap-3 mt-2">
            <View className="bg-surface-container-lowest/20 px-3 py-1 rounded-chip">
              <Text className="font-heading text-xs text-on-tertiary-container">
                {event.votingOptions?.length ?? 0} OPTIONS
              </Text>
            </View>
            {event.votingEndsAt && (
              <View className={cn(
                "px-3 py-1 rounded-chip",
                isExpired ? "bg-error/20" : "bg-surface-container-lowest/20"
              )}>
                <Text className={cn(
                  "font-heading text-xs",
                  isExpired ? "text-error" : "text-on-tertiary-container"
                )}>
                  {isExpired ? "⏱ Voting closed" : `⏱ ${timeLeft} left`}
                </Text>
              </View>
            )}
          </View>
        </SketchCard>

        {/* Voting options */}
        <View className="gap-4">
          <Text className="font-heading text-xl text-primary">
            pick your times
          </Text>
          {event.votingOptions?.map((option) => {
            const isSelected = selectedOptionIds.has(option.id);
            return (
              <Pressable key={option.id} onPress={() => toggleOption(option.id)}>
                <SketchCard
                  tilt={0}
                  variant={isSelected ? "nested" : "default"}
                  className={cn(
                    "flex-row items-center justify-between gap-3",
                    isSelected && "border-2 border-primary/30"
                  )}
                >
                  <View className="flex-1 gap-1">
                    <Text className="font-heading text-base text-on-surface">
                      {option.date}
                    </Text>
                    <Text className="font-body text-sm text-on-surface-variant">
                      {option.time}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    {option.voters && option.voters.length > 0 && (
                      <AvatarStack users={option.voters} maxVisible={2} size="xs" />
                    )}
                    <View className="bg-primary-container px-3 py-1 rounded-chip">
                      <Text className="font-heading text-xs text-primary">
                        {option.votes}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#3F6377" />
                    )}
                  </View>
                </SketchCard>
              </Pressable>
            );
          })}
        </View>

        {/* Suggest a time — Members+ only */}
        {canSuggestTime && event.status === 'voting' && (
          <View className="gap-3">
            <SectionLabel text="suggest a time" />
            <SketchCard tilt={0.8} variant="default" className="gap-3">
              <FilledInput
                placeholder="MM/DD/YYYY"
                value={suggestDate}
                onChangeText={setSuggestDate}
                icon="calendar-outline"
                keyboardType="numbers-and-punctuation"
              />
              <FilledInput
                placeholder="7:00 PM"
                value={suggestTime}
                onChangeText={setSuggestTime}
                icon="time-outline"
              />
              <BouncyButton
                title={isSuggesting ? "Suggesting..." : "Suggest This Time"}
                variant="secondary"
                onPress={handleSuggestTime}
                disabled={(!suggestDate.trim() && !suggestTime.trim()) || isSuggesting}
                loading={isSuggesting}
              />
            </SketchCard>
          </View>
        )}
      </ScrollView>

      {/* Submit */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-surface/90">
        <BouncyButton
          title={`Cast Vote (${selectedOptionIds.size})`}
          onPress={handleSubmit}
          disabled={selectedOptionIds.size === 0 || isSubmitting}
          loading={isSubmitting}
        />
      </View>
    </View>
  );
}
