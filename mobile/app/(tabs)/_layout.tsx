import { Tabs } from "expo-router";
import { Home, ShoppingCart, User } from "lucide-react-native";
import { useAuth } from "../../hooks/use-auth";
import { useIntl } from "react-intl";

export default function TabsLayout() {
  const { user } = useAuth();
  const intl = useIntl();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: intl.formatMessage({ id: "cart.startShopping" }), // "Shop"
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          headerTitle: "E-Commerce",
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: intl.formatMessage({ id: "cart.title" }),
          tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
          headerTitle: intl.formatMessage({ id: "cart.title" }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: intl.formatMessage({ id: "profile.title" }),
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          headerTitle: intl.formatMessage({ id: "profile.title" }),
        }}
      />
    </Tabs>
  );
}
