// Create Squad screen — matching Stitch export1
// "The Social Sketchbook" aesthetic

import React, { useState } from "react";
import { View, Text, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  SketchCard,
  FilledInput,
  JellybeanChip,
  FriendSelectionGrid,
  BouncyButton,
  SectionLabel,
} from "../../components";
import * as api from "../../src/services/api";
import { useGroupStore } from "../../src/stores/groupStore";

const SUGGESTIONS = [
  "The Supper Club",
  "Brunch Queens",
  "Game Night Crew",
  "Padel Bros",
  "Weekend Warriors",
];

export default function CreateGroupScreen() {
  const router = useRouter();
  const { addGroup } = useGroupStore();
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set(),
  );

  const canCreate = groupName.trim().length > 0;

  const handleCreate = async () => {
    if (!canCreate) return;
    setIsCreating(true);
    try {
      const newGroup = await api.createGroup(groupName.trim());
      addGroup(newGroup);
      router.back();
    } catch (e: any) {
      Alert.alert("Something went wrong", e.message);
      setIsCreating(false);
    }
  };

  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Friends list will come from a contacts/friends API once available
  const friends: { id: string; name: string; avatarUrl?: string }[] = [];

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="pt-14 px-6 pb-4 flex-row justify-between items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-12 h-12 items-center justify-center rounded-full bg-surface-container-highest"
        >
          <Ionicons name="close" size={22} color="#3F6377" />
        </Pressable>
        <Text className="font-heading-extrabold text-2xl text-primary italic tracking-tighter -rotate-2">
          down
        </Text>
        <View className="w-12 h-12" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, gap: 32 }}
        className="px-6"
      >
        {/* Hero */}
        <View className="items-center gap-2 pt-4">
          <Text className="font-heading-extrabold text-3xl text-primary tracking-tight text-center">
            r u down?
          </Text>
          <Text className="font-body text-tertiary italic text-base">
            time to assemble the dream team.
          </Text>
        </View>

        {/* Squad name card */}
        <SketchCard tilt={-1.2} className="gap-4">
          <SectionLabel text="give your squad a name" />
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-secondary-container items-center justify-center">
              <Text className="text-2xl">🎉</Text>
            </View>
            <View className="flex-1">
              <FilledInput
                placeholder="The Clique..."
                value={groupName}
                onChangeText={setGroupName}
                style={{
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontSize: 18,
                }}
              />
            </View>
          </View>
        </SketchCard>

        {/* Friends selection */}
        <View className="gap-4">
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="font-heading text-xl text-on-surface">
                Add your crew
              </Text>
              <Text className="font-label text-xs text-tertiary italic">
                don't flake on your crew!
              </Text>
            </View>
            <Pressable className="flex-row items-center gap-1">
              <Ionicons name="search" size={16} color="#3F6377" />
              <Text className="font-body-semibold text-sm text-primary">
                Find more
              </Text>
            </Pressable>
          </View>

          <FriendSelectionGrid
            friends={friends}
            selectedIds={selectedFriends}
            onToggle={toggleFriend}
            onInvite={() => {}}
          />
        </View>

        {/* Hot suggestions */}
        <View
          className="bg-primary-container/30 p-5 rounded-card gap-3"
          style={{ transform: [{ rotate: "1.5deg" }] }}
        >
          <Text className="font-heading text-xs text-on-primary-container uppercase tracking-widest">
            hot suggestions
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setGroupName(s)}
                className="bg-surface-container-lowest px-4 py-2 rounded-chip border border-primary/10"
              >
                <Text className="font-body-medium text-sm text-on-surface">
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-surface-container-lowest/80">
        <BouncyButton
          title="Create Squad"
          icon="rocket-outline"
          onPress={handleCreate}
          disabled={!canCreate || isCreating}
          loading={isCreating}
        />
      </View>
    </View>
  );
}
