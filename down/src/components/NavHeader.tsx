// Custom navigation header
// Translated from ios/down/Components/NavHeader.swift

import React, { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface NavHeaderProps {
  title: string;
  onBack?: () => void;
  trailing?: ReactNode;
}

export function NavHeader({ title, onBack, trailing }: NavHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Centered title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.row}>
        {/* Left: back button */}
        {onBack ? (
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={17} color={Colors.textOnBlue} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Right: trailing action */}
        {trailing ?? <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

interface NavIconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function NavIconButton({ name, onPress }: NavIconButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.iconButton}>
      <Ionicons name={name} size={17} color={Colors.textOnBlue} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    ...Typography.headline,
    color: Colors.textOnBlue,
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
