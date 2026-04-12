import React from "react";
import { StandardEventCard } from "./StandardEventCard";
import { VotingEventCard } from "./VotingEventCard";
import type { EventSuggestion, RSVPStatus } from "../src/types";

interface EventCardNewProps {
  event: EventSuggestion;
  onPress?: () => void;
  onRSVP?: (status: RSVPStatus) => void;
  currentUserId?: string;
}

export function EventCardNew({
  event,
  onPress,
  onRSVP,
  currentUserId,
}: EventCardNewProps) {
  if (event.status === "voting") {
    return <VotingEventCard event={event} onPress={onPress} />;
  }

  return (
    <StandardEventCard
      event={event}
      onPress={onPress}
      onRSVP={onRSVP}
      currentUserId={currentUserId}
    />
  );
}
