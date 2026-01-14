import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "../assets/global.css";

import { AuthProvider } from "../hooks/use-auth";
import { CartProvider } from "../hooks/use-cart";
import { I18nProvider } from "../contexts/i18n-context";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <SafeAreaProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="product/[id]" />
                <Stack.Screen name="admin" />
              </Stack>
            </SafeAreaProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}
