import React from "react";
import { Tabs, useRouter } from "expo-router";
import { Home, ShoppingBag, User, Compass, ShoppingCart, Heart } from "lucide-react-native";
import { useAuth } from "../../hooks/use-auth";
import { useCart } from "../../hooks/use-cart";
import { useFavorites } from "../../hooks/use-favorites";
import { useIntl } from "react-intl";
import { View, Platform, Text } from "react-native";
import { useTheme } from "../../contexts/theme-context";

export default function TabsLayout() {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { favorites } = useFavorites();
  const intl = useIntl();
  const router = useRouter();
  const { isDark } = useTheme();
  
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
        tabBarActiveTintColor: isDark ? "#fbbf24" : "#4f46e5",
        tabBarInactiveTintColor: isDark ? "#94a3b8" : "#64748b",
        tabBarStyle: {
          backgroundColor: isDark ? "#1e2029" : "#ffffff",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#334155" : "#e2e8f0",
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          height: Platform.OS === "ios" ? 90 : 70,
          elevation: 0,
          shadowOpacity: isDark ? 0 : 0.05,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
          letterSpacing: 0.5,
        },
        headerShown: false,
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
                  <View 
                    className="absolute -top-1.5 -right-2 bg-rose-500 rounded-full items-center justify-center border-2 shadow-sm"
                    style={{ 
                      borderColor: isDark ? "#1e2029" : "#ffffff",
                      width: 18,
                      height: 18
                    }}
                  >
                     <Text className="text-[10px] font-black text-white leading-none">
                       {favorites.length > 9 ? '9+' : favorites.length}
                     </Text>
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
                  <View 
                    className="absolute -top-1.5 -right-2 bg-rose-500 rounded-full items-center justify-center border-2 shadow-sm"
                    style={{ 
                      borderColor: isDark ? "#1e2029" : "#ffffff",
                      width: 18,
                      height: 18
                    }}
                  >
                     <Text className="text-[10px] font-black text-white leading-none">
                       {cartItems.length > 9 ? '9+' : cartItems.length}
                     </Text>
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
