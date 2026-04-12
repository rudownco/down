import React from "react";
import { View, TextInput, Text, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../lib/utils";
import { useThemeColors } from "../src/hooks/useThemeColors";

interface FilledInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerClassName?: string;
}

export function FilledInput({
  label,
  icon,
  containerClassName,
  className,
  ...props
}: FilledInputProps) {
  const tc = useThemeColors();
  return (
    <View className={cn("gap-2", containerClassName)}>
      {label && (
        <Text className="font-label text-xs text-on-surface-variant tracking-widest uppercase px-1">
          {label}
        </Text>
      )}
      <View className="flex-row items-center bg-surface-container-highest rounded-input overflow-hidden">
        {icon && (
          <View className="pl-4">
            <Ionicons name={icon} size={18} color={tc.onSurfaceVariant} />
          </View>
        )}
        <TextInput
          placeholderTextColor={tc.outline}
          className={cn(
            "flex-1 font-body text-on-surface text-base px-4 py-4",
            className
          )}
          {...props}
        />
      </View>
    </View>
  );
}
