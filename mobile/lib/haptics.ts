import * as Haptics from "expo-haptics";

// Module-level variable to track if haptics are enabled
// This allows usage outside of React components/hooks if needed (e.g., in axios interceptors)
// though we prefer the context approach for React apps.
let isHapticsEnabled = true;

export const setHapticsEnabledState = (enabled: boolean) => {
  isHapticsEnabled = enabled;
};

export const getHapticsEnabledState = () => {
  return isHapticsEnabled;
};

export const hapticSuccess = async () => {
  if (!isHapticsEnabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn("Haptic feedback failed", error);
  }
};

export const hapticError = async () => {
  if (!isHapticsEnabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.warn("Haptic feedback failed", error);
  }
};

export const hapticSelection = async () => {
  if (!isHapticsEnabled) return;
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.warn("Haptic feedback failed", error);
  }
};
