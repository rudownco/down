// Voting screen
// Translated from ios/down/Screens/VotingView.swift

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../src/theme/colors';
import { Spacing, Radius } from '../../../../src/theme/spacing';
import { Typography } from '../../../../src/theme/typography';
import { NavHeader } from '../../../../src/components/NavHeader';
import { OverlayCard } from '../../../../src/components/Card';
import { VoteListItem } from '../../../../src/components/VoteList';
import { AppButton } from '../../../../src/components/Button';
import { useAuthStore } from '../../../../src/stores/authStore';
import { useEventStore } from '../../../../src/stores/eventStore';
import { getEventEmoji } from '../../../../src/utils/emoji';
import { getTotalVoters } from '../../../../src/utils/event';
import * as api from '../../../../src/services/api';

export default function VotingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { events, updateEvent } = useEventStore();

  const event = events.find((e) => e.id === id);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event || !user) return null;

  const emoji = getEventEmoji(event.title);
  const totalVoters = Math.max(1, getTotalVoters(event));
  const leadingId = event.votingOptions.reduce(
    (max, opt) => (opt.votes > (event.votingOptions.find((o) => o.id === max)?.votes ?? 0) ? opt.id : max),
    event.votingOptions[0]?.id ?? ''
  );

  const toggle = (optionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  };

  const canSubmit = selectedIds.size > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const updated = await api.submitVotes(
        event.id,
        Array.from(selectedIds),
        user.id
      );
      updateEvent(updated);
      Alert.alert(
        'Votes submitted! 🎉',
        `You voted for ${selectedIds.size} time${selectedIds.size === 1 ? '' : 's'}.`,
        [{ text: 'Back to group', onPress: () => router.back() }]
      );
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.appBackgroundDeep, Colors.appBackground]}
      style={styles.container}
    >
      <NavHeader title="Vote" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Event info card */}
        <OverlayCard>
          <View style={styles.eventInfo}>
            <Text style={{ fontSize: 36 }}>{emoji}</Text>
            <View style={styles.eventInfoText}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {event.description && (
                <Text style={styles.eventDesc} numberOfLines={2}>
                  {event.description}
                </Text>
              )}
              <View style={styles.metaRow}>
                {event.location && (
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={13} color={Colors.textOnBlueFaint} />
                    <Text style={styles.metaText}>{event.location}</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={13} color={Colors.textOnBlueFaint} />
                  <Text style={styles.metaText}>{getTotalVoters(event)} voters</Text>
                </View>
              </View>
            </View>
          </View>
        </OverlayCard>

        {/* Voting options */}
        <View style={styles.votingSection}>
          <Text style={styles.sectionTitle}>📅 Pick your times</Text>
          <Text style={styles.sectionSubtitle}>Select all times that work for you</Text>

          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            {event.votingOptions.map((option) => (
              <VoteListItem
                key={option.id}
                option={option}
                totalVoters={totalVoters}
                isSelected={selectedIds.has(option.id)}
                isLeading={option.id === leadingId && !selectedIds.has(option.id)}
                onTap={() => toggle(option.id)}
              />
            ))}
          </View>
        </View>

        {/* Submit button */}
        <View style={{ paddingHorizontal: Spacing.md }}>
          <AppButton
            title={
              isSubmitting
                ? 'Submitting…'
                : selectedIds.size === 0
                ? 'Select at least one time'
                : `🗳️  Submit ${selectedIds.size} Vote${selectedIds.size === 1 ? '' : 's'}`
            }
            onPress={handleSubmit}
            variant="primary"
            disabled={!canSubmit || isSubmitting}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  eventInfoText: {
    flex: 1,
    gap: Spacing.xs,
  },
  eventTitle: {
    ...Typography.title3,
    color: Colors.textOnBlue,
  },
  eventDesc: {
    ...Typography.callout,
    color: Colors.textOnBlueMuted,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textOnBlueFaint,
  },
  votingSection: {
    gap: 4,
  },
  sectionTitle: {
    ...Typography.headline,
    color: Colors.textOnBlue,
  },
  sectionSubtitle: {
    ...Typography.footnote,
    color: Colors.textOnBlueMuted,
  },
});
