import { Tabs, useRouter } from "expo-router";
import { Home, ShoppingBag, User, Compass, ShoppingCart } from "lucide-react-native";
import { useAuth } from "../../hooks/use-auth";
import { useIntl } from "react-intl";
import { View, Platform, Text } from "react-native";

export default function TabsLayout() {
  const { user } = useAuth();
  const intl = useIntl();
  const router = useRouter();

  // Helper to intercept navigation for protected tabs
  const handleProtectedTabPress = (e: any) => {
    if (!user) {
      // Prevent default navigation
      e.preventDefault();
      // Redirect to login
       // @ts-ignore
      router.push("/(auth)/login");
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fbbf24", // Gold/Amber accent
        tabBarInactiveTintColor: "#94a3b8", // Slate-400
        tabBarStyle: {
          backgroundColor: "#1e2029", // Midnight Blue
          borderTopWidth: 1,
          borderTopColor: "#334155", // Slate-700
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          height: Platform.OS === "ios" ? 90 : 70,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
          letterSpacing: 0.5,
        },
        headerShown: false, // We will use custom headers in screens
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarIcon: ({ color, focused }) => (
             <Home size={24} color={color} fill={focused ? color : "none"} />
          ),
        }}
      />
      
      {/* Search/Explore Tab - New */}
      <Tabs.Screen
        name="explore" 
        options={{
          title: "EXPLORE",
          tabBarIcon: ({ color, focused }) => (
             <Compass size={24} color={color} fill={focused ? color : "none"} />
          ),
          href: null, // Placeholder if no actual route yet, or we can make a dummy one
        }}
      />

      <Tabs.Screen
        name="cart"
        listeners={{
          tabPress: handleProtectedTabPress,
        }}
        options={{
          title: "CART",
          tabBarIcon: ({ color, focused }) => (
             <View>
               <ShoppingCart size={24} color={color} fill={focused ? color : "none"} />
               {/* Badge could go here. Only show if user has cart items (omitted for now) */}
               {/* 
               <View className="absolute -top-2 -right-2 bg-[#6366f1] w-4 h-4 rounded-full items-center justify-center">
                  <View className="bg-primary w-full h-full rounded-full items-center justify-center">
                    <Text style={{ fontSize: 9, color: 'white', fontWeight: 'bold' }}>3</Text>
                  </View>
               </View>
               */}
             </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: handleProtectedTabPress,
        }}
        options={{
          title: "PROFILE",
          tabBarIcon: ({ color, focused }) => (
            <User size={24} color={color} fill={focused ? color : "none"} />
          ),
        }}
      />
    </Tabs>
  );
}
