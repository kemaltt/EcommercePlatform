import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
    // Sync NativeWind v4 color scheme
    if (themeMode === 'system') {
      setColorScheme(Appearance.getColorScheme() || 'light');
    } else {
      setColorScheme(themeMode);
    }

    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      if (themeMode === 'system') {
        setColorScheme(newScheme || 'light');
      }
    });

    return () => subscription.remove();
  }, [themeMode, setColorScheme]);

  // Immediate isDark calculation for faster UI response
  const isDark = themeMode === 'dark' || (themeMode === 'system' && Appearance.getColorScheme() === 'dark');

  const contextValue = useMemo(() => ({
    themeMode,
    setThemeMode,
    isDark
  }), [themeMode, isDark]);

  return (
    <AppThemeContext.Provider value={contextValue}>
      {children}
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
