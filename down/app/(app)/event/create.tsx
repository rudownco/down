// Create Event / New Hangout — matching Stitch export2
// "The Social Sketchbook" aesthetic

import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CategoryPill, FilledInput, JellybeanChip, SketchCard, BouncyButton, SectionLabel } from "../../../components";
import { useAuth } from "../../../src/context/AuthContext";
import { useEventStore } from "../../../src/stores/eventStore";
import * as api from "../../../src/services/api";
import { EventSuggestion, VotingOption } from "../../../src/types";
import dayjs from "dayjs";

const CATEGORIES = [
  { label: "Food", emoji: "🍔", bg: "#FFEBB7", text: "#76574E" },
  { label: "Drinks", emoji: "🍹", bg: "#E2F0D9", text: "#3E6842" },
  { label: "Movie", emoji: "🍿", bg: "#F3E5F5", text: "#6A1B9A" },
  { label: "Outdoors", emoji: "🌳", bg: "#E0F7FA", text: "#006064" },
  { label: "Games", emoji: "🎮", bg: "#FFF9C4", text: "#F9A825" },
];

const DRESS_CODES = [
  { label: "Chill / Casual", emoji: "👕" },
  { label: "Fancy / Dressy", emoji: "✨" },
  { label: "Themed", emoji: "🎭" },
  { label: "Active", emoji: "👟" },
];

export default function CreateEventScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addEvent } = useEventStore();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [dateText, setDateText] = useState("");
  const [timeText, setTimeText] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDressCode, setSelectedDressCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !user || !groupId) return;
    setIsSubmitting(true);

    let formattedDate: string | undefined;
    const parsed = dayjs(dateText, "MM/DD/YYYY");
    if (parsed.isValid()) {
      formattedDate = parsed.format("dddd, MMM D");
    }

    const votingOption: VotingOption = {
      id: `vo-${Date.now()}`,
      date: formattedDate ?? dayjs().add(1, "day").format("dddd, MMM D"),
      time: timeText || "7:00 PM",
      votes: 0,
      voters: [],
    };

    const event: EventSuggestion = {
      id: `e-${Date.now()}`,
      title: title.trim(),
      description: description || undefined,
      location: location || undefined,
      status: "voting",
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
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-2 flex-row justify-between items-center">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#3F6377" />
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
        {/* Section: What */}
        <View className="gap-4">
          <Text className="font-heading text-2xl text-primary tracking-tight">
            what are we doing?
          </Text>

          {/* Category pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat.label}
                label={cat.label}
                emoji={cat.emoji}
                bgColor={cat.bg}
                textColor={cat.text}
                selected={selectedCategory === cat.label}
                onPress={() => setSelectedCategory(
                  selectedCategory === cat.label ? null : cat.label
                )}
              />
            ))}
          </ScrollView>

          {/* Title input */}
          <View className="relative">
            <FilledInput
              placeholder="name your vibe..."
              value={title}
              onChangeText={setTitle}
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
            <FilledInput
              placeholder="MM/DD/YYYY"
              value={dateText}
              onChangeText={setDateText}
              icon="calendar-outline"
              keyboardType="numbers-and-punctuation"
            />
            <FilledInput
              placeholder="7:00 PM"
              value={timeText}
              onChangeText={setTimeText}
              icon="time-outline"
            />
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
          <View className="flex-row flex-wrap gap-3">
            {DRESS_CODES.map((dc) => (
              <JellybeanChip
                key={dc.label}
                label={dc.label}
                emoji={dc.emoji}
                variant="primary"
                selected={selectedDressCode === dc.label}
                onPress={() => setSelectedDressCode(
                  selectedDressCode === dc.label ? null : dc.label
                )}
              />
            ))}
          </View>
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
              style={{ textAlignVertical: "top", minHeight: 80, fontStyle: "italic" }}
            />
            <View className="flex-row justify-between items-center pt-2 border-t border-outline-variant/10">
              <Pressable className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-full bg-primary-container items-center justify-center">
                  <Ionicons name="add" size={14} color="#3F6377" />
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
              this will be posted to your squad feed.
            </Text>
          </View>
          <BouncyButton
            title="Post to Squad"
            icon="send-outline"
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </View>
  );
}
