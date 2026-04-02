// Tab layout with custom bottom tab bar
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";
import { useEffect } from "react";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../../src/context/AuthContext";
import { supabase } from "../../../src/services/supabase";
import { useNotificationsRealtime } from "@down/common";
import { useNotificationStore } from "../../../src/stores/notificationStore";

function TabBarIcon({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={name}
      size={22}
      color={focused ? "#3F6377" : "#76574E"}
      style={{ opacity: focused ? 1 : 0.6 }}
    />
  );
}

export default function TabsLayout() {
  const { user } = useAuth();
  const { unreadCount, loadUnread, incrementGroup } = useNotificationStore();

  useEffect(() => {
    if (!user) return;
    loadUnread();
  }, [user?.id]);

  useNotificationsRealtime(supabase, user?.id, (notif) => {
    incrementGroup(notif.groupId);
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.9)",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderTopWidth: 0,
          height: 80,
          paddingTop: 8,
          shadowColor: "#131D23",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.06,
          shadowRadius: 32,
          elevation: 12,
          position: "absolute",
        },
        tabBarActiveTintColor: "#3F6377",
        tabBarInactiveTintColor: "#76574E",
        tabBarLabelStyle: {
          fontFamily: "BeVietnamPro_500Medium",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Events",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? "sparkles" : "sparkles-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? "people" : "people-outline"} focused={focused} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? "person" : "person-outline"} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
