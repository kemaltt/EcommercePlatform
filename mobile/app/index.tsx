import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Welcome to E-commerce App</Text>
      <Link href="/(auth)/login" className="mt-4 text-primary font-medium">
        Go to Login
      </Link>
    </View>
  );
}
