import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { FormattedMessage, useIntl } from "react-intl";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const intl = useIntl();

  const handleRegister = async () => {
    if (!fullName || !email || !username || !password) {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        intl.formatMessage({ id: "auth.register.subtitle" })
      );
      return;
    }

    setLoading(true);
    try {
      await register({ fullName, email, username, password });
      Alert.alert(
        intl.formatMessage({ id: "common.success" }),
        "Account created successfully!",
        [{ text: intl.formatMessage({ id: "common.ok" }), onPress: () => router.replace("/(tabs)") }]
      );
    } catch (error: any) {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        error?.response?.data?.message || "Something went wrong"
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
            <FormattedMessage id="auth.register.title" />
          </Text>
          <Text className="text-muted-foreground text-lg">
            <FormattedMessage id="auth.register.subtitle" />
          </Text>
        </View>

        <View className="space-y-4">
          <Input
            label={intl.formatMessage({ id: "auth.register.fullName" })}
            value={fullName}
            onChangeText={setFullName}
            placeholder={intl.formatMessage({ id: "auth.register.fullName" })}
          />
          <Input
            label={intl.formatMessage({ id: "auth.register.email" })}
            value={email}
            onChangeText={setEmail}
            placeholder={intl.formatMessage({ id: "auth.register.email" })}
          />
          <Input
            label={intl.formatMessage({ id: "auth.register.username" })}
            value={username}
            onChangeText={setUsername}
            placeholder={intl.formatMessage({ id: "auth.register.username" })}
          />
          <Input
            label={intl.formatMessage({ id: "auth.register.password" })}
            value={password}
            onChangeText={setPassword}
            placeholder={intl.formatMessage({ id: "auth.register.password" })}
            secureTextEntry
          />
        </View>

        <Button
          title={intl.formatMessage({ id: "auth.register.button" })}
          onPress={handleRegister}
          loading={loading}
          className="mt-8"
        />

        <View className="flex-row justify-center mt-8">
          <Text className="text-muted-foreground">
            <FormattedMessage id="auth.register.hasAccount" />
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-bold">
                <FormattedMessage id="auth.register.login" />
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
