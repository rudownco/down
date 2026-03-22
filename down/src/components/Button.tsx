// App button with variant system
// Translated from ios/down/DesignSystem/Styles/AppButtonStyle.swift

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'card';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  { bg: string; bgPressed: string; fg: string; borderColor: string; borderWidth: number }
> = {
  primary: {
    bg: '#FFFFFF',
    bgPressed: 'rgba(255,255,255,0.88)',
    fg: Colors.appBackground,
    borderColor: 'transparent',
    borderWidth: 0,
  },
  secondary: {
    bg: 'rgba(255,255,255,0.18)',
    bgPressed: 'rgba(255,255,255,0.28)',
    fg: Colors.textOnBlue,
    borderColor: 'transparent',
    borderWidth: 0,
  },
  ghost: {
    bg: 'transparent',
    bgPressed: 'rgba(255,255,255,0.12)',
    fg: Colors.textOnBlue,
    borderColor: 'rgba(255,255,255,0.40)',
    borderWidth: 1,
  },
  danger: {
    bg: '#F53D3D',
    bgPressed: 'rgba(245,61,61,0.88)',
    fg: '#FFFFFF',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  card: {
    bg: '#FFFFFF',
    bgPressed: 'rgba(255,255,255,0.88)',
    fg: Colors.textPrimary,
    borderColor: Colors.divider,
    borderWidth: 1,
  },
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  fullWidth = true,
  disabled = false,
  loading = false,
}: AppButtonProps) {
  const vs = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? vs.bgPressed : vs.bg,
          borderColor: vs.borderColor,
          borderWidth: vs.borderWidth,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'center',
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.fg} size="small" />
      ) : (
        <Text style={[styles.label, { color: vs.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  label: {
    ...Typography.headline,
  } as TextStyle,
});
