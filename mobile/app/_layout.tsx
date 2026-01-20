import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "../assets/global.css";

import { AuthProvider } from "../hooks/use-auth";
import { CartProvider } from "../hooks/use-cart";
import { I18nProvider } from "../contexts/i18n-context";
import { CheckoutProvider } from "../contexts/checkout-context";
import { FavoritesProvider } from "../hooks/use-favorites";
import { ThemeProvider, useTheme } from "../contexts/theme-context";
import { SettingsProvider } from "../contexts/settings-context";
import { hapticSuccess, hapticError } from "../lib/haptics";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      hapticSuccess();
    },
    onError: () => {
      hapticError();
    },
  }),
  queryCache: new QueryCache({
    onError: () => {
      // Optional: trigger error haptic on query failure?
      // Often too noisy, maybe only for specific high-value queries.
      // Keeping it off by default for queries to avoid vibration loops on retries.
      // hapticError();
    },
  }),
});

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";

export default function RootLayout() {
  const [qc] = React.useState(() => queryClient);

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <SettingsProvider>
          <ThemeProvider>
            <QueryClientProvider client={qc}>
              <AuthProvider>
                <CartProvider>
                  <CheckoutProvider>
                    <FavoritesProvider>
                      <ThemeConsumer />
                    </FavoritesProvider>
                  </CheckoutProvider>
                </CartProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </SettingsProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

function ThemeConsumer() {
  const { isDark } = useTheme();
  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View
        className={isDark ? "dark" : ""}
        style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#FFFFFF" }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[id]"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="admin" />
        </Stack>
      </View>
    </NavThemeProvider>
  );
}
