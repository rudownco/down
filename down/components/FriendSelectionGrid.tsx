import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AvatarCircle } from "./AvatarCircle";
import { cn } from "../lib/utils";
import type { User } from "../src/types";

interface FriendSelectionGridProps {
  friends: User[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onInvite?: () => void;
  className?: string;
}

export function FriendSelectionGrid({
  friends,
  selectedIds,
  onToggle,
  onInvite,
  className,
}: FriendSelectionGridProps) {
  return (
    <View className={cn("flex-row flex-wrap gap-5", className)}>
      {friends.map((friend) => {
        const isSelected = selectedIds.has(friend.id);
        return (
          <Pressable
            key={friend.id}
            onPress={() => onToggle(friend.id)}
            className="items-center gap-2 w-20"
          >
            <View className="relative">
              <View
                className={cn(
                  "rounded-full p-0.5",
                  isSelected && "border-2 border-primary"
                )}
              >
                <AvatarCircle user={friend} size="lg" tilt={isSelected ? 0 : 2} />
              </View>
              {isSelected && (
                <View className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text className="font-body-medium text-xs text-on-surface text-center">
              {friend.name.split(" ")[0]}
            </Text>
          </Pressable>
        );
      })}
      {/* Invite button */}
      {onInvite && (
        <Pressable onPress={onInvite} className="items-center gap-2 w-20">
          <View className="w-14 h-14 rounded-full border-2 border-dashed border-outline-variant items-center justify-center">
            <Ionicons name="add" size={22} color="#677A86" />
          </View>
          <Text className="font-body-medium text-xs text-outline text-center">
            Invite
          </Text>
        </Pressable>
      )}
    </View>
  );
}
