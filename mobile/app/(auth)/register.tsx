import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useIntl } from "react-intl";
import { StatusBar } from "expo-status-bar";
import { User, Mail, Lock, Eye, EyeOff, ChevronLeft, RefreshCw } from "lucide-react-native";
import { VerificationModal } from "../../components/VerificationModal";
import { SuccessModal } from "../../components/SuccessModal";
import { PasswordStrengthIndicator } from "../../components/PasswordStrengthIndicator";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; }>({});
  
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
  
  const { register, login } = useAuth();
  const router = useRouter();
  const intl = useIntl();

  const handleRegister = async () => {
    const newErrors: { fullName?: string; email?: string; password?: string; } = {};
    if (!fullName) newErrors.fullName = intl.formatMessage({ id: 'auth.error.required' });
    if (!email) newErrors.email = intl.formatMessage({ id: 'auth.error.required' });
    if (!password) newErrors.password = intl.formatMessage({ id: 'auth.error.required' });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // HapticService.error() would be good here if imported, likely need to import it
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      // Register (backend sends email code inside)
      await register({ 
        fullName, 
        email, 
        username: email, 
        password 
      });

      // Show Verification Modal
      setShowVerification(true);
    } catch (error: any) {
      setStatusModal({
        visible: true,
        type: 'error',
        title: intl.formatMessage({ id: 'auth.error.registrationFailed' }),
        message: error?.response?.data?.message || intl.formatMessage({ id: 'auth.error.registrationFailed' }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
     setShowVerification(false);
     
     // Attempt auto-login or redirect
     setLoading(true);
     try {
       await login({ username: email, password });
       router.replace("/(tabs)");
     } catch (err) {
        // Fallback if login fails but verification worked
        router.replace("/(auth)/login");
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
                  {intl.formatMessage({ id: 'auth.register.title' })}
                </Text>
                <Text className="text-muted-foreground text-center text-sm">
                  {intl.formatMessage({ id: 'auth.register.subtitle' })}
                </Text>
              </View>

              {/* Main Card */}
              <View className="bg-card border border-border rounded-[32px] p-6 shadow-2xl mb-8">
                <View className="space-y-4">
                  <Input
                    label={intl.formatMessage({ id: 'auth.register.fullName.label' })}
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    placeholder={intl.formatMessage({ id: 'auth.register.fullName.placeholder' })}
                    autoCapitalize="words"
                    icon={<User size={18} color="#64748b" />}
                    error={errors.fullName}
                  />
                  <Input
                    label={intl.formatMessage({ id: 'auth.register.email.label' })}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (text.length > 0 && !emailRegex.test(text)) {
                         setErrors(prev => ({ ...prev, email: intl.formatMessage({ id: 'validation.email.invalid' }) }));
                      } else {
                         setErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder={intl.formatMessage({ id: 'auth.login.email.placeholder' })}
                    autoCapitalize="none"
                    icon={<Mail size={18} color="#64748b" />}
                    error={errors.email}
                  />
                  <Input
                    label={intl.formatMessage({ id: 'auth.register.password.label' })}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    placeholder={intl.formatMessage({ id: 'auth.login.password.placeholder' })}
                    secureTextEntry={!showPassword}
                    icon={<Lock size={18} color="#64748b" />}
                    error={errors.password}
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
                  {password.length > 0 && <PasswordStrengthIndicator password={password} />}
                </View>

                <Button
                  title={intl.formatMessage({ id: 'auth.register.button' })}
                  onPress={handleRegister}
                  loading={loading}
                  variant="primary"
                  className="mt-6 mb-4 h-14 rounded-2xl"
                />

                <View className="flex-row items-center mb-6 mt-4 gap-4 opacity-50">
                  <View className="flex-1 h-[1px] bg-border" />
                  <Text className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">{intl.formatMessage({ id: 'auth.login.orConnect' })}</Text>
                  <View className="flex-1 h-[1px] bg-border" />
                </View>

                <View className="flex-row gap-4 mb-2">
                   {/* Google Button */}
                  <TouchableOpacity className="flex-1 bg-white h-12 rounded-xl flex-row items-center justify-center gap-2 border border-border/10">
                    <Text className="text-black font-bold text-sm">{intl.formatMessage({ id: 'auth.login.google' })}</Text>
                  </TouchableOpacity>
                  
                  {/* Apple Button */}
                  <TouchableOpacity className="flex-1 bg-[#3f3f46] h-12 rounded-xl flex-row items-center justify-center gap-2">
                    <Text className="text-white font-bold text-sm">{intl.formatMessage({ id: 'auth.login.apple' })}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View className="flex-row justify-center mb-6 gap-1">
                <Text className="text-muted-foreground font-medium text-sm">
                  {intl.formatMessage({ id: 'auth.register.hasAccount' })}
                </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-[#6366f1] font-bold text-sm">
                      {intl.formatMessage({ id: 'auth.register.login' })}
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
