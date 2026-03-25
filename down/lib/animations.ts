// Shared animation configs for the Social Sketchbook design system
// Used with react-native Animated API (Expo Go compatible)

import { Easing } from "react-native";

/** Spring-like timing config for bouncy button press */
export const bouncyPressConfig = {
  toValue: 0.95,
  duration: 100,
  easing: Easing.inOut(Easing.ease),
  useNativeDriver: true,
};

export const bouncyReleaseConfig = {
  toValue: 1,
  duration: 300,
  easing: Easing.out(Easing.back(1.7)),
  useNativeDriver: true,
};

/** Generate a random tilt angle for sketchbook card aesthetic */
export function randomTilt(max: number = 1.5): number {
  return (Math.random() - 0.5) * 2 * max;
}

/** Elastic entry cubic bezier approximation */
export const elasticEasing = Easing.bezier(0.34, 1.56, 0.64, 1);
