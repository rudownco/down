// Single avatar circle with initials
// Translated from ios/down/Components/AvatarLogo.swift

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../types';
import { AvatarSize } from '../theme/spacing';
import { getInitials, getAvatarColor } from '../utils/user';

interface AvatarLogoProps {
  user: User;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
}

export function AvatarLogo({
  user,
  size = AvatarSize.sm,
  borderColor = 'transparent',
  borderWidth = 0,
}: AvatarLogoProps) {
  const color = getAvatarColor(user.name);
  const initials = getInitials(user.name);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderColor,
          borderWidth,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          { fontSize: size * 0.36 },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
