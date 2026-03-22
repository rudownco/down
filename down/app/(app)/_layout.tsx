// Authenticated app layout
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="group/[id]" />
      <Stack.Screen name="group-create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="event/create" />
      <Stack.Screen name="event/[id]/vote" />
      <Stack.Screen name="event/[id]/rsvp" />
    </Stack>
  );
}
