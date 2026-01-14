import React from "react";
import { Tabs, useRouter } from "expo-router";
import { Home, ShoppingBag, User, Compass, ShoppingCart, Heart } from "lucide-react-native";
import { useAuth } from "../../hooks/use-auth";
import { useCart } from "../../hooks/use-cart";
import { useFavorites } from "../../hooks/use-favorites";
import { useIntl } from "react-intl";
import { View, Platform, Text } from "react-native";

export default function TabsLayout() {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { favorites } = useFavorites();
  const intl = useIntl();
  const router = useRouter();
  
  // Use a ref to ensure the listener always has the latest user state
  const userRef = React.useRef(user);
  React.useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Helper to intercept navigation for protected tabs
  const handleProtectedTabPress = (e: any) => {
    const currentUser = userRef.current;
    if (!currentUser) {
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
        name="saved"
        listeners={{
          tabPress: handleProtectedTabPress,
        }}
        options={{
          title: "WISHLIST",
          tabBarIcon: ({ color, focused }) => (
             <View>
               <Heart size={24} color={color} fill={focused ? color : "none"} />
               {favorites.length > 0 && (
                 <View className="absolute -top-1.5 -right-2 bg-red-500 w-4 h-4 rounded-full items-center justify-center border border-[#1e2029]">
                    <Text className="text-[9px] font-bold text-white">{favorites.length > 9 ? '9+' : favorites.length}</Text>
                 </View>
               )}
             </View>
          ),
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
               {cartItems.length > 0 && (
                 <View className="absolute -top-1.5 -right-2 bg-red-500 w-4 h-4 rounded-full items-center justify-center border border-[#1e2029]">
                    <Text className="text-[9px] font-bold text-white">{cartItems.length > 9 ? '9+' : cartItems.length}</Text>
                 </View>
               )}
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
