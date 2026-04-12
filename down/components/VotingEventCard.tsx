import React from "react";
import { View, Text, Pressable } from "react-native";
import { SketchCard } from "./SketchCard";
import { BouncyButton } from "./BouncyButton";
import { getTotalVotes, useVotingCountdown } from "@down/common";
import type { EventSuggestion } from "../src/types";

interface VotingEventCardProps {
  event: EventSuggestion;
  onPress?: () => void;
}

export function VotingEventCard({ event, onPress }: VotingEventCardProps) {
  const totalVotes = getTotalVotes(event);
  const { timeLeft, isExpired } = useVotingCountdown(event.votingEndsAt);

  const metaParts: string[] = [];
  metaParts.push(`${totalVotes} ${totalVotes === 1 ? "vote" : "votes"}`);
  if (event.votingEndsAt) {
    metaParts.push(isExpired ? "Voting closed" : `Closes in ${timeLeft}`);
  }

  return (
    <Pressable onPress={onPress}>
      <SketchCard tilt={0} variant="accent" className="px-6 py-7 gap-3">
        <Text className="font-heading-extrabold text-2xl text-on-tertiary-container leading-tight">
          {event.title}
        </Text>

        <Text className="font-body-medium text-xs text-on-tertiary-container/80 italic">
          {metaParts.join(" · ")}
        </Text>

        <View className="mt-1">
          <BouncyButton
            title="Vote Now"
            onPress={onPress ?? (() => {})}
          />
        </View>
      </SketchCard>
    </Pressable>
  );
}
