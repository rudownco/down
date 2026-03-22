// RSVP selector (DOWN / Maybe / Can't)
// Translated from ios/down/Components/RSVPSelector.swift

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RSVPStatus, RSVPStatusMeta } from '../types';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface Props {
  selectedStatus: RSVPStatus | null;
  onSelect: (status: RSVPStatus | null) => void;
}

const allStatuses: RSVPStatus[] = ['going', 'maybe', 'not_going'];

export function RSVPSelector({ selectedStatus, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {allStatuses.map((status) => {
        const isSelected = selectedStatus === status;
        const meta = RSVPStatusMeta[status];

        return (
          <Pressable
            key={status}
            onPress={() => onSelect(isSelected ? null : status)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? Colors.accentBlueMuted : Colors.cardBackground,
                borderColor: isSelected ? Colors.accentBlue : Colors.divider,
                borderWidth: isSelected ? 2 : 1,
                transform: [{ scale: isSelected ? 1.03 : 1 }],
              },
            ]}
          >
            <Text style={styles.emoji}>{meta.emoji}</Text>
            <Text
              style={[
                styles.label,
                { color: isSelected ? Colors.accentBlue : Colors.textPrimary },
              ]}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    gap: Spacing.xs,
  },
  emoji: {
    fontSize: 32,
  },
  label: {
    ...Typography.subhead,
  },
});
