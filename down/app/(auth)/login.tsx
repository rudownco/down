// Login screen with animated logo
// Using React Native's built-in Animated API (Expo Go compatible)

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../src/theme/colors';
import { Spacing, Radius, IconSize } from '../../src/theme/spacing';
import { Typography } from '../../src/theme/typography';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const { signInMock, isLoading } = useAuthStore();

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
        Animated.timing(downRotation, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }, 850);

    // Emoji drops in
    Animated.parallel([
      Animated.spring(emojiOffset, { toValue: 0, damping: 9, stiffness: 120, useNativeDriver: true, delay: 1100 }),
      Animated.spring(emojiOpacity, { toValue: 1, damping: 9, stiffness: 120, useNativeDriver: true, delay: 1100 }),
    ]).start();

    // Emoji levitates forever
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
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  const fontSize = width * 0.18;
  const fontSizeLg = width * 0.26;
  const emojiSize = width * 0.22;

  return (
    <LinearGradient
      colors={[Colors.appBackgroundDeep, Colors.appBackground]}
      style={styles.container}
    >
      {/* Logo */}
      <View style={styles.logoArea}>
        <Animated.Text
          style={[
            styles.ruText,
            { fontSize },
            { transform: [{ translateY: ruOffset }], opacity: ruOpacity },
          ]}
        >
          r u
        </Animated.Text>
        <Animated.Text
          style={[
            styles.downText,
            { fontSize: fontSizeLg },
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
            { fontSize: emojiSize, marginTop: Spacing.xs },
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

      <View style={{ height: Spacing.xxxl }} />

      {/* Auth buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentOffset }],
          },
        ]}
      >
        <Pressable style={styles.authButton} onPress={() => signInMock()}>
          <Ionicons name="logo-apple" size={IconSize.md} color={Colors.textPrimary} />
          <Text style={styles.authButtonText}>Continue with Apple</Text>
        </Pressable>

        <Pressable style={styles.authButton} onPress={() => signInMock()}>
          <Text style={{ fontSize: IconSize.md, fontWeight: '700' }}>G</Text>
          <Text style={styles.authButtonText}>Continue with Google</Text>
        </Pressable>
      </Animated.View>

      <View style={{ height: Spacing.lg }} />

      {/* Terms */}
      <Animated.Text
        style={[
          styles.terms,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentOffset }],
          },
        ]}
      >
        By continuing you agree to our Terms & Privacy Policy
      </Animated.Text>

      <View style={{ flex: 0.3 }} />

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Signing you in…</Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    flex: 0.5,
    justifyContent: 'center',
  },
  ruText: {
    fontWeight: '700',
    color: Colors.textOnBlueMuted,
  },
  downText: {
    fontWeight: '900',
    color: Colors.textOnBlue,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  authButtonText: {
    ...Typography.headline,
    color: Colors.textPrimary,
  },
  terms: {
    ...Typography.caption,
    color: Colors.textOnBlueFaint,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.subhead,
    color: Colors.textOnBlue,
  },
});
