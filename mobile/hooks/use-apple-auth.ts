import * as AppleAuthentication from "expo-apple-authentication";
import * as React from "react";
import { Platform, Alert } from "react-native";
import { useIntl } from "react-intl";
import { useAuth } from "./use-auth";

export interface AppleAuthOptions {
  onSuccess?: () => void;
}

export function useAppleAuth(options?: AppleAuthOptions) {
  const intl = useIntl();
  const { appleLogin } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const signIn = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        "Apple Sign-In is only available on iOS"
      );
      return;
    }

    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        await appleLogin({
          identityToken: credential.identityToken,
          fullName: credential.fullName
            ? {
                firstName: credential.fullName.givenName || undefined,
                lastName: credential.fullName.familyName || undefined,
              }
            : null,
        });

        if (options?.onSuccess) {
          options.onSuccess();
        }
      } else {
        throw new Error("No identity token returned");
      }
    } catch (error: any) {
      if (error.code === "ERR_CANCELED") {
        // user cancelled the login flow
        console.log("Apple login cancelled");
      } else {
        console.error("Apple login error:", error);
        Alert.alert(
          intl.formatMessage({ id: "common.error" }),
          "Apple login failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    loading,
    isAvailable: Platform.OS === "ios",
  };
}
