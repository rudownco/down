import React from 'react';
import { View, Text } from 'react-native';
import { AvatarCircle } from '../AvatarCircle';
import type { AvatarStackProps } from './types';

const SIZE_MAP = { xs: 24, sm: 32, md: 40, lg: 56 };

export function AvatarStack({
  users,
  maxVisible = 3,
  size = 'md',
  borderColor = '#FFFFFF',
  showCount = true,
}: AvatarStackProps) {
  const visible   = users.slice(0, maxVisible);
  const remaining = users.length - maxVisible;
  const dim       = SIZE_MAP[size];
  const overlap   = dim * 0.3;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {visible.map((user, i) => (
        <View key={user.id} style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: maxVisible - i }}>
          <AvatarCircle user={user} size={size} borderColor={borderColor} tilt={0} />
        </View>
      ))}
      {showCount && remaining > 0 && (
        <View
          style={{
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: '#C4E7FF',
            marginLeft: -overlap,
            borderWidth: 3,
            borderColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: dim * 0.28, fontFamily: 'PlusJakartaSans_700Bold', color: '#3F6377' }}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}
