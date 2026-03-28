// Login screen — "The Social Sketchbook" aesthetic
// Animated logo on light surface background

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const { signInWithGoogle, isLoading } = useAuth();

  // Animation values
  const ruOffset = useRef(new Animated.Value(-120)).current;
  const ruOpacity = useRef(new Animated.Value(0)).current;
  const downOffset = useRef(new Animated.Value(-160)).current;
  const downOpacity = useRef(new Animated.Value(0)).current;
  const downRotation = useRef(new Animated.Value(0)).current;
  const emojiOffset = useRef(new Animated.Value(-200)).current;
  const emojiOpacity = useRef(new Animated.Value(0)).current;
  const emojiLevitate = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentOffset = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // "r u" drops in
    Animated.parallel([
      Animated.spring(ruOffset, { toValue: 0, damping: 12, stiffness: 120, useNativeDriver: true, delay: 200 }),
      Animated.spring(ruOpacity, { toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true, delay: 200 }),
    ]).start();

    // "down?" drops in
    Animated.parallel([
      Animated.spring(downOffset, { toValue: 0, damping: 10, stiffness: 120, useNativeDriver: true, delay: 500 }),
      Animated.spring(downOpacity, { toValue: 1, damping: 10, stiffness: 120, useNativeDriver: true, delay: 500 }),
    ]).start();

    // "down?" shakes after landing
    setTimeout(() => {
      Animated.sequence([
        ...Array(6).fill(null).flatMap(() => [
          Animated.timing(downRotation, { toValue: 3, duration: 60, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(downRotation, { toValue: -3, duration: 60, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.timing(downRotation, { toValue: -3, duration: 100, useNativeDriver: true }),
      ]).start();
    }, 850);

    // Emoji drops in
    Animated.parallel([
      Animated.spring(emojiOffset, { toValue: 0, damping: 9, stiffness: 120, useNativeDriver: true, delay: 1100 }),
      Animated.spring(emojiOpacity, { toValue: 1, damping: 9, stiffness: 120, useNativeDriver: true, delay: 1100 }),
    ]).start();

    // Emoji levitates
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(emojiLevitate, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(emojiLevitate, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }, 1700);

    // Buttons fade in
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 500, delay: 1500, useNativeDriver: true }),
      Animated.timing(contentOffset, { toValue: 0, duration: 500, delay: 1500, useNativeDriver: true }),
    ]).start();
  }, []);

  const emojiTranslateY = emojiLevitate.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -8],
  });

  const downRotateStr = downRotation.interpolate({
    inputRange: [-3, 0, 3],
    outputRange: ["-3deg", "0deg", "3deg"],
  });

  const fontSize = width * 0.16;
  const fontSizeLg = width * 0.22;
  const emojiSize = width * 0.18;

  return (
    <View className="flex-1 bg-surface items-center justify-center">
      {/* Logo area */}
      <View className="items-center flex-[0.5] justify-center">
        <Animated.Text
          style={[
            {
              fontSize,
              fontFamily: "PlusJakartaSans_700Bold",
              color: "#374955",
            },
            { transform: [{ translateY: ruOffset }], opacity: ruOpacity },
          ]}
        >
          r u
        </Animated.Text>
        <Animated.Text
          style={[
            {
              fontSize: fontSizeLg,
              fontFamily: "PlusJakartaSans_800ExtraBold",
              color: "#3F6377",
              letterSpacing: -2,
            },
            {
              transform: [{ translateY: downOffset }, { rotate: downRotateStr }],
              opacity: downOpacity,
            },
          ]}
        >
          down?
        </Animated.Text>
        <Animated.Text
          style={[
            { fontSize: emojiSize, marginTop: 8 },
            {
              transform: [
                { translateY: Animated.add(emojiOffset, emojiTranslateY) },
              ],
              opacity: emojiOpacity,
            },
          ]}
        >
          👇
        </Animated.Text>
      </View>

      {/* Tagline */}
      <Text className="font-body text-tertiary italic text-base mb-8">
        time to assemble the dream team.
      </Text>

      {/* Auth buttons */}
      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ translateY: contentOffset }],
          width: "100%",
          paddingHorizontal: 24,
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => signInWithGoogle()}
          className="flex-row items-center justify-center gap-3 bg-surface-container-lowest py-4 px-6 rounded-button border border-outline-variant/30"
          style={{
            shadowColor: "#131D23",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 3,
          }}
        >
          <Ionicons name="logo-apple" size={22} color="#131D23" />
          <Text className="font-heading text-on-surface text-base">
            Continue with Apple
          </Text>
        </Pressable>

        <Pressable
          onPress={() => signInWithGoogle()}
          className="flex-row items-center justify-center gap-3 bg-surface-container-lowest py-4 px-6 rounded-button border border-outline-variant/30"
          style={{
            shadowColor: "#131D23",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 3,
          }}
        >
          <Text className="font-heading text-on-surface text-lg">G</Text>
          <Text className="font-heading text-on-surface text-base">
            Continue with Google
          </Text>
        </Pressable>
      </Animated.View>

      {/* Terms */}
      <Animated.Text
        style={{
          opacity: contentOpacity,
          transform: [{ translateY: contentOffset }],
          marginTop: 20,
        }}
        className="font-body text-xs text-outline text-center px-10"
      >
        By continuing you agree to our Terms & Privacy Policy
      </Animated.Text>

      <View style={{ flex: 0.2 }} />

      {/* Loading overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-scrim/30 items-center justify-center">
          <View className="bg-surface-container-lowest/90 rounded-card p-8 items-center gap-4">
            <ActivityIndicator size="large" color="#3F6377" />
            <Text className="font-heading text-primary text-base">
              Signing you in…
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
