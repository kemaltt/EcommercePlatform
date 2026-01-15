import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "../assets/global.css";

import { AuthProvider } from "../hooks/use-auth";
import { CartProvider } from "../hooks/use-cart";
import { I18nProvider } from "../contexts/i18n-context";
import { FavoritesProvider } from "../hooks/use-favorites";
import { ThemeProvider, useTheme } from "../contexts/theme-context";

const queryClient = new QueryClient();

import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";

function ThemedNavigationRoot() {
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
            contentStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/_layout" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ presentation: "modal" }} />
          <Stack.Screen name="admin" />
        </Stack>
      </View>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <ThemedNavigationRoot />
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
