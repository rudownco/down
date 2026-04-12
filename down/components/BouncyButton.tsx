import React, { useRef } from "react";
import {
  Pressable,
  Text,
  Animated,
  ActivityIndicator,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../lib/utils";
import { bouncyPressConfig, bouncyReleaseConfig } from "../lib/animations";
import { useThemeColors, type ResolvedColors } from "../src/hooks/useThemeColors";

interface BouncyButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

function getVariants(tc: ResolvedColors) {
  return {
    primary: { bg: tc.primary, text: tc.onPrimary },
    secondary: { bg: tc.primaryContainer, text: tc.onPrimaryContainer },
    outline: { bg: "transparent", text: tc.primary, border: tc.outlineVariant },
    ghost: { bg: "transparent", text: tc.primary },
    danger: { bg: tc.error, text: tc.onError },
  } as const;
}

export function BouncyButton({
  title,
  onPress,
  variant = "primary",
  fullWidth = true,
  disabled = false,
  loading = false,
  icon,
  className,
}: BouncyButtonProps) {
  const tc = useThemeColors();
  const scale = useRef(new Animated.Value(1)).current;
  const variants = getVariants(tc);
  const v = variants[variant];

  const handlePressIn = () => {
    if (!disabled) Animated.timing(scale, bouncyPressConfig).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, bouncyReleaseConfig).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 }}
      className={cn(fullWidth && "w-full")}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        className={cn(className)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            borderRadius: 9999,
            paddingVertical: 18,
            paddingHorizontal: 28,
            backgroundColor: v.bg,
            borderWidth: "border" in v ? 2 : 0,
            borderColor: "border" in v ? v.border : "transparent",
            shadowColor: variant === "primary" ? v.bg : "transparent",
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
              {icon && (
                <Ionicons name={icon} size={20} color={v.text} />
              )}
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontSize: 16,
                  color: v.text,
                }}
              >
                {title}
              </Text>
              {variant === "primary" && !icon && (
                <Ionicons name="chevron-forward" size={18} color={v.text} />
              )}
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
