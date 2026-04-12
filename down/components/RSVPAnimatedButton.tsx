import React, { useCallback, useRef } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { cn } from "../lib/utils";
import type { RSVPStatus } from "../src/types";

export type RSVPTapAnimation = "shake" | "pulse" | "wilt";

const SHAKE_MS = 42;
const LOCK_MS = 420;

interface RSVPAnimatedButtonProps {
  status: RSVPStatus;
  label: string;
  emoji: string;
  selected: boolean;
  animation: RSVPTapAnimation;
  onPress: () => void;
  className?: string;
}

function triggerHaptic(style: "light" | "medium" | "soft") {
  void Haptics.impactAsync(
    style === "light"
      ? Haptics.ImpactFeedbackStyle.Light
      : style === "soft"
        ? Haptics.ImpactFeedbackStyle.Soft
        : Haptics.ImpactFeedbackStyle.Medium
  );
}

export function RSVPAnimatedButton({
  status,
  label,
  emoji,
  selected,
  animation,
  onPress,
  className,
}: RSVPAnimatedButtonProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const unlockAt = useRef(0);

  const runShake = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.07, {
        duration: 130,
        easing: Easing.out(Easing.cubic),
      }),
      withDelay(
        80,
        withSpring(1, { damping: 16, stiffness: 280 })
      )
    );
    translateX.value = withDelay(
      115,
      withSequence(
        withTiming(6, {
          duration: SHAKE_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-6, {
          duration: SHAKE_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(5, {
          duration: 36,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-5, {
          duration: 36,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 48,
          easing: Easing.out(Easing.cubic),
        })
      )
    );
  }, [scale, translateX]);

  const runPulse = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.08, {
        duration: 160,
        easing: Easing.out(Easing.cubic),
      }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
  }, [scale]);

  const runWilt = useCallback(() => {
    const wiltIn = {
      duration: 175,
      easing: Easing.inOut(Easing.ease),
    };
    const wiltOut = {
      duration: 205,
      easing: Easing.out(Easing.cubic),
    };
    scale.value = withSequence(
      withTiming(0.88, wiltIn),
      withSpring(1, { damping: 17, stiffness: 260 })
    );
    opacity.value = withSequence(
      withTiming(0.68, wiltIn),
      withTiming(1, wiltOut)
    );
    translateY.value = withSequence(
      withTiming(8, wiltIn),
      withTiming(0, wiltOut)
    );
    rotation.value = withSequence(
      withTiming(-0.055, wiltIn),
      withTiming(0, wiltOut)
    );
  }, [opacity, rotation, scale, translateY]);

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now < unlockAt.current) return;
    unlockAt.current = now + LOCK_MS;

    translateX.value = 0;
    translateY.value = 0;
    rotation.value = 0;
    opacity.value = 1;

    onPress();

    if (animation === "shake") {
      triggerHaptic("medium");
      runShake();
    } else if (animation === "pulse") {
      triggerHaptic("light");
      runPulse();
    } else {
      triggerHaptic("soft");
      runWilt();
    }

    setTimeout(() => {
      unlockAt.current = 0;
    }, LOCK_MS);
  }, [animation, onPress, opacity, rotation, runPulse, runShake, runWilt, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
    opacity: opacity.value,
  }));

  const containerClass = selected
    ? status === "going"
      ? "bg-secondary-container border-2 border-secondary"
      : status === "maybe"
        ? "bg-surface-container-high border-2 border-outline"
        : "bg-error-container border-2 border-error"
    : "bg-surface-container-low border border-outline-variant";

  const labelClass = selected
    ? status === "going"
      ? "text-on-secondary-container"
      : status === "maybe"
        ? "text-on-surface"
        : "text-on-error-container"
    : "text-on-surface-variant";

  return (
    <Pressable
      onPress={handlePress}
      className={cn("flex-1 min-w-0", className)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}${selected ? ", selected" : ""}`}
      hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
    >
      <Animated.View
        className={cn(
          "items-center justify-center gap-2 py-5 rounded-card",
          containerClass
        )}
        style={animatedStyle}
      >
        <Text className="text-[28px] leading-[32px]">{emoji}</Text>
        <Text
          className={cn(
            "font-heading text-[11px] uppercase tracking-wider",
            labelClass
          )}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
