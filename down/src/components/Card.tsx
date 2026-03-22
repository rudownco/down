// Card and OverlayCard wrapper components
// Translated from ios/down/DesignSystem/Styles/AppCardModifier.swift

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';

interface CardProps {
  children: ReactNode;
  padding?: number;
  cornerRadius?: number;
  shadowRadius?: number;
  style?: ViewStyle;
}

export function Card({
  children,
  padding = Spacing.md,
  cornerRadius = Radius.xl,
  shadowRadius = 8,
  style,
}: CardProps) {
  return (
    <View
      style={[
        {
          padding,
          borderRadius: cornerRadius,
          backgroundColor: Colors.cardBackground,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.1,
              shadowRadius: shadowRadius,
            },
            android: {
              elevation: shadowRadius / 2,
            },
          }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface OverlayCardProps {
  children: ReactNode;
  padding?: number;
  cornerRadius?: number;
  style?: ViewStyle;
}

export function OverlayCard({
  children,
  padding = Spacing.md,
  cornerRadius = Radius.xl,
  style,
}: OverlayCardProps) {
  return (
    <View
      style={[
        {
          padding,
          borderRadius: cornerRadius,
          backgroundColor: 'rgba(255,255,255,0.16)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.22)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
