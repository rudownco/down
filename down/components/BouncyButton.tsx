import React, { useRef } from "react";
import { Pressable, Text, Animated, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../lib/utils";
import { bouncyPressConfig, bouncyReleaseConfig } from "../lib/animations";

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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) Animated.timing(scale, bouncyPressConfig).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, bouncyReleaseConfig).start();
  };

  const content = (
    <View className="flex-row items-center justify-center gap-2.5">
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#3F6377"} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === "primary" || variant === "danger" ? "#FFFFFF" : "#3F6377"}
            />
          )}
          <Text
            className={cn(
              "font-heading text-base",
              variant === "primary" && "text-on-primary",
              variant === "secondary" && "text-primary",
              variant === "outline" && "text-primary",
              variant === "ghost" && "text-primary",
              variant === "danger" && "text-on-error"
            )}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

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
        {variant === "primary" ? (
          <LinearGradient
            colors={["#3F6377", "#4A7A92"]}
            className="rounded-button py-4 px-6 items-center justify-center"
            style={{
              shadowColor: "#3F6377",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            {content}
          </LinearGradient>
        ) : (
          <View
            className={cn(
              "rounded-button py-4 px-6 items-center justify-center",
              variant === "secondary" && "bg-primary-container",
              variant === "outline" && "bg-transparent border-2 border-outline-variant",
              variant === "ghost" && "bg-transparent",
              variant === "danger" && "bg-error"
            )}
          >
            {content}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
