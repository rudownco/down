// Event status badge (voting/confirmed/pending)
// Translated from EventStatusBadge in ios/down/Components/EventCard.swift

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EventStatus, EventStatusMeta } from '../types';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface Props {
  status: EventStatus;
}

const statusColors: Record<EventStatus, { bg: string; fg: string }> = {
  voting: { bg: Colors.statusVotingBg, fg: Colors.statusVotingFg },
  confirmed: { bg: Colors.statusConfirmedBg, fg: Colors.statusConfirmedFg },
  pending: { bg: Colors.statusPendingBg, fg: Colors.statusPendingFg },
};

export function EventStatusBadge({ status }: Props) {
  const meta = EventStatusMeta[status];
  const colors = statusColors[status];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={styles.emoji}>{meta.emoji}</Text>
      <Text style={[styles.label, { color: colors.fg }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 999,
  },
  emoji: {
    fontSize: 11,
  },
  label: {
    ...Typography.caption2,
  },
});
