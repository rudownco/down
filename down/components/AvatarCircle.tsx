import React, { useMemo } from "react";
import { View, Text, Image } from "react-native";
import { cn } from "../lib/utils";
import { randomTilt } from "../lib/animations";
import type { User } from "../src/types";

const AVATAR_COLORS = [
  "#FE6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FEB64F", "#C681F6", "#4FC294", "#FE7FA3",
];

const SIZES = {
  xs: { container: 24, text: 10 },
  sm: { container: 32, text: 12 },
  md: { container: 40, text: 14 },
  lg: { container: 56, text: 20 },
  xl: { container: 72, text: 26 },
} as const;

interface AvatarCircleProps {
  user: User;
  size?: keyof typeof SIZES;
  imageUri?: string;
  tilt?: number;
  borderColor?: string;
  className?: string;
}

function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function AvatarCircle({
  user,
  size = "md",
  imageUri,
  tilt,
  borderColor,
  className,
}: AvatarCircleProps) {
  const dims = SIZES[size];
  const bgColor = AVATAR_COLORS[djb2Hash(user.id) % AVATAR_COLORS.length];
  const rotation = useMemo(() => tilt ?? randomTilt(3), [tilt]);

  return (
    <View
      className={cn("items-center justify-center rounded-full overflow-hidden", className)}
      style={{
        width: dims.container,
        height: dims.container,
        backgroundColor: imageUri ? "transparent" : bgColor,
        transform: [{ rotate: `${rotation}deg` }],
        borderWidth: borderColor ? 3 : 0,
        borderColor: borderColor ?? "transparent",
      }}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: dims.container, height: dims.container }}
          className="rounded-full"
        />
      ) : (
        <Text
          className="font-heading text-white"
          style={{ fontSize: dims.text }}
        >
          {getInitials(user.name)}
        </Text>
      )}
    </View>
  );
}
