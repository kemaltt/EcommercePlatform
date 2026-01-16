import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useIntl } from "react-intl";
import { useAuth } from "./use-auth";
import { Alert } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// REPLACE THESE WITH YOUR ACTUAL CLIENT IDs FROM GOOGLE CLOUD CONSOLE
// You can also move these to an environment variable config
const IOS_CLIENT_ID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";
const ANDROID_CLIENT_ID = "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com";
const WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";

export function useGoogleAuth() {
  const intl = useIntl();
  const { googleLogin } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
  });

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
