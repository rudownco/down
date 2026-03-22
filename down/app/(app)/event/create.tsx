// Create Event screen
// Translated from ios/down/Screens/CreateEventView.swift

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radius } from '../../../src/theme/spacing';
import { Typography } from '../../../src/theme/typography';
import { useAuthStore } from '../../../src/stores/authStore';
import { useEventStore } from '../../../src/stores/eventStore';
import * as api from '../../../src/services/api';
import { EventSuggestion, VotingOption } from '../../../src/types';
import dayjs from 'dayjs';

export default function CreateEventScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addEvent } = useEventStore();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [dateText, setDateText] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !user || !groupId) return;
    setIsSubmitting(true);

    // Parse date
    let formattedDate: string | undefined;
    let formattedTime: string | undefined;
    const parsed = dayjs(dateText, 'MM/DD/YYYY');
    if (parsed.isValid()) {
      formattedDate = parsed.format('dddd, MMM D');
    }

    const votingOption: VotingOption = {
      id: `vo-${Date.now()}`,
      date: formattedDate ?? dayjs().add(1, 'day').format('dddd, MMM D'),
      time: '7:00 PM',
      votes: 0,
      voters: [],
    };

    const event: EventSuggestion = {
      id: `e-${Date.now()}`,
      title: title.trim(),
      description: description || undefined,
      location: location || undefined,
      status: 'voting',
      attendees: [],
      suggestedBy: user,
      votingOptions: [votingOption],
      rsvps: [],
    };

    try {
      const created = await api.createEvent(event, groupId);
      addEvent(created);
      router.back();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.appBackgroundDeep, Colors.appBackground]}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={17} color={Colors.textOnBlue} />
        </Pressable>

        {/* Page header */}
        <Text style={styles.pageTitle}>Create a Plan</Text>

        {/* White card */}
        <View style={styles.card}>
          {/* Plan name (required) */}
          <FormSection label="What's the move?" tag="Required">
            <StyledInput
              placeholder="Game night, brunch, etc."
              value={title}
              onChangeText={setTitle}
            />
          </FormSection>

          {/* Location (optional) */}
          <FormSection label="Addy?" tag="Optional" icon="location-outline">
            <StyledInput
              placeholder="Where are we meeting?"
              value={location}
              onChangeText={setLocation}
            />
          </FormSection>

          {/* Date (optional) */}
          <FormSection label="When?" tag="Optional" icon="calendar-outline">
            <StyledInput
              placeholder="MM/DD/YYYY"
              value={dateText}
              onChangeText={setDateText}
              keyboardType="numbers-and-punctuation"
            />
          </FormSection>

          {/* Details (optional) */}
          <FormSection label="Details" tag="Optional">
            <TextInput
              placeholder="Add any extra info..."
              placeholderTextColor={Colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.multilineInput]}
              textAlignVertical="top"
            />
          </FormSection>

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            style={[
              styles.submitButton,
              { opacity: canSubmit ? 1 : 0.5 },
            ]}
          >
            {isSubmitting ? (
              <View style={styles.submitRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitText}>Creating…</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Who's Down?</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Helper components ──────────────────────────────────

function FormSection({
  label,
  tag,
  icon,
  children,
}: {
  label: string;
  tag?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.labelRow}>
        {icon && (
          <Ionicons name={icon} size={11} color={Colors.textSecondary} />
        )}
        <Text style={sectionStyles.label}>{label.toUpperCase()}</Text>
        {tag && <Text style={sectionStyles.tag}>({tag})</Text>}
      </View>
      {children}
    </View>
  );
}

function StyledInput({
  placeholder,
  value,
  onChangeText,
  keyboardType,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'numbers-and-punctuation';
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={Colors.textTertiary}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      style={styles.input}
    />
  );
}

// ─── Styles ─────────────────────────────────────────────

const sectionStyles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  tag: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textTertiary,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  backButton: {
    marginLeft: Spacing.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    ...Typography.title1,
    color: Colors.textOnBlue,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    gap: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
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
  multilineInput: {
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: 'rgb(97, 112, 140)',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  submitText: {
    ...Typography.headline,
    color: '#FFFFFF',
  },
});
