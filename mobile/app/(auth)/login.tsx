import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { FormattedMessage, useIntl } from "react-intl";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const intl = useIntl();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        intl.formatMessage({ id: "auth.login.subtitle" })
      );
      return;
    }

    setLoading(true);
    try {
      await login({ username, password });
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        error?.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-center px-6 py-12">
        <View className="mb-10">
          <Text className="text-4xl font-bold text-foreground mb-2">
            <FormattedMessage id="auth.login.title" />
          </Text>
          <Text className="text-muted-foreground text-lg">
            <FormattedMessage id="auth.login.subtitle" />
          </Text>
        </View>

        <View className="space-y-4">
          <Input
            label={intl.formatMessage({ id: "auth.login.username" })}
            value={username}
            onChangeText={setUsername}
            placeholder={intl.formatMessage({ id: "auth.login.username" })}
          />
          <Input
            label={intl.formatMessage({ id: "auth.login.password" })}
            value={password}
            onChangeText={setPassword}
            placeholder={intl.formatMessage({ id: "auth.login.password" })}
            secureTextEntry
          />
        </View>

        <TouchableOpacity className="self-end mb-8">
          <Text className="text-primary font-medium">
            <FormattedMessage id="auth.login.forgot" />
          </Text>
        </TouchableOpacity>

        <Button
          title={intl.formatMessage({ id: "auth.login.button" })}
          onPress={handleLogin}
          loading={loading}
        />

        <View className="flex-row justify-center mt-8">
          <Text className="text-muted-foreground">
            <FormattedMessage id="auth.login.noAccount" />
          </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-bold">
                <FormattedMessage id="auth.login.register" />
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
