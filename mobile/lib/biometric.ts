import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

const BIOMETRIC_ENABLED_KEY = "biometric_enabled";
const BIOMETRIC_CREDENTIALS_KEY = "biometric_credentials";

export interface BiometricCredentials {
  username: string;
  password?: string; // Optional if we only store username for prompt but usually we need both
}

export const BiometricService = {
  /**
   * Check if biometrics are available and enrolled on the device
   */
  async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  /**
   * Check if the user has enabled biometric login in the app settings
   */
  async isEnabled(): Promise<boolean> {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === "true";
  },

  /**
   * Set biometric login preference
   */
  async setEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(
      BIOMETRIC_ENABLED_KEY,
      enabled ? "true" : "false"
    );
    if (!enabled) {
      await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    }
  },

  /**
   * Securely store user credentials for biometric login
   */
  async storeCredentials(credentials: BiometricCredentials): Promise<void> {
    await SecureStore.setItemAsync(
      BIOMETRIC_CREDENTIALS_KEY,
      JSON.stringify(credentials)
    );
  },

  /**
   * Retrieve securely stored credentials
   */
  async getCredentials(): Promise<BiometricCredentials | null> {
    const data = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  },

  /**
   * Perform biometric authentication
   */
  async authenticate(
    reason: string = "Confirm your identity"
  ): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return false;
    }
  },
};
