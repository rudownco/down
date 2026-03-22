// Overlapping avatar row with overflow badge
// Translated from ios/down/Components/AvatarStack.swift

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../types';
import { AvatarSize } from '../theme/spacing';
import { Colors } from '../theme/colors';
import { AvatarLogo } from './AvatarLogo';

interface AvatarStackProps {
  users: User[];
  maxVisible?: number;
  size?: number;
  borderColor?: string;
  showCount?: boolean;
}

export function AvatarStack({
  users,
  maxVisible = 3,
  size = AvatarSize.sm,
  borderColor = '#FFFFFF',
  showCount = true,
}: AvatarStackProps) {
  const visible = users.slice(0, maxVisible);
  const overflow = Math.max(0, users.length - maxVisible);
  const overlap = size * 0.35;

  const totalCount = overflow > 0 && showCount ? visible.length + 1 : visible.length;
  const totalWidth = totalCount > 0 ? size + (totalCount - 1) * (size - overlap) : 0;

  return (
    <View style={{ width: totalWidth, height: size, flexDirection: 'row' }}>
      {visible.map((user, index) => (
        <View
          key={user.id}
          style={{
            position: 'absolute',
            left: index * (size - overlap),
            zIndex: visible.length - index,
          }}
        >
          <AvatarLogo user={user} size={size} borderColor={borderColor} borderWidth={2} />
        </View>
      ))}
      {overflow > 0 && showCount && (
        <View
          style={{
            position: 'absolute',
            left: visible.length * (size - overlap),
            zIndex: 0,
          }}
        >
          <View
            style={[
              styles.overflowBadge,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: '#FFFFFF',
              },
            ]}
          >
            <Text style={[styles.overflowText, { fontSize: size * 0.32 }]}>
              +{overflow}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overflowBadge: {
    backgroundColor: 'rgb(217, 217, 217)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
