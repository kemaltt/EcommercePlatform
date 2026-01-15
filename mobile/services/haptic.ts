import * as Haptics from "expo-haptics";

/**
 * Centralized Haptic Feedback Service
 * Provides consistent haptic feedback across the app
 */
export const HapticService = {
  /**
   * Light impact for successful operations
   * Use for: successful login, item added to cart, settings saved
   */
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics might not be available on all devices
      console.log("Haptic feedback not available");
    }
  },

  /**
   * Error notification for failures
   * Use for: login failed, validation errors, network errors
   */
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log("Haptic feedback not available");
    }
  },

  /**
   * Warning notification
   * Use for: warnings, confirmations needed
   */
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.log("Haptic feedback not available");
    }
  },

  /**
   * Light selection feedback
   * Use for: button presses, tab switches, selections
   */
  selection: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.log("Haptic feedback not available");
    }
  },

  /**
   * Light impact
   * Use for: subtle interactions
   */
  light: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log("Haptic feedback not available");
    }
  },

  /**
   * Medium impact
   * Use for: moderate interactions
   */
  medium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log("Haptic feedback not available");
    }
  },

  /**
   * Heavy impact
   * Use for: important interactions
   */
  heavy: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log("Haptic feedback not available");
    }
  },
};
