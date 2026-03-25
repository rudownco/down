import React, { useRef } from "react";
import { Pressable, Text, Animated } from "react-native";
import { cn } from "../lib/utils";
import { bouncyPressConfig, bouncyReleaseConfig } from "../lib/animations";

interface JellybeanChipProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "neutral";
  className?: string;
}

const VARIANT_STYLES = {
  primary: { bg: "bg-primary-container", text: "text-on-primary-container", selectedBg: "bg-primary", selectedText: "text-on-primary" },
  secondary: { bg: "bg-secondary-container", text: "text-on-secondary-container", selectedBg: "bg-secondary", selectedText: "text-on-secondary" },
  tertiary: { bg: "bg-tertiary-container", text: "text-on-tertiary-container", selectedBg: "bg-tertiary", selectedText: "text-on-tertiary" },
  neutral: { bg: "bg-surface-container-highest", text: "text-on-surface-variant", selectedBg: "bg-primary", selectedText: "text-on-primary" },
};

export function JellybeanChip({
  label,
  emoji,
  selected = false,
  onPress,
  variant = "neutral",
  className,
}: JellybeanChipProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const styles = VARIANT_STYLES[variant];

  const handlePressIn = () => {
    Animated.timing(scale, bouncyPressConfig).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, bouncyReleaseConfig).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={cn(
          "flex-row items-center gap-1.5 px-5 py-2.5 rounded-chip",
          selected ? styles.selectedBg : styles.bg,
          className
        )}
      >
        {emoji && <Text className="text-lg">{emoji}</Text>}
        <Text
          className={cn(
            "font-body-medium text-sm",
            selected ? styles.selectedText : styles.text
          )}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
