import React, { useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import type { AvatarCircleProps } from './index';

const AVATAR_COLORS = [
  '#FE6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FEB64F', '#C681F6', '#4FC294', '#FE7FA3',
];

const SIZES = {
  xs: { container: 24, text: 10 },
  sm: { container: 32, text: 12 },
  md: { container: 40, text: 14 },
  lg: { container: 56, text: 20 },
  xl: { container: 72, text: 26 },
} as const;

function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function AvatarCircle({
  user,
  size = 'md',
  imageUri,
  tilt = 0,
  borderColor,
}: AvatarCircleProps) {
  const dims   = SIZES[size];
  const bgColor = AVATAR_COLORS[djb2Hash(user.id) % AVATAR_COLORS.length];

  return (
    <View
      style={{
        width: dims.container,
        height: dims.container,
        borderRadius: dims.container / 2,
        backgroundColor: imageUri ? 'transparent' : bgColor,
        transform: [{ rotate: `${tilt}deg` }],
        borderWidth: borderColor ? 3 : 0,
        borderColor: borderColor ?? 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: dims.container, height: dims.container, borderRadius: dims.container / 2 }}
        />
      ) : (
        <Text style={{ fontSize: dims.text, fontFamily: 'PlusJakartaSans_700Bold', color: '#FFFFFF' }}>
          {getInitials(user.name)}
        </Text>
      )}
    </View>
  );
}
