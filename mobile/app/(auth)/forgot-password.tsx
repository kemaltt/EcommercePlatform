import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useIntl } from "react-intl";
import { ChevronLeft, Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react-native";
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
          <View className="space-y-6">
            <View>
              <Text className="text-2xl font-bold text-foreground mb-2">
                {intl.formatMessage({ id: 'forgotPassword.title' })}
              </Text>
              <Text className="text-muted-foreground">
                {intl.formatMessage({ id: 'forgotPassword.subtitle' })}
              </Text>
            </View>

            <Input
              label={intl.formatMessage({ id: 'forgotPassword.emailLabel' })}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              icon={<Mail size={20} color={isDark ? "#9ca3af" : "#6b7280"} />}
              error={error}
            />

            <Button
              title={intl.formatMessage({ id: 'forgotPassword.sendCode' })}
              onPress={handleSendCode}
              loading={loading}
            />
          </View>
        );

      case 'CODE':
        return (
          <View className="space-y-6">
            <View>
              <Text className="text-2xl font-bold text-foreground mb-2">
                {intl.formatMessage({ id: 'forgotPassword.codeLabel' })}
              </Text>
              <Text className="text-muted-foreground">
                {intl.formatMessage({ id: 'forgotPassword.codeSent' })}: {email}
              </Text>
            </View>

            <Input
              label={intl.formatMessage({ id: 'forgotPassword.codeLabel' })}
              value={code}
              onChangeText={setCode}
              placeholder={intl.formatMessage({ id: 'forgotPassword.codePlaceholder' })}
              keyboardType="number-pad"
              maxLength={6}
              icon={<KeyRound size={20} color={isDark ? "#9ca3af" : "#6b7280"} />}
              error={error}
              className="text-center text-2xl tracking-widest font-mono"
            />

            <Button
              title={intl.formatMessage({ id: 'forgotPassword.verifyCode' })}
              onPress={handleVerifyCode}
              loading={loading}
            />
            
            <TouchableOpacity onPress={() => setStep('EMAIL')} className="items-center mt-4">
              <Text className="text-primary font-medium">
                {intl.formatMessage({ id: 'common.cancel' })}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'PASSWORD':
        return (
          <View className="space-y-6">
            <View>
              <Text className="text-2xl font-bold text-foreground mb-2">
                {intl.formatMessage({ id: 'forgotPassword.newPassword' })}
              </Text>
              <Text className="text-muted-foreground">
                {intl.formatMessage({ id: 'auth.register.subtitle' })}
              </Text>
            </View>

            <Input
              label={intl.formatMessage({ id: 'forgotPassword.newPassword' })}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={20} color={isDark ? "#9ca3af" : "#6b7280"} />}
            />

            <Input
              label={intl.formatMessage({ id: 'forgotPassword.confirmPassword' })}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon={<Lock size={20} color={isDark ? "#9ca3af" : "#6b7280"} />}
              error={error}
            />

            <Button
              title={intl.formatMessage({ id: 'forgotPassword.resetPassword' })}
              onPress={handleResetPassword}
              loading={loading}
            />
          </View>
        );

      case 'SUCCESS':
        return (
          <View className="items-center justify-center py-10 space-y-6">
            <View className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full items-center justify-center mb-4">
              <CheckCircle2 size={40} color="#22c55e" />
            </View>
            
            <Text className="text-2xl font-bold text-foreground text-center">
              {intl.formatMessage({ id: 'forgotPassword.success' })}
            </Text>
            
            <Button
              title={intl.formatMessage({ id: 'forgotPassword.backToLogin' })}
              onPress={() => router.replace("/(auth)/login")}
              className="w-full mt-8"
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center p-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-secondary/50"
          >
            <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          <View className="flex-1 justify-center pb-20">
            {renderStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
