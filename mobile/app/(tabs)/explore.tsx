
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center">
      <Text className="text-foreground text-xl font-bold">Explore</Text>
      <Text className="text-muted-foreground mt-2">Coming Soon</Text>
    </SafeAreaView>
  );
}
