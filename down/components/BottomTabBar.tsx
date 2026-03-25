import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../lib/utils";

interface TabItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { name: "index", label: "events", icon: "sparkles-outline", iconFilled: "sparkles" },
  { name: "explore", label: "groups", icon: "people-outline", iconFilled: "people" },
  { name: "profile", label: "profile", icon: "person-outline", iconFilled: "person" },
];

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (name: string) => void;
}

export function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  return (
    <View
      className="flex-row justify-around items-center px-6 pt-3 pb-8 bg-surface-container-lowest/80"
      style={{
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#131D23",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.06,
        shadowRadius: 32,
        elevation: 8,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <Pressable
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            className={cn(
              "items-center justify-center py-1.5 px-5",
              isActive && "bg-primary-container rounded-chip"
            )}
          >
            <Ionicons
              name={isActive ? tab.iconFilled : tab.icon}
              size={22}
              color={isActive ? "#3F6377" : "#76574E"}
            />
            <Text
              className={cn(
                "font-label text-[10px] uppercase tracking-widest mt-0.5",
                isActive ? "text-primary" : "text-tertiary opacity-60"
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
