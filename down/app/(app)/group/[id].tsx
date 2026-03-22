// Group Detail screen
// Translated from ios/down/Screens/GroupDetailView.swift

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radius, AvatarSize } from '../../../src/theme/spacing';
import { Typography } from '../../../src/theme/typography';
import { NavHeader, NavIconButton } from '../../../src/components/NavHeader';
import { AvatarLogo } from '../../../src/components/AvatarLogo';
import { EventCard } from '../../../src/components/EventCard';
import { OverlayCard } from '../../../src/components/Card';
import { useAuthStore } from '../../../src/stores/authStore';
import { useEventStore } from '../../../src/stores/eventStore';
import { useGroupStore } from '../../../src/stores/groupStore';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { groups } = useGroupStore();
  const { events, isLoading, loadEvents } = useEventStore();

  const group = groups.find((g) => g.id === id);

  useEffect(() => {
    if (id) loadEvents(id);
  }, [id]);

  if (!group) return null;

  return (
    <LinearGradient
      colors={[Colors.appBackgroundDeep, Colors.appBackground]}
      style={styles.container}
    >
      <NavHeader
        title={group.name}
        onBack={() => router.back()}
        trailing={<NavIconButton name="settings-outline" onPress={() => {}} />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Members section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Members</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.membersRow}>
              {group.members.map((member) => (
                <View key={member.id} style={styles.memberChip}>
                  <AvatarLogo
                    user={member}
                    size={AvatarSize.md}
                    borderColor="#FFFFFF"
                    borderWidth={2}
                  />
                  <Text style={styles.memberName} numberOfLines={1}>
                    {member.name.split(' ')[0]}
                  </Text>
                </View>
              ))}
              {/* Invite button */}
              <View style={styles.memberChip}>
                <View style={styles.inviteCircle}>
                  <Ionicons name="add" size={18} color={Colors.textOnBlue} />
                </View>
                <Text style={styles.memberName}>Invite</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Events section */}
        <View style={styles.section}>
          <View style={styles.eventsHeader}>
            <Text style={styles.sectionLabel}>Events</Text>
            <Pressable
              style={styles.suggestButton}
              onPress={() =>
                router.push({
                  pathname: '/(app)/event/create',
                  params: { groupId: id },
                })
              }
            >
              <Ionicons name="add" size={14} color={Colors.textOnBlue} />
              <Text style={styles.suggestText}>Suggest</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={{ gap: Spacing.sm }}>
              {[0, 1].map((i) => (
                <View key={i} style={styles.eventSkeleton} />
              ))}
            </View>
          ) : events.length === 0 ? (
            <OverlayCard cornerRadius={Radius.xxl}>
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 48 }}>🗓️</Text>
                <Text style={styles.emptyTitle}>No events yet</Text>
                <Text style={styles.emptySubtitle}>
                  Suggest something fun for the crew!
                </Text>
              </View>
            </OverlayCard>
          ) : (
            <View style={{ gap: Spacing.sm }}>
              {events.map((event) => (
                <Pressable
                  key={event.id}
                  onPress={() => {
                    const screen =
                      event.status === 'confirmed' ? 'rsvp' : 'vote';
                    router.push({
                      pathname: `/(app)/event/[id]/${screen}`,
                      params: { id: event.id, groupId: id },
                    });
                  }}
                >
                  <EventCard event={event} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.subhead,
    color: Colors.textOnBlueMuted,
    paddingHorizontal: 2,
  },
  membersRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: 2,
  },
  memberChip: {
    width: 52,
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  memberName: {
    ...Typography.caption2,
    color: Colors.textOnBlueMuted,
  },
  inviteCircle: {
    width: AvatarSize.md,
    height: AvatarSize.md,
    borderRadius: AvatarSize.md / 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs + 2,
    borderRadius: 999,
  },
  suggestText: {
    ...Typography.subhead,
    color: Colors.textOnBlue,
  },
  eventSkeleton: {
    height: 140,
    borderRadius: Radius.xxl,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.headline,
    color: Colors.textOnBlue,
  },
  emptySubtitle: {
    ...Typography.callout,
    color: Colors.textOnBlueMuted,
  },
});
