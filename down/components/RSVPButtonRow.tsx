import React, { useMemo } from "react";
import { View } from "react-native";
import { getRsvpEmojiSet } from "@down/common";
import { cn } from "../lib/utils";
import { RSVPAnimatedButton, type RSVPTapAnimation } from "./RSVPAnimatedButton";
import type { RSVPStatus } from "../src/types";

interface RSVPButtonRowProps {
  eventId: string;
  selectedStatus?: RSVPStatus | null;
  onSelect: (status: RSVPStatus) => void;
  className?: string;
}

const BUTTONS: {
  status: RSVPStatus;
  label: string;
  animation: RSVPTapAnimation;
}[] = [
  { status: "going", label: "I'm down", animation: "shake" },
  { status: "maybe", label: "Maybe...", animation: "pulse" },
  { status: "not_going", label: "Flaking", animation: "wilt" },
];

export function RSVPButtonRow({
  eventId,
  selectedStatus,
  onSelect,
  className,
}: RSVPButtonRowProps) {
  const emojis = useMemo(() => getRsvpEmojiSet(eventId), [eventId]);

  return (
    <View className={cn("flex-row gap-2", className)}>
      {BUTTONS.map((btn) => (
        <RSVPAnimatedButton
          key={btn.status}
          status={btn.status}
          label={btn.label}
          emoji={emojis[btn.status]}
          selected={selectedStatus === btn.status}
          animation={btn.animation}
          onPress={() => onSelect(btn.status)}
        />
      ))}
    </View>
  );
}
