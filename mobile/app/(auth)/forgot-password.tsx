import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useIntl } from "react-intl";
import { ChevronLeft, Mail, KeyRound, Lock, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react-native";
import { useTheme } from "../../contexts/theme-context";
import { HapticService } from "../../services/haptic";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = 'EMAIL' | 'CODE' | 'PASSWORD' | 'SUCCESS';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { forgotPassword, verifyResetCode, resetPassword } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const intl = useIntl();

  const handleSendCode = async () => {
    if (!email) {
      setError(intl.formatMessage({ id: 'auth.error.fillAll' }));
      HapticService.error();
      return;
    }

    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      HapticService.success();
      setStep('CODE');
    } catch (err: any) {
      HapticService.error();
      setError(err?.response?.data?.message || intl.formatMessage({ id: 'common.error' }));
    } finally {
      setLoading(false);
    }
  };

  const verifyCodeDirectly = async (inputCode: string) => {
    if (inputCode.length !== 6) return;
    
    setLoading(true);
    setError("");
    try {
      await verifyResetCode(inputCode);
      HapticService.success();
      setStep('PASSWORD');
    } catch (err: any) {
      HapticService.error();
      setError(intl.formatMessage({ id: 'forgotPassword.invalidCode' }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError(intl.formatMessage({ id: 'forgotPassword.invalidCode' }));
      HapticService.error();
      return;
    }

    setLoading(true);
    setError("");
    try {
      await verifyResetCode(code);
      HapticService.success();
      setStep('PASSWORD');
    } catch (err: any) {
      HapticService.error();
      setError(intl.formatMessage({ id: 'forgotPassword.invalidCode' }));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError(intl.formatMessage({ id: 'auth.error.fillAll' }));
      HapticService.error();
      return;
    }

    if (password !== confirmPassword) {
      setError(intl.formatMessage({ id: 'forgotPassword.passwordMismatch' }));
      HapticService.error();
      return;
    }

    setLoading(true);
    setError("");
    try {
      await resetPassword(code, password);
      HapticService.success();
      setStep('SUCCESS');
    } catch (err: any) {
      HapticService.error();
      setError(err?.response?.data?.message || intl.formatMessage({ id: 'common.error' }));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'EMAIL':
        return (
          <View className="space-y-8">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
                <Mail size={40} color={isDark ? "#818cf8" : "#4f46e5"} />
              </View>
              <Text className="text-3xl font-extrabold text-foreground text-center mb-3">
                {intl.formatMessage({ id: 'forgotPassword.title' })}
              </Text>
              <Text className="text-muted-foreground text-center text-base px-4 leading-6">
                {intl.formatMessage({ id: 'forgotPassword.subtitle' })}
              </Text>
            </View>

            <View className="space-y-4">
              <Input
                label={intl.formatMessage({ id: 'forgotPassword.emailLabel' })}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                icon={<Mail size={20} color={isDark ? "#9ca3af" : "#6b7280"} />}
                error={error}
                className="bg-card/50"
              />

              <Button
                title={intl.formatMessage({ id: 'forgotPassword.sendCode' })}
                onPress={handleSendCode}
                loading={loading}
                variant="primary"
                className="h-14 rounded-2xl shadow-xl shadow-primary/20"
                icon={<ArrowRight size={20} color="white" />}
              />
            </View>
          </View>
        );

      case 'CODE':
        return (
          <View className="space-y-8">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
                <ShieldCheck size={40} color={isDark ? "#818cf8" : "#4f46e5"} />
              </View>
              <Text className="text-3xl font-extrabold text-foreground text-center mb-3">
                {intl.formatMessage({ id: 'forgotPassword.codeLabel' })}
              </Text>
              <Text className="text-muted-foreground text-center text-base px-4">
                {intl.formatMessage({ id: 'forgotPassword.codeSent' })}
              </Text>
              <Text className="text-primary font-bold mt-2 text-lg">{email}</Text>
            </View>

            <View className="space-y-6">
              <Input
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  if (text.length === 6) {
                    verifyCodeDirectly(text);
                  }
                }}
                maxLength={6}
                icon={<KeyRound size={20} color={isDark ? "#9ca3af" : "#6b7280"} />}
                error={error}
                className="text-center text-3xl tracking-[10px] font-mono h-20 bg-card/50"
                style={{ fontSize: 32 }}
              />

              <Button
                title={intl.formatMessage({ id: 'forgotPassword.verifyCode' })}
                onPress={handleVerifyCode}
                loading={loading}
                variant="primary"
                className="h-14 rounded-2xl shadow-xl shadow-primary/20"
              />
              
              <TouchableOpacity onPress={() => setStep('EMAIL')} className="items-center py-2">
                <Text className="text-muted-foreground font-medium">
                  {intl.formatMessage({ id: 'common.cancel' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'PASSWORD':
        return (
          <View className="space-y-8">
            <View className="items-center mb-4">
               <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
                <Lock size={40} color={isDark ? "#818cf8" : "#4f46e5"} />
              </View>
              <Text className="text-3xl font-extrabold text-foreground text-center mb-3">
                {intl.formatMessage({ id: 'forgotPassword.newPassword' })}
              </Text>
              <Text className="text-muted-foreground text-center text-base px-4">
                {intl.formatMessage({ id: 'auth.register.subtitle' })}
              </Text>
            </View>

            <View className="space-y-4">
              <Input
                label={intl.formatMessage({ id: 'forgotPassword.newPassword' })}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon={<Lock size={20} color={isDark ? "#9ca3af" : "#6b7280"} />}
                className="bg-card/50"
              />

              <Input
                label={intl.formatMessage({ id: 'forgotPassword.confirmPassword' })}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                icon={<Lock size={20} color={isDark ? "#9ca3af" : "#6b7280"} />}
                error={error}
                className="bg-card/50"
              />

              <Button
                title={intl.formatMessage({ id: 'forgotPassword.resetPassword' })}
                onPress={handleResetPassword}
                loading={loading}
                variant="primary"
                className="h-14 rounded-2xl shadow-xl shadow-primary/20 mt-4"
              />
            </View>
          </View>
        );

      case 'SUCCESS':
        return (
          <View className="items-center justify-center py-10 space-y-8">
            <View className="w-24 h-24 bg-green-500/10 rounded-full items-center justify-center mb-4 ring-4 ring-green-500/20">
              <CheckCircle2 size={48} color="#22c55e" />
            </View>
            
            <View className="space-y-2 text-center items-center">
              <Text className="text-3xl font-extrabold text-foreground text-center">
                {intl.formatMessage({ id: 'common.success' })}
              </Text>
              <Text className="text-muted-foreground text-center text-lg max-w-[280px]">
                {intl.formatMessage({ id: 'forgotPassword.success' })}
              </Text>
            </View>
            
            <Button
              title={intl.formatMessage({ id: 'forgotPassword.backToLogin' })}
              onPress={() => router.replace("/(auth)/login")}
              className="w-full mt-8 h-14 rounded-2xl"
              variant="outline"
            />
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-row items-center px-6 py-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-secondary/80 border border-border"
            >
              <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            className="px-8"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center pb-20">
              {renderStep()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
