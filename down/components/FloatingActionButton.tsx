import React, { useRef } from "react";
import { Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { bouncyPressConfig, bouncyReleaseConfig } from "../lib/animations";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function FloatingActionButton({
  onPress,
  icon = "add",
}: FloatingActionButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, { ...bouncyPressConfig, toValue: 0.9 }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, bouncyReleaseConfig).start();
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        right: 24,
        bottom: 100,
        transform: [{ scale }],
        shadowColor: "#3F6377",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 12,
        zIndex: 40,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="w-16 h-16 rounded-full bg-primary items-center justify-center"
      >
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}
