// Authenticated app layout with tab navigation
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="group/[id]" />
      <Stack.Screen name="group-create" options={{ presentation: "modal" }} />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="event/create" />
      <Stack.Screen name="event/[id]/vote" />
      <Stack.Screen name="event/[id]/rsvp" />
    </Stack>
  );
}
