import React from "react";
import { View, TextInput, Text, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../lib/utils";

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
            <Ionicons name={icon} size={18} color="#374955" />
          </View>
        )}
        <TextInput
          placeholderTextColor="#677A86"
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
