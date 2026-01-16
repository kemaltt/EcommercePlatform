import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { useIntl } from "react-intl";
import { useAuth } from "./use-auth";
import { Alert } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// Client IDs are now loaded from mobile/.env using EXPO_PUBLIC_ prefix
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_IOS_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_CLIENT_ID;

export interface GoogleAuthOptions {
  onSuccess?: () => void;
}

export function useGoogleAuth(options?: GoogleAuthOptions) {
  const intl = useIntl();
  const { googleLogin } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    // When using the proxy, we MUST use the Web Client ID even on iOS/Android
    // because that's where the Redirect URIs are configured in the console.
    iosClientId: WEB_CLIENT_ID,
    androidClientId: WEB_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    // Brute force: Hardcode the Expo Proxy URI
    redirectUri: "https://auth.expo.io/@kemaltt/DeinShop-Mobile",
  });

  React.useEffect(() => {
    if (request) {
      console.log("Google Auth Redirect URI:", request.redirectUri);
    }
  }, [request]);

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      await googleLogin(idToken);
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        error.response?.data?.message || "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    if (loading) return;
    promptAsync();
  };

  return {
    signIn,
    loading: loading || !request,
  };
}
