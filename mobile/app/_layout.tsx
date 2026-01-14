import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "../assets/global.css";

import { AuthProvider } from "../hooks/use-auth";
import { CartProvider } from "../hooks/use-cart";
import { I18nProvider } from "../contexts/i18n-context";
import { FavoritesProvider } from "../hooks/use-favorites";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="product/[id]" options={{ presentation: "modal" }} />
                  <Stack.Screen name="admin" />
                </Stack>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
