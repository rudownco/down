import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../lib/utils";
import type { RSVPStatus } from "../src/types";

interface RSVPButtonRowProps {
  selectedStatus?: RSVPStatus;
  onSelect: (status: RSVPStatus) => void;
  className?: string;
}

const BUTTONS: {
  status: RSVPStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  selectedBg: string;
  text: string;
  selectedText: string;
}[] = [
  {
    status: "going",
    label: "I'm down",
    icon: "checkmark-circle",
    bg: "bg-surface-container-high",
    selectedBg: "bg-secondary-container",
    text: "text-on-surface-variant",
    selectedText: "text-on-secondary-container",
  },
  {
    status: "maybe",
    label: "Maybe...",
    icon: "help-circle",
    bg: "bg-surface-container-high",
    selectedBg: "bg-primary-container",
    text: "text-on-surface-variant",
    selectedText: "text-on-primary-container",
  },
  {
    status: "not_going",
    label: "Flaking",
    icon: "close-circle",
    bg: "bg-surface-container-high",
    selectedBg: "bg-error-container",
    text: "text-on-surface-variant",
    selectedText: "text-on-error-container",
  },
];

export function RSVPButtonRow({
  selectedStatus,
  onSelect,
  className,
}: RSVPButtonRowProps) {
  return (
    <View className={cn("flex-row gap-2", className)}>
      {BUTTONS.map((btn) => {
        const isSelected = selectedStatus === btn.status;
        return (
          <Pressable
            key={btn.status}
            onPress={() => onSelect(btn.status)}
            className={cn(
              "flex-1 items-center justify-center gap-1 py-3 rounded-input",
              isSelected ? btn.selectedBg : btn.bg
            )}
          >
            <Ionicons
              name={isSelected ? btn.icon : (`${btn.icon}-outline` as any)}
              size={20}
              color={isSelected ? "#264F2C" : "#374955"}
            />
            <Text
              className={cn(
                "font-heading text-[10px] uppercase tracking-wider",
                isSelected ? btn.selectedText : btn.text
              )}
            >
              {btn.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
