// Create Group screen (presented as modal)
// Translated from ios/down/Screens/CreateGroupView.swift

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Spacing, Radius } from '../../src/theme/spacing';
import { Typography } from '../../src/theme/typography';
import { NavHeader } from '../../src/components/NavHeader';
import { AppButton } from '../../src/components/Button';
import * as api from '../../src/services/api';
import { useGroupStore } from '../../src/stores/groupStore';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { addGroup } = useGroupStore();
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const canCreate = groupName.trim().length > 0;

  const handleCreate = async () => {
    if (!canCreate) return;
    setIsCreating(true);
    try {
      const newGroup = await api.createGroup(groupName.trim());
      addGroup(newGroup);
      router.back();
    } catch (e: any) {
      Alert.alert('Something went wrong', e.message);
      setIsCreating(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.appBackgroundDeep, Colors.appBackground]}
      style={styles.container}
    >
      <NavHeader title="New Crew" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={{ fontSize: 56 }}>👥</Text>
          <Text style={styles.heroTitle}>Start a new crew</Text>
          <Text style={styles.heroSubtitle}>
            Give your group a name and start planning together.
          </Text>
        </View>

        {/* Name input card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={15} color={Colors.accentBlue} />
            </View>
            <Text style={styles.cardHeaderText}>What's the crew called?</Text>
          </View>
          <TextInput
            placeholder="Friday Squad, Work Buds, Weekend Warriors…"
            placeholderTextColor={Colors.textTertiary}
            value={groupName}
            onChangeText={setGroupName}
            style={styles.input}
          />
        </View>

        {/* Create button */}
        <AppButton
          title={isCreating ? 'Creating…' : '🚀  Create Crew'}
          onPress={handleCreate}
          variant="primary"
          disabled={!canCreate || isCreating}
          loading={isCreating}
        />
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  heroTitle: {
    ...Typography.title2,
    color: Colors.textOnBlue,
  },
  heroSubtitle: {
    ...Typography.callout,
    color: Colors.textOnBlueMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentBlueMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    ...Typography.headline,
    color: Colors.textPrimary,
  },
  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
});
