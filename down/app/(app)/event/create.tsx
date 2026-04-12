// Create Event / New Hangout — matching Stitch mockup
// "The Social Sketchbook" aesthetic

import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Platform, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  FilledInput,
  SketchCard,
  BouncyButton,
} from "../../../components";
import { useAuth } from "../../../src/context/AuthContext";
import { useTheme } from "../../../src/context/ThemeContext";
import { useThemeColors } from "../../../src/hooks/useThemeColors";
import { useGroupStore } from "../../../src/stores/groupStore";
import { useEventStore } from "../../../src/stores/eventStore";
import * as api from "../../../src/services/api";
import { DRESS_CODES, DressCodeMeta, type DressCode } from "@down/common";
import dayjs from "dayjs";

// ── Category pills (mockup layout: 2-col wrap, large rounded) ──

const CATEGORIES = [
  { label: "Food", emoji: "🍔", bg: "#FFEBB7", text: "#76574E" },
  { label: "Drinks", emoji: "🍹", bg: "#E2F0D9", text: "#3E6842" },
  { label: "Movie", emoji: "🍿", bg: "#F3E5F5", text: "#6A1B9A" },
  { label: "Touching Grass", emoji: "🌳", bg: "#E0F7FA", text: "#006064" },
  { label: "Games", emoji: "🎮", bg: "#FFF9C4", text: "#F9A825" },
];

// ── Dress code pill colors (presentation only — labels come from @down/common) ──

const DRESS_CODE_COLORS: Record<DressCode, { bg: string; text: string }> = {
  "Chill / Casual": { bg: "#E0F7FA", text: "#006064" },
  "Fancy / Dressy": { bg: "#F3E5F5", text: "#6A1B9A" },
  Themed:           { bg: "#FFF9C4", text: "#F9A825" },
  Active:           { bg: "#E2F0D9", text: "#3E6842" },
};

