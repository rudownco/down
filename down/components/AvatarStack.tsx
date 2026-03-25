import React from "react";
import { View, Text } from "react-native";
import { AvatarCircle } from "./AvatarCircle";
import { cn } from "../lib/utils";
import type { User } from "../src/types";

interface AvatarStackProps {
  users: User[];
  maxVisible?: number;
  size?: "xs" | "sm" | "md" | "lg";
  borderColor?: string;
  showCount?: boolean;
  className?: string;
}

const SIZE_MAP = { xs: 24, sm: 32, md: 40, lg: 56 };

export function AvatarStack({
  users,
  maxVisible = 3,
  size = "md",
  borderColor = "#FFFFFF",
  showCount = true,
  className,
}: AvatarStackProps) {
  const visible = users.slice(0, maxVisible);
  const remaining = users.length - maxVisible;
  const dim = SIZE_MAP[size];
  const overlap = dim * 0.3;

  return (
    <View className={cn("flex-row items-center", className)}>
      {visible.map((user, i) => (
        <View
          key={user.id}
          style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: maxVisible - i }}
        >
          <AvatarCircle
            user={user}
            size={size}
            borderColor={borderColor}
            tilt={0}
          />
        </View>
      ))}
      {showCount && remaining > 0 && (
        <View
          className="items-center justify-center rounded-full bg-primary-container"
          style={{
            width: dim,
            height: dim,
            marginLeft: -overlap,
            borderWidth: 3,
            borderColor,
          }}
        >
          <Text
            className="font-heading text-primary"
            style={{ fontSize: dim * 0.28 }}
          >
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}
