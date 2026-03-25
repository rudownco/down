// Tab layout with custom bottom tab bar
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";
import { cn } from "../../../lib/utils";

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
