// RSVP screen
// Translated from ios/down/Screens/RSVPView.swift

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../src/theme/colors';
import { Spacing, Radius, IconSize, AvatarSize } from '../../../../src/theme/spacing';
import { Typography } from '../../../../src/theme/typography';
import { NavHeader } from '../../../../src/components/NavHeader';
import { Card } from '../../../../src/components/Card';
import { RSVPSelector } from '../../../../src/components/RSVPSelector';
import { EventStatusBadge } from '../../../../src/components/EventStatusBadge';
import { AppButton } from '../../../../src/components/Button';
import { useAuthStore } from '../../../../src/stores/authStore';
import { useEventStore } from '../../../../src/stores/eventStore';
import { useGroupStore } from '../../../../src/stores/groupStore';
import { getEventEmoji } from '../../../../src/utils/emoji';
import { getRsvpUsers } from '../../../../src/utils/event';
import { getAvatarColor } from '../../../../src/utils/user';
import { RSVPStatus, RSVPStatusMeta } from '../../../../src/types';
import * as api from '../../../../src/services/api';

export default function RSVPScreen() {
  const { id, groupId } = useLocalSearchParams<{ id: string; groupId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { events, updateEvent } = useEventStore();
  const { groups } = useGroupStore();

  const event = events.find((e) => e.id === id);
  const group = groups.find((g) => g.id === groupId);
  const groupMembers = group?.members ?? [];

  // Pre-select existing RSVP
  const existingStatus = event?.rsvps.find((r) => r.userId === user?.id)?.status ?? null;
  const [selectedStatus, setSelectedStatus] = useState<RSVPStatus | null>(existingStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event || !user) return null;

  const emoji = getEventEmoji(event.title);
  const canSubmit = selectedStatus !== null;

  const handleConfirm = async () => {
    if (!selectedStatus) return;
    setIsSubmitting(true);
    try {
      const rsvp = await api.submitRSVP(event.id, selectedStatus, user.id);

      // Update local event
      const updatedEvent = { ...event };
      const idx = updatedEvent.rsvps.findIndex((r) => r.userId === user.id);
      if (idx >= 0) {
        updatedEvent.rsvps = [...updatedEvent.rsvps];
        updatedEvent.rsvps[idx] = rsvp;
      } else {
        updatedEvent.rsvps = [...updatedEvent.rsvps, rsvp];
      }
      updateEvent(updatedEvent);

      const meta = RSVPStatusMeta[selectedStatus];
      Alert.alert("You're in! 🎉", `RSVP saved: ${meta.emoji} ${meta.label}`, [
        { text: 'Sweet!', onPress: () => router.back() },
      ]);
    } catch {
      setIsSubmitting(false);
    }
  };

  // Get users for each status
  const goingUsers = getRsvpUsers(event, 'going', groupMembers);
  const maybeUsers = getRsvpUsers(event, 'maybe', groupMembers);
  const notGoingUsers = getRsvpUsers(event, 'not_going', groupMembers);
  const hasAttendees = goingUsers.length + maybeUsers.length + notGoingUsers.length > 0;

  const getButtonLabel = () => {
    if (isSubmitting) return 'Saving…';
    if (!selectedStatus) return 'Select your RSVP above';
    const meta = RSVPStatusMeta[selectedStatus];
    if (meta.label === "Can't") return "😢  Can't make it";
    return `${meta.emoji}  I'm ${meta.label}!`;
  };

  return (
    <LinearGradient
      colors={[Colors.appBackgroundDeep, Colors.appBackground]}
      style={styles.container}
    >
      <NavHeader title="RSVP" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Event hero card */}
        <Card padding={Spacing.md} cornerRadius={Radius.xxl}>
          <View style={styles.heroHeader}>
            <View style={{ gap: Spacing.xs }}>
              <Text style={{ fontSize: 40 }}>{emoji}</Text>
              <Text style={styles.heroTitle}>{event.title}</Text>
            </View>
            <EventStatusBadge status={event.status} />
          </View>

          {event.description && (
            <Text style={styles.heroDesc} numberOfLines={3}>
              {event.description}
            </Text>
          )}

          <View style={styles.divider} />

          {/* Detail grid */}
          <View style={styles.detailGrid}>
            {event.date && (
              <DetailCell icon="calendar-outline" value={event.date} />
            )}
            {event.time && (
              <DetailCell icon="time-outline" value={event.time} />
            )}
            {event.location && (
              <DetailCell icon="location-outline" value={event.location} />
            )}
            <DetailCell
              icon="people-outline"
              value={`${event.attendees.length} attending`}
            />
          </View>
        </Card>

        {/* RSVP selector */}
        <View style={{ gap: Spacing.md }}>
          <Text style={styles.rsvpTitle}>Are you down? 👇</Text>
          <RSVPSelector
            selectedStatus={selectedStatus}
            onSelect={setSelectedStatus}
          />
        </View>

        {/* Attendees section */}
        {hasAttendees && (
          <View style={{ gap: Spacing.sm }}>
            <Text style={styles.whoLabel}>Who's who</Text>
            <Card padding={Spacing.sm} cornerRadius={Radius.xl}>
              {goingUsers.length > 0 && (
                <AttendeeRow status="going" users={goingUsers} />
              )}
              {maybeUsers.length > 0 && (
                <AttendeeRow status="maybe" users={maybeUsers} />
              )}
              {notGoingUsers.length > 0 && (
                <AttendeeRow status="not_going" users={notGoingUsers} />
              )}
            </Card>
          </View>
        )}

        {/* Confirm button */}
        <View style={{ paddingHorizontal: Spacing.md }}>
          <AppButton
            title={getButtonLabel()}
            onPress={handleConfirm}
            variant="primary"
            disabled={!canSubmit || isSubmitting}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Helper components ──────────────────────────────────

function DetailCell({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={detailStyles.cell}>
      <Ionicons name={icon} size={IconSize.sm} color={Colors.accentBlue} />
      <Text style={detailStyles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function AttendeeRow({
  status,
  users,
}: {
  status: RSVPStatus;
  users: { id: string; name: string }[];
}) {
  const meta = RSVPStatusMeta[status];
  return (
    <View style={attendeeStyles.row}>
      <Text style={attendeeStyles.emoji}>{meta.emoji}</Text>
      <Text style={attendeeStyles.label}>{meta.label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={attendeeStyles.chips}>
          {users.map((u) => (
            <View
              key={u.id}
              style={[
                attendeeStyles.chip,
                { backgroundColor: getAvatarColor(u.name) },
              ]}
            >
              <Text style={attendeeStyles.chipText}>
                {u.name.split(' ')[0]}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────

const detailStyles = StyleSheet.create({
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.cardBackgroundSecondary,
    borderRadius: Radius.md,
    width: '48%',
  },
  value: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    flex: 1,
  },
});

const attendeeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  emoji: { fontSize: 18, width: 28, textAlign: 'center' },
  label: {
    ...Typography.subhead,
    color: Colors.textSecondary,
    width: 56,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    ...Typography.caption,
    color: '#FFFFFF',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTitle: {
    ...Typography.title2,
    color: Colors.textPrimary,
  },
  heroDesc: {
    ...Typography.callout,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  rsvpTitle: {
    ...Typography.title3,
    color: Colors.textOnBlue,
  },
  whoLabel: {
    ...Typography.subhead,
    color: Colors.textOnBlueMuted,
  },
});