function SelectablePill({
  label,
  emoji,
  bg,
  textColor,
  selected,
  onPress,
  borderColor = "#3F6377",
}: {
  label: string;
  emoji: string;
  bg: string;
  textColor: string;
  selected: boolean;
  onPress: () => void;
  borderColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: bg,
        borderWidth: selected ? 2 : 0,
        borderColor,
        borderRadius: 9999,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: "PlusJakartaSans_600SemiBold",
          fontSize: 16,
          color: textColor,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function CreateEventScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const tc = useThemeColors();
  const { groups } = useGroupStore();
  const { addEvent } = useEventStore();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groupId ?? null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dressCodeNote, setDressCodeNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDressCode, setSelectedDressCode] = useState<DressCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date/time picker state
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Validation
  const [titleError, setTitleError] = useState<string | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;
  const canSubmit = title.trim().length > 0 && selectedGroupId != null && !isSubmitting;

  const validateTitle = (): boolean => {
    if (title.trim().length === 0) {
      setTitleError("give your hangout a name!");
      return false;
    }
    if (title.trim().length < 2) {
      setTitleError("at least 2 characters, c'mon");
      return false;
    }
    setTitleError(null);
    return true;
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) setTime(selectedTime);
  };

  const handleSubmit = async () => {
    if (!validateTitle()) return;
    if (!selectedGroupId) {
      setGroupError("pick a squad first!");
      return;
    }
    setIsSubmitting(true);

    const formattedDate = date ? dayjs(date).format("dddd, MMM D") : undefined;
    const formattedTime = time ? dayjs(time).format("h:mm A") : undefined;

    try {
      const created = await api.createEvent({
        title: title.trim(),
        description: description || undefined,
        location: location || undefined,
        category: selectedCategory || undefined,
        dress_code: selectedDressCode ?? undefined,
        dress_code_note: dressCodeNote.trim() || undefined,
        group_id: selectedGroupId,
        time_options:
          formattedDate || formattedTime
            ? [{ date: formattedDate ?? "", time: formattedTime ?? "TBD" }]
            : undefined,
      });
      addEvent(created);
      router.back();
    } catch (e: unknown) {
      Alert.alert(
        "Couldn't create event",
        e instanceof Error ? e.message : "Something went wrong"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-2 flex-row justify-between items-center">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={tc.primary} />
        </Pressable>
        <Text className="font-heading-extrabold text-xl text-primary italic tracking-tighter -rotate-1">
          new hangout!
        </Text>
        <View className="w-10 h-10 rounded-full bg-surface-container-highest" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, gap: 32 }}
        className="px-6 pt-6"
      >
        {/* Section: Which squad */}
        <View className="gap-4">
          <Text className="font-heading text-2xl text-primary tracking-tight">
            which squad?
          </Text>
          {groups.length === 0 ? (
            <View className="items-center py-6 gap-2">
              <Text className="text-3xl">👥</Text>
              <Text className="font-body text-sm text-on-surface-variant text-center">
                no squads yet — create one first!
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {groups.map((g) => (
                <Pressable
                  key={g.id}
                  onPress={() => {
                    setSelectedGroupId(g.id);
                    if (groupError) setGroupError(null);
                  }}
                  style={{
                    backgroundColor: selectedGroupId === g.id
                      ? tc.primaryContainer
                      : tc.surfaceContainerLowest,
                    borderWidth: selectedGroupId === g.id ? 2 : 0,
                    borderColor: tc.primary,
                    borderRadius: 9999,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>👥</Text>
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans_600SemiBold",
                      fontSize: 15,
                      color: tc.primary,
                    }}
                  >
                    {g.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {groupError && (
            <Text className="font-body text-xs text-error px-1 -mt-2">
              {groupError}
            </Text>
          )}
        </View>

        {/* Section: What */}
        <View className="gap-4">
          <Text className="font-heading text-2xl text-primary tracking-tight">
            what are we doing?
          </Text>

          {/* Category pills — 2-col wrap */}
          <View className="flex-row flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <SelectablePill
                key={cat.label}
                label={cat.label}
                emoji={cat.emoji}
                bg={cat.bg}
                textColor={cat.text}
                selected={selectedCategory === cat.label}
                borderColor={tc.primary}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === cat.label ? null : cat.label
                  )
                }
              />
            ))}
          </View>

          {/* Title input */}
          <View className="relative">
            <FilledInput
              placeholder="name your vibe..."
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (titleError) setTitleError(null);
              }}
              style={{ fontFamily: "BeVietnamPro_500Medium", fontSize: 16 }}
            />
            <View
              className="absolute -right-1 -top-2 bg-secondary-container px-2 py-1 rounded-chip"
              style={{ transform: [{ rotate: "1.2deg" }] }}
            >
              <Text className="font-heading text-[10px] text-on-secondary-container uppercase">
                required!
              </Text>
            </View>
          </View>
          {titleError && (
            <Text className="font-body text-xs text-error px-1 -mt-2">
              {titleError}
            </Text>
          )}
        </View>

        {/* Section: Where & When */}
        <View className="gap-6">
          <View className="gap-3">
            <Text className="font-heading text-xl text-primary px-1">
              where at?
            </Text>
            <FilledInput
              placeholder="pick a spot"
              value={location}
              onChangeText={setLocation}
              icon="location-outline"
            />
          </View>

          <View className="gap-3">
            <Text className="font-heading text-xl text-primary px-1">
              when?
            </Text>

            {/* Date picker trigger */}
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center bg-surface-container-highest rounded-input overflow-hidden"
            >
              <View className="pl-4">
                <Ionicons name="calendar-outline" size={18} color={tc.onSurfaceVariant} />
              </View>
              <Text
                className="flex-1 font-body text-base px-4 py-4"
                style={{ color: date ? tc.onSurface : tc.outline }}
              >
                {date ? dayjs(date).format("MMM D, YYYY") : "pick a date"}
              </Text>
            </Pressable>

            {showDatePicker && (
              <View>
                <DateTimePicker
                  value={date ?? new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                  themeVariant={isDark ? "dark" : "light"}
                />
                {Platform.OS === "ios" && (
                  <Pressable
                    onPress={() => setShowDatePicker(false)}
                    className="self-end py-2 px-4"
                  >
                    <Text className="font-heading text-sm text-primary">Done</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Time picker trigger */}
            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="flex-row items-center bg-surface-container-highest rounded-input overflow-hidden"
            >
              <View className="pl-4">
                <Ionicons name="time-outline" size={18} color={tc.onSurfaceVariant} />
              </View>
              <Text
                className="flex-1 font-body text-base px-4 py-4"
                style={{ color: time ? tc.onSurface : tc.outline }}
              >
                {time ? dayjs(time).format("h:mm A") : "pick a time"}
              </Text>
            </Pressable>

            {showTimePicker && (
              <View>
                <DateTimePicker
                  value={time ?? new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                  themeVariant={isDark ? "dark" : "light"}
                />
                {Platform.OS === "ios" && (
                  <Pressable
                    onPress={() => setShowTimePicker(false)}
                    className="self-end py-2 px-4"
                  >
                    <Text className="font-heading text-sm text-primary">Done</Text>
                  </Pressable>
                )}
              </View>
            )}

            <Text className="font-label text-[10px] text-tertiary uppercase tracking-widest px-1">
              heads up: no flaking allowed!
            </Text>
          </View>
        </View>

        {/* Section: Dress code */}
        <View className="gap-4">
          <Text className="font-heading text-2xl text-primary tracking-tight">
            what's the fit?
          </Text>

          {/* Dress code pills — wrap into rows naturally */}
          <View className="flex-row flex-wrap gap-3">
            {DRESS_CODES.map((dc) => {
              const meta = DressCodeMeta[dc];
              const colors = DRESS_CODE_COLORS[dc];
              return (
                <SelectablePill
                  key={dc}
                  label={meta.label}
                  emoji={meta.emoji}
                  bg={colors.bg}
                  textColor={colors.text}
                  selected={selectedDressCode === dc}
                  borderColor={tc.primary}
                  onPress={() =>
                    setSelectedDressCode(selectedDressCode === dc ? null : dc)
                  }
                />
              );
            })}
          </View>

          {/* Dress code note input */}
          <FilledInput
            placeholder="e.g. wear your worst holiday sweater."
            value={dressCodeNote}
            onChangeText={setDressCodeNote}
            style={{ fontStyle: "italic" }}
          />
        </View>

        {/* Section: Details */}
        <View className="gap-3">
          <Text className="font-heading text-xl text-primary px-1">
            any deets?
          </Text>
          <SketchCard tilt={1.2} variant="default" className="gap-3">
            <FilledInput
              placeholder="mention the dress code, the menu, or just hyped thoughts..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={240}
              style={{
                textAlignVertical: "top",
                minHeight: 80,
                fontStyle: "italic",
              }}
            />
            <View className="flex-row justify-between items-center pt-2 border-t border-outline-variant/10">
              <Pressable className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-full bg-primary-container items-center justify-center">
                  <Ionicons name="add" size={14} color={tc.primary} />
                </View>
                <Text className="font-body-medium text-xs text-on-surface-variant">
                  add images or links
                </Text>
              </Pressable>
              <Text className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
                {description.length} / 240
              </Text>
            </View>
          </SketchCard>
        </View>

        {/* CTA area */}
        <View className="items-center gap-4 pt-4">
          <View className="items-center">
            <Text className="font-heading text-xl text-primary">
              let's make it happen!
            </Text>
            <Text className="font-body text-sm text-on-surface-variant">
              {selectedGroup
                ? `posting to ${selectedGroup.name}`
                : "pick a squad above to post"}
            </Text>
          </View>
          <BouncyButton
            title="Post to Squad"
            icon="send-outline"
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </View>
  );
}
