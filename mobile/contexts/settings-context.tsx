import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setHapticsEnabledState } from '../lib/haptics';

export interface SettingsContextType {
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const HAPTICS_KEY = 'settings.haptics';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [hapticsEnabled, setHapticsState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedHaptics = await AsyncStorage.getItem(HAPTICS_KEY);
        // Default to true if not set
        const isEnabled = storedHaptics !== null ? JSON.parse(storedHaptics) : true;
        
        setHapticsState(isEnabled);
        setHapticsEnabledState(isEnabled);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const setHapticsEnabled = async (enabled: boolean) => {
    setHapticsState(enabled);
    setHapticsEnabledState(enabled); // Update the utility module state
    try {
      await AsyncStorage.setItem(HAPTICS_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const contextValue = useMemo(() => ({
    hapticsEnabled,
    setHapticsEnabled,
    isLoading
  }), [hapticsEnabled, isLoading]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
