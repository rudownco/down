// Splash/loading screen while restoring session
import { View, ActivityIndicator, Text } from "react-native";

export default function LoadingScreen() {
  return (
    <View className="flex-1 bg-surface items-center justify-center gap-4">
      <Text className="font-heading-extrabold text-4xl text-primary italic tracking-tighter -rotate-3">
        down
      </Text>
      <ActivityIndicator size="large" color="#3F6377" />
    </View>
  );
}
