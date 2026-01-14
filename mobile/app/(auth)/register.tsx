import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { FormattedMessage, useIntl } from "react-intl";
import { StatusBar } from "expo-status-bar";
import { User, Mail, Lock, Eye, EyeOff, Check, ChevronLeft, RefreshCw } from "lucide-react-native";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();
  const intl = useIntl();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        "Please fill in all fields"
      );
      return;
    }

    if (password !== confirmPassword) {
       Alert.alert("Error", "Passwords do not match");
       return;
    }

    setLoading(true);
    try {
      // Backend expects username, so we use email or generate one from generic logic if needed
      // Ideally backend schema should support separate name. 
      // For now mapping fullName -> username constraint might be tight, but let's try mapping:
      // username = email (since they login with email now) OR separate field.
      // Based on previous files, 'username' is required. Let's use email as username for simplicity or let user pick?
      // The design has "Full Name" and "Email". No explicit "Username".
      // Strategy: Use email as username mostly, or slugify fullname. 
      // Safest: Use email as username since login uses email now.
      
      await register({ 
        fullName, 
        email, 
        username: email, // Mapping email to username for backend compatibility if needed, or let's assume backend handles unique constraint 
        password 
      });

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
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
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
            <View className="flex-1 px-6">
              
               {/* Top Navigation */}
              <View className="mt-2 mb-4">
                 <TouchableOpacity 
                   onPress={() => router.back()}
                   className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
                 >
                    <ChevronLeft size={20} color="#94a3b8" />
                 </TouchableOpacity>
              </View>

              {/* Header */}
              <View className="items-center mb-8">
                <Text className="text-3xl font-extrabold text-foreground mb-2 text-center">
                  Create Account
                </Text>
                <Text className="text-muted-foreground text-center text-sm">
                  Join our exclusive community
                </Text>
              </View>

              {/* Main Card */}
              <View className="bg-card border border-border rounded-[32px] p-6 shadow-2xl mb-8">
                <View className="space-y-4">
                  <Input
                    label="FULL NAME"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="John Doe"
                    autoCapitalize="words"
                    icon={<User size={18} color="#64748b" />}
                  />
                  <Input
                    label="EMAIL ADDRESS"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="hello@example.com"
                    autoCapitalize="none"
                    icon={<Mail size={18} color="#64748b" />}
                  />
                  <Input
                    label="PASSWORD"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    icon={<Lock size={18} color="#64748b" />}
                    rightIcon={
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff size={18} color="#64748b" />
                        ) : (
                          <Eye size={18} color="#64748b" />
                        )}
                      </TouchableOpacity>
                    }
                  />
                  <Input
                    label="CONFIRM PASSWORD"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    icon={<RefreshCw size={18} color="#64748b" />}
                  />
                </View>

                <Button
                  title="Create Account"
                  onPress={handleRegister}
                  loading={loading}
                  variant="primary"
                  className="mt-8 mb-4 h-14 rounded-2xl"
                />
              </View>

              {/* Footer */}
              <View className="flex-row justify-center mb-6 gap-1">
                <Text className="text-muted-foreground font-medium text-sm">
                  Already have an account?
                </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-[#6366f1] font-bold text-sm">
                      Login
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
