import React, { useRef } from "react";
import { Pressable, Text, Animated, View } from "react-native";
import { bouncyPressConfig, bouncyReleaseConfig } from "../lib/animations";

interface CategoryPillProps {
  label: string;
  emoji: string;
  selected?: boolean;
  onPress?: () => void;
  bgColor?: string;
  textColor?: string;
}

export function CategoryPill({
  label,
  emoji,
  selected = false,
  onPress,
  bgColor = "#E5EFF8",
  textColor = "#374955",
}: CategoryPillProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.timing(scale, bouncyPressConfig).start()}
        onPressOut={() => Animated.timing(scale, bouncyReleaseConfig).start()}
        style={{
          backgroundColor: bgColor,
          borderWidth: selected ? 2 : 0,
          borderColor: "#3F6377",
        }}
        className="flex-row items-center gap-2 px-5 py-3 rounded-chip"
      >
        <Text className="text-xl">{emoji}</Text>
        <Text
          className="font-body-medium text-sm"
          style={{ color: textColor }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
