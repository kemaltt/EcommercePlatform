import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { FormattedMessage, useIntl } from "react-intl";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const { height } = Dimensions.get("window");

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
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4f46e5', '#3730a3', '#1e1b4b']} // Indigo-600 to Indigo-950
        className="absolute top-0 left-0 right-0 h-[45%]"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 justify-center">
              {/* Header Section */}
              <View className="mb-12 mt-10">
                <Text className="text-white text-5xl font-extrabold mb-3 tracking-tight">
                  <FormattedMessage id="auth.login.title" />
                </Text>
                <Text className="text-indigo-100 text-xl font-medium opacity-90">
                  <FormattedMessage id="auth.login.subtitle" />
                </Text>
              </View>

              {/* Form Section */}
              <View className="bg-card/95 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl shadow-indigo-900/20 border border-white/20">
                <View className="space-y-2">
                  <Input
                    label={intl.formatMessage({ id: "auth.login.username" })}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="johndoe"
                    autoCapitalize="none"
                  />
                  <Input
                    label={intl.formatMessage({ id: "auth.login.password" })}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity className="self-end mt-2 mb-8">
                  <Text className="text-primary font-semibold text-sm">
                    <FormattedMessage id="auth.login.forgot" />
                  </Text>
                </TouchableOpacity>

                <Button
                  title={intl.formatMessage({ id: "auth.login.button" })}
                  onPress={handleLogin}
                  loading={loading}
                  variant="primary"
                  className="shadow-xl shadow-primary/40"
                />

                <View className="flex-row justify-center mt-8 items-center gap-1">
                  <Text className="text-muted-foreground font-medium">
                    <FormattedMessage id="auth.login.noAccount" />
                  </Text>
                  <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                      <Text className="text-primary font-bold text-base">
                        <FormattedMessage id="auth.login.register" />
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
