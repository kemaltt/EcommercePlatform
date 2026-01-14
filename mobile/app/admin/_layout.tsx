import { Stack } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Redirect } from "expo-router";

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user || !user.isAdmin) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Admin Dashboard",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="manage-product"
        options={{
          title: "Manage Product",
          headerShown: true,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
