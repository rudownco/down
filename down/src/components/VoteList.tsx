// Individual voting option row with progress bar
// Translated from ios/down/Components/VoteList.swift

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { VotingOption } from '../types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, AvatarSize } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { AvatarStack } from './AvatarStack';

interface Props {
  option: VotingOption;
  totalVoters: number;
  isSelected: boolean;
  isLeading: boolean;
  onTap: () => void;
}

export function VoteListItem({
  option,
  totalVoters,
  isSelected,
  isLeading,
  onTap,
}: Props) {
  const percentage = totalVoters > 0 ? option.votes / totalVoters : 0;
  const rowEmoji = isSelected ? '✅' : isLeading ? '🔥' : '📅';

  return (
    <Pressable onPress={onTap}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isSelected ? Colors.accentBlueMuted : Colors.cardBackground,
            borderColor: isSelected ? Colors.accentBlue : Colors.divider,
            borderWidth: isSelected ? 2 : 1,
            transform: [{ scale: isSelected ? 1.02 : 1 }],
          },
        ]}
      >
        {/* Top row: emoji + date/time + voters */}
        <View style={styles.topRow}>
          <Text style={styles.rowEmoji}>{rowEmoji}</Text>
          <View style={styles.dateCol}>
            <Text
              style={[
                styles.date,
                { color: isSelected ? Colors.accentBlue : Colors.textPrimary },
              ]}
            >
              {option.date}
            </Text>
            <Text
              style={[
                styles.time,
                {
                  color: isSelected
                    ? Colors.accentBlue + 'B3' // 70% opacity
                    : Colors.textSecondary,
                },
              ]}
            >
              {option.time}
            </Text>
          </View>
          <View style={styles.voterSection}>
            <AvatarStack
              users={option.voters}
              maxVisible={3}
              size={AvatarSize.xs}
              borderColor="#FFFFFF"
            />
            <Text
              style={[
                styles.voteCount,
                { color: isSelected ? Colors.accentBlue : Colors.textSecondary },
              ]}
            >
              {option.votes}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(percentage * 100)}%`,
                backgroundColor: isSelected
                  ? Colors.accentBlue
                  : Colors.statusPendingFg + '80',
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rowEmoji: {
    fontSize: 20,
  },
  dateCol: {
    flex: 1,
    gap: 2,
  },
  date: {
    ...Typography.subhead,
  },
  time: {
    ...Typography.footnote,
  },
  voterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  voteCount: {
    ...Typography.subhead,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.inputBackground,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
  },
});
