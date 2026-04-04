// Create Event Modal — popup from group detail
// Fields: title (required), location, time option(s), description

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FilledInput, SketchCard, BouncyButton, SectionLabel } from "./index";
import * as api from "../src/services/api";
import type { EventSuggestion } from "../src/types";

interface TimeOption {
  date: string;
  time: string;
}

interface Props {
  visible: boolean;
  groupId: string;
  onClose: () => void;
  onCreated: (event: EventSuggestion) => void;
}

export function CreateEventModal({ visible, groupId, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([{ date: "", time: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0;

  const handleClose = () => {
    setTitle("");
    setLocation("");
    setDescription("");
    setTimeOptions([{ date: "", time: "" }]);
    setIsSubmitting(false);
    onClose();
  };

  const updateTimeOption = (index: number, field: keyof TimeOption, value: string) => {
    setTimeOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  };

  const addTimeOption = () => {
    setTimeOptions((prev) => [...prev, { date: "", time: "" }]);
  };

  const removeTimeOption = (index: number) => {
    setTimeOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit || !groupId) return;
    setIsSubmitting(true);

    const filledOptions = timeOptions.filter((o) => o.date.trim() || o.time.trim());

    try {
      const created = await api.createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        group_id: groupId,
        time_options: filledOptions.length > 0 ? filledOptions : undefined,
      });
      onCreated(created);
      handleClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable className="flex-1 justify-end" onPress={handleClose}>
          <Pressable
            className="bg-surface rounded-t-3xl shadow-2xl"
            style={{ maxHeight: "92%" }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-outline-variant/40" />
            </View>

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
              <Text className="font-heading-extrabold text-2xl text-primary italic tracking-tighter -rotate-1">
                new hangout!
              </Text>
              <Pressable onPress={handleClose} className="p-2">
                <Ionicons name="close" size={22} color="#677A86" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, gap: 28 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* What */}
              <View className="gap-3">
                <Text className="font-heading text-xl text-primary">
                  what are we doing?
                </Text>
                <View className="relative">
                  <FilledInput
                    placeholder="name your vibe..."
                    value={title}
                    onChangeText={setTitle}
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

              {/* Where */}
              <View className="gap-3">
                <Text className="font-heading text-xl text-primary">
                  where at?
                </Text>
                <FilledInput
                  placeholder="pick a spot"
                  value={location}
                  onChangeText={setLocation}
                  icon="location-outline"
                />
              </View>

              {/* When */}
              <View className="gap-3">
                <Text className="font-heading text-xl text-primary">
                  when? (optional)
                </Text>
                <SketchCard tilt={0.6} variant="default" className="gap-3">
                  {timeOptions.map((opt, index) => (
                    <View key={index} className="gap-2">
                      {timeOptions.length > 1 && (
                        <View className="flex-row items-center justify-between">
                          <SectionLabel text={`option ${index + 1}`} />
                          <Pressable onPress={() => removeTimeOption(index)} className="p-1">
                            <Ionicons name="close-circle-outline" size={18} color="#677A86" />
                          </Pressable>
                        </View>
                      )}
                      <FilledInput
                        placeholder="MM/DD/YYYY"
                        value={opt.date}
                        onChangeText={(v) => updateTimeOption(index, "date", v)}
                        icon="calendar-outline"
                        keyboardType="numbers-and-punctuation"
                      />
                      <FilledInput
                        placeholder="7:00 PM"
                        value={opt.time}
                        onChangeText={(v) => updateTimeOption(index, "time", v)}
                        icon="time-outline"
                      />
                    </View>
                  ))}
                  <Pressable
                    onPress={addTimeOption}
                    className="flex-row items-center gap-2 pt-1"
                  >
                    <View className="w-7 h-7 rounded-full bg-primary-container items-center justify-center">
                      <Ionicons name="add" size={14} color="#3F6377" />
                    </View>
                    <Text className="font-body-medium text-xs text-on-surface-variant">
                      suggest another time
                    </Text>
                  </Pressable>
                </SketchCard>
                <Text className="font-label text-[10px] text-tertiary uppercase tracking-widest px-1">
                  heads up: no flaking allowed!
                </Text>
              </View>

              {/* Any deets */}
              <View className="gap-3">
                <Text className="font-heading text-xl text-primary">
                  any deets?
                </Text>
                <FilledInput
                  placeholder="mention the vibe, dress code, what to bring..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  style={{ textAlignVertical: "top", minHeight: 72, fontStyle: "italic" }}
                />
              </View>

              {/* CTA */}
              <BouncyButton
                title="Post to Squad"
                icon="send-outline"
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                loading={isSubmitting}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
