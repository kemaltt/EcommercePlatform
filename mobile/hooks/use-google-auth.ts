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
    iosClientId: WEB_CLIENT_ID,
    androidClientId: WEB_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    // Use the hardcoded proxy URI so Google redirects back to the proxy
    redirectUri: "https://auth.expo.io/@kemaltt/DeinShop-Mobile",
  });

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
    if (loading || !request) return;

    try {
      // 1. Generate the direct Google Auth URL
      const authUrl = await request.makeAuthUrlAsync(Google.discovery);

      // 2. Construct the local return URL (the exp:// link)
      const returnUrl = AuthSession.makeRedirectUri({
        scheme: "ecommerce-app",
      });

      // 3. Manually construct the Proxy "start" URL
      const proxyStartUrl = `https://auth.expo.io/@kemaltt/DeinShop-Mobile/start?authUrl=${encodeURIComponent(
        authUrl
      )}&returnUrl=${encodeURIComponent(returnUrl)}`;

      console.log("Starting Manual Proxy Auth Session...");
      console.log("Local Return URI:", returnUrl);

      // 4. Open the proxy start URL instead of the Google URL
      const result = await promptAsync({ url: proxyStartUrl });

      if (result.type === "success") {
        const { id_token } = result.params;
        if (id_token) {
          await handleGoogleLogin(id_token);
        }
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return {
    signIn,
    loading: loading || !request,
  };
}
