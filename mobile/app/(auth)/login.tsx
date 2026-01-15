import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useIntl } from "react-intl";
import { StatusBar } from "expo-status-bar";
import { ShoppingBag, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, ScanFace } from "lucide-react-native";
import { VerificationModal } from "../../components/VerificationModal";
import { SuccessModal } from "../../components/SuccessModal";
import { BiometricService } from "../../lib/biometric";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { useTheme } from "../../contexts/theme-context";
import { HapticService } from "../../services/haptic";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const [biometricLoading, setBiometricLoading] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [statusModal, setStatusModal] = useState<{ 
    visible: boolean; 
    type: 'success' | 'error'; 
    title: string; 
    message: string; 
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const { login } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const intl = useIntl();

  useEffect(() => {
    (async () => {
      const enabled = await BiometricService.isEnabled();
      setIsBiometricEnabled(enabled);
      
      // // Auto-trigger Face ID if enabled
      // if (enabled) {
      //   // Small delay to let UI render first
      //   setTimeout(() => {
      //     handleBiometricLogin();
      //   }, 500);
      // }
    })();
  }, []);

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const credentials = await BiometricService.getCredentials();
      if (!credentials) {
        setStatusModal({
          visible: true,
          type: 'error',
          title: intl.formatMessage({ id: 'auth.error.input' }),
          message: intl.formatMessage({ id: 'auth.error.biometricNotFound' }),
        });
        return;
      }

      const success = await BiometricService.authenticate(intl.formatMessage({ id: 'auth.login.biometric' }));
      if (success) {
        await login({ username: credentials.username, password: credentials.password });
        HapticService.success(); // Success haptic
        router.replace("/(tabs)");
      } else {
        HapticService.error(); // Error haptic on cancel/fail
      }
    } catch (error: any) {
      HapticService.error(); // Error haptic
      const message = error?.response?.data?.message || intl.formatMessage({ id: 'auth.error.loginFailed' });
      setStatusModal({
        visible: true,
        type: 'error',
        title: intl.formatMessage({ id: 'auth.error.loginFailed' }),
        message: message,
      });
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setStatusModal({
        visible: true,
        type: 'error',
        title: intl.formatMessage({ id: 'auth.error.input' }),
        message: intl.formatMessage({ id: 'auth.error.fillAll' }),
      });
      return;
    }

    setLoading(true);
    try {
      await login({ username: email, password });
      HapticService.success(); // Success haptic
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Invalid credentials";
      
      if (error?.response?.status === 403 && message.includes("verify your email")) {
         // Show verification modal instead of alert
         setShowVerification(true);
      } else {
        HapticService.error(); // Error haptic
        setStatusModal({
          visible: true,
          type: 'error',
          title: intl.formatMessage({ id: 'common.error' }),
          message: message,
        });
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
      <StatusBar style={isDark ? "light" : "dark"} />
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
                  {intl.formatMessage({ id: 'auth.login.title' })}
                </Text>
                <Text className="text-muted-foreground text-center text-sm leading-5 max-w-[260px]">
                  {intl.formatMessage({ id: 'auth.login.subtitle' })}
                </Text>
              </View>

              {/* Main Card */}
              <View className="bg-card border border-border rounded-[32px] p-6 shadow-2xl">
                <View className="space-y-4">
                  <Input
                    label={intl.formatMessage({ id: 'auth.login.email.label' })}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={intl.formatMessage({ id: 'auth.login.email.placeholder' })}
                    autoCapitalize="none"
                    icon={<Mail size={18} color="#64748b" />}
                    className="mb-4"
                  />
                  <Input
                    label={intl.formatMessage({ id: 'auth.login.password.label' })}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={intl.formatMessage({ id: 'auth.login.password.placeholder' })}
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
                    {intl.formatMessage({ id: 'auth.login.forgot' })}
                  </Text>
                </TouchableOpacity>

                <View className="space-y-4">
                  <Button
                    title={intl.formatMessage({ id: 'auth.login.button' })}
                    onPress={handleLogin}
                    loading={loading}
                    variant="primary"
                    className="rounded-2xl h-14"
                    icon={<ArrowRight size={18} color="white" />}
                  />
                  
                  {(isBiometricEnabled || __DEV__) && (
                    <TouchableOpacity 
                      onPress={handleBiometricLogin}
                      disabled={loading || biometricLoading}
                      activeOpacity={0.7}
                      className="flex-row items-center justify-center py-3 bg-secondary/20 rounded-2xl border border-secondary/30"
                    >
                      {biometricLoading ? (
                        <ActivityIndicator size="small" color="#6366f1" />
                      ) : (
                        <>
                          <ScanFace size={20} color="#6366f1" className="mr-2" />
                          <Text className="text-primary font-semibold text-sm">{intl.formatMessage({ id: 'auth.login.biometric' })}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                <View className="flex-row items-center mb-6 mt-10 gap-4 opacity-50">
                  <View className="flex-1 h-[1px] bg-border" />
                  <Text className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">{intl.formatMessage({ id: 'auth.login.orConnect' })}</Text>
                  <View className="flex-1 h-[1px] bg-border" />
                </View>

                <View className="flex-row gap-4 mb-4">
                   {/* Google Button */}
                  <TouchableOpacity className="flex-1 bg-white h-12 rounded-xl flex-row items-center justify-center gap-2">
                    <Text className="text-black font-bold text-sm">{intl.formatMessage({ id: 'auth.login.google' })}</Text>
                  </TouchableOpacity>
                  
                  {/* Apple Button */}
                  <TouchableOpacity className="flex-1 bg-[#3f3f46] h-12 rounded-xl flex-row items-center justify-center gap-2">
                    <Text className="text-white font-bold text-sm">{intl.formatMessage({ id: 'auth.login.apple' })}</Text>
                  </TouchableOpacity>
                </View>

              </View>

              {/* Footer */}
              <View className="flex-row justify-center mt-8 mb-4 gap-1">
                <Text className="text-muted-foreground font-medium text-sm">
                  {intl.formatMessage({ id: 'auth.login.noAccount' })}
                </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text className="text-[#fbbf24] font-bold text-sm">
                      {intl.formatMessage({ id: 'auth.login.signUp' })}
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

      <SuccessModal 
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
