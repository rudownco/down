// Tab layout with custom bottom tab bar
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useAuth } from "../../../src/context/AuthContext";
import { useTheme } from "../../../src/context/ThemeContext";
import { useThemeColors } from "../../../src/hooks/useThemeColors";
import { supabase } from "../../../src/services/supabase";
import { useNotificationsRealtime } from "@down/common";
import { useNotificationStore } from "../../../src/stores/notificationStore";

export default function TabsLayout() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const tc = useThemeColors();
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
          backgroundColor: isDark ? "rgba(16,20,24,0.95)" : "rgba(255,255,255,0.9)",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderTopWidth: 0,
          height: 80,
          paddingTop: 8,
          shadowColor: tc.onSurface,
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.06,
          shadowRadius: 32,
          elevation: 12,
          position: "absolute",
        },
        tabBarActiveTintColor: tc.primary,
        tabBarInactiveTintColor: tc.tertiary,
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
            <Ionicons
              name={focused ? "sparkles" : "sparkles-outline"}
              size={22}
              color={focused ? tc.primary : tc.tertiary}
              style={{ opacity: focused ? 1 : 0.6 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={22}
              color={focused ? tc.primary : tc.tertiary}
              style={{ opacity: focused ? 1 : 0.6 }}
            />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={focused ? tc.primary : tc.tertiary}
              style={{ opacity: focused ? 1 : 0.6 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
