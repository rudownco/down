// Group Dashboard — main authenticated screen
// Translated from ios/down/Screens/GroupDashboardView.swift

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Spacing, Radius } from '../../src/theme/spacing';
import { Typography } from '../../src/theme/typography';
import { NavHeader, NavIconButton } from '../../src/components/NavHeader';
import { GroupListItem } from '../../src/components/GroupListItem';
import { OverlayCard } from '../../src/components/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { useGroupStore } from '../../src/stores/groupStore';
import { getGreeting } from '../../src/utils/greeting';

export default function GroupDashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { groups, isLoading, loadGroups } = useGroupStore();

  useEffect(() => {
    if (user) loadGroups(user.id);
  }, [user]);

  const firstName = user?.name.split(' ')[0] ?? '';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <LinearGradient
      colors={[Colors.appBackgroundDeep, Colors.appBackground]}
      style={styles.container}
    >
      {/* Header */}
      <NavHeader
        title="My Crews"
        trailing={
          <NavIconButton name="person-circle-outline" onPress={handleSignOut} />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingSubtext}>{getGreeting()} 👋</Text>
          <Text style={styles.greetingName}>{firstName}</Text>
        </View>

        {/* Group list */}
        {isLoading ? (
          <View style={styles.skeletons}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeleton} />
            ))}
          </View>
        ) : groups.length === 0 ? (
          <OverlayCard cornerRadius={Radius.xxl}>
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>🏝️</Text>
              <Text style={styles.emptyTitle}>No crews yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap + to create your first crew!
              </Text>
            </View>
          </OverlayCard>
        ) : (
          <View style={{ gap: Spacing.sm }}>
            {groups.map((group) => (
              <Pressable
                key={group.id}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/group/[id]',
                    params: { id: group.id },
                  })
                }
              >
                <GroupListItem group={group} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(app)/group-create')}
      >
        <Ionicons name="add" size={22} color={Colors.appBackground} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
    gap: Spacing.lg,
  },
  greeting: {
    gap: 4,
  },
  greetingSubtext: {
    ...Typography.subhead,
    color: Colors.textOnBlueMuted,
  },
  greetingName: {
    ...Typography.title1,
    color: Colors.textOnBlue,
  },
  skeletons: {
    gap: Spacing.sm,
  },
  skeleton: {
    height: 80,
    borderRadius: Radius.xxl,
    backgroundColor: 'rgba(255,255,255,0.14)',
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
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});
