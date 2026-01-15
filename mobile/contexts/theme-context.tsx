import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'nativewind';
import { Appearance, View } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const AppThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativeColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (mode === 'system') {
      const systemScheme = Appearance.getColorScheme();
      setColorScheme(systemScheme || 'dark');
    } else {
      setColorScheme(mode);
    }
  };

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      if (themeMode === 'system') {
        const scheme = newScheme || 'dark';
        setColorScheme(scheme);
      }
    });

    return () => subscription.remove();
  }, [themeMode, setColorScheme]);

  const isDark = colorScheme === 'dark';

  return (
    <AppThemeContext.Provider 
      value={{ 
        themeMode, 
        setThemeMode, 
        isDark 
      }}
    >
      <View 
        className={isDark ? "dark" : ""} 
        style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#FFFFFF" }}
      >
        {children}
      </View>
    </AppThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = React.useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
