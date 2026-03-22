// Event suggestion card
// Translated from ios/down/Components/EventCard.swift

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventSuggestion } from '../types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, AvatarSize, IconSize } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { getEventEmoji } from '../utils/emoji';
import { getTotalVoters } from '../utils/event';
import { Card } from './Card';
import { EventStatusBadge } from './EventStatusBadge';
import { AvatarStack } from './AvatarStack';

interface Props {
  event: EventSuggestion;
}

export function EventCard({ event }: Props) {
  const emoji = getEventEmoji(event.title);
  const totalVoters = getTotalVoters(event);

  return (
    <Card padding={Spacing.md} cornerRadius={Radius.xxl}>
      {/* Header row: emoji + title + status */}
      <View style={styles.headerRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.subtitle}>by {event.suggestedBy.name}</Text>
        </View>
        <EventStatusBadge status={event.status} />
      </View>

      {/* Description */}
      {event.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
      ) : null}

      {/* Meta info row */}
      {(event.location || event.date || event.time) && (
        <View style={styles.metaRow}>
          {event.location ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          ) : null}
          {event.date ? (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {event.date}
              </Text>
            </View>
          ) : null}
          {event.time ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{event.time}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom: voting progress OR attendees */}
      {event.status === 'voting' && event.votingOptions.length > 0 ? (
        <View style={styles.bottomRow}>
          <Ionicons name="hand-left" size={IconSize.sm} color={Colors.statusVotingFg} />
          <Text style={styles.voteCount}>
            {totalVoters} vote{totalVoters === 1 ? '' : 's'} cast
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.tapToVote}>Tap to vote</Text>
        </View>
      ) : (
        <View style={styles.bottomRow}>
          <AvatarStack
            users={event.attendees}
            maxVisible={4}
            size={AvatarSize.xs}
            borderColor="#FFFFFF"
          />
          {event.attendees.length > 0 && (
            <Text style={styles.voteCount}>{event.attendees.length} going</Text>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  titleCol: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...Typography.title3,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  description: {
    ...Typography.callout,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  voteCount: {
    ...Typography.subhead,
    color: Colors.textSecondary,
  },
  tapToVote: {
    ...Typography.caption,
    color: Colors.accentBlue,
  },
});
