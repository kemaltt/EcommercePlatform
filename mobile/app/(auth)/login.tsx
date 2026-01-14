import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useIntl } from "react-intl";
import { StatusBar } from "expo-status-bar";
import { ShoppingBag, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react-native";
import { VerificationModal } from "../../components/VerificationModal";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const intl = useIntl();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        intl.formatMessage({ id: "auth.login.subtitle" })
      );
      return;
    }

    setLoading(true);
    try {
      await login({ username: email, password });
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Invalid credentials";
      
      if (error?.response?.status === 403 && message.includes("verify your email")) {
         // Show verification modal instead of alert
         setShowVerification(true);
      } else {
        Alert.alert(
          intl.formatMessage({ id: "common.error" }),
          message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
     setShowVerification(false);
     // Retry login automatically
     handleLogin();
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
              <View className="mt-2 mb-6">
                 <TouchableOpacity 
                   onPress={() => router.back()}
                   className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
                 >
                    <ChevronLeft size={20} color="#94a3b8" />
                 </TouchableOpacity>
              </View>

              {/* Logo Area */}
              <View className="items-center mb-10">
                <View className="w-20 h-20 bg-card rounded-[24px] items-center justify-center mb-6 border border-border/50 shadow-sm">
                   <ShoppingBag size={40} color="#fbbf24" strokeWidth={2.5} />
                </View>
                <Text className="text-3xl font-extrabold text-foreground mb-2">
                  Welcome Back
                </Text>
                <Text className="text-muted-foreground text-center text-sm leading-5 max-w-[260px]">
                  Sign in to continue your curated shopping experience.
                </Text>
              </View>

              {/* Main Card */}
              <View className="bg-card border border-border rounded-[32px] p-6 shadow-2xl">
                <View className="space-y-4">
                  <Input
                    label="EMAIL ADDRESS"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    icon={<Mail size={18} color="#64748b" />}
                    className="mb-4"
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
                </View>

                <TouchableOpacity className="self-end mt-2 mb-6">
                  <Text className="text-[#fbbf24] font-semibold text-xs">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  variant="primary"
                  className="mb-8 rounded-2xl h-14"
                  icon={<ArrowRight size={18} color="white" />}
                />

                <View className="flex-row items-center mb-6 gap-4 opacity-50">
                  <View className="flex-1 h-[1px] bg-border" />
                  <Text className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">Or connect with</Text>
                  <View className="flex-1 h-[1px] bg-border" />
                </View>

                <View className="flex-row gap-4 mb-4">
                   {/* Google Button */}
                  <TouchableOpacity className="flex-1 bg-white h-12 rounded-xl flex-row items-center justify-center gap-2">
                    <Text className="text-black font-bold text-sm">Google</Text>
                  </TouchableOpacity>
                  
                  {/* Apple Button */}
                  <TouchableOpacity className="flex-1 bg-[#3f3f46] h-12 rounded-xl flex-row items-center justify-center gap-2">
                    <Text className="text-white font-bold text-sm">Apple</Text>
                  </TouchableOpacity>
                </View>

              </View>

              {/* Footer */}
              <View className="flex-row justify-center mt-8 mb-4 gap-1">
                <Text className="text-muted-foreground font-medium text-sm">
                  Don't have an account?
                </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text className="text-[#fbbf24] font-bold text-sm">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <VerificationModal 
         visible={showVerification} 
         email={email} 
         onClose={() => setShowVerification(false)}
         onSuccess={handleVerificationSuccess}
      />
    </View>
  );
}
