import React, { useRef } from "react";
import {
  Pressable,
  Text,
  Animated,
  ActivityIndicator,
  View,
} from "react-native";
import type { ButtonProps } from "./index";

const PRESS_CONFIG = { toValue: 0.95, duration: 100, useNativeDriver: true };
const RELEASE_CONFIG = { toValue: 1.0, duration: 200, useNativeDriver: true };

const VARIANTS = {
  primary: { bg: "#3F6377", text: "#FFFFFF" },
  secondary: { bg: "#C4E7FF", text: "#274B5F" },
  outline: { bg: "transparent", text: "#3F6377", border: "#B6C9D7" },
  ghost: { bg: "transparent", text: "#3F6377" },
  danger: { bg: "#BA1A1A", text: "#FFFFFF" },
} as const;

export function Button({
  title,
  onPress,
  variant = "primary",
  fullWidth = true,
  disabled = false,
  loading = false,
  iconRight,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const v = VARIANTS[variant];

  const handlePressIn = () => {
    if (!disabled) Animated.timing(scale, PRESS_CONFIG).start();
  };
  const handlePressOut = () => {
    Animated.timing(scale, RELEASE_CONFIG).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? "100%" : undefined,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 9999,
            paddingVertical: 18,
            paddingHorizontal: 28,
            backgroundColor: v.bg,
            borderWidth: "border" in v ? 2 : 0,
            borderColor: "border" in v ? v.border : "transparent",
            shadowColor: variant === "primary" ? "#3F6377" : "transparent",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: variant === "primary" ? 0.25 : 0,
            shadowRadius: 16,
            elevation: variant === "primary" ? 6 : 0,
          }}
        >
          {loading ? (
            <ActivityIndicator color={v.text} />
          ) : (
            <>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontSize: 16,
                  color: v.text,
                }}
              >
                {title}
              </Text>
              {iconRight}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
