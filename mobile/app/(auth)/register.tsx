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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
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
    if (!fullName || !email || !password || !confirmPassword) {
      setStatusModal({
        visible: true,
        type: 'error',
        title: intl.formatMessage({ id: 'auth.error.input' }),
        message: intl.formatMessage({ id: 'auth.error.fillAll' }),
      });
      return;
    }

    if (password !== confirmPassword) {
       setStatusModal({
         visible: true,
         type: 'error',
         title: intl.formatMessage({ id: 'auth.error.input' }),
         message: intl.formatMessage({ id: 'auth.error.passwordMismatch' }),
       });
       return;
    }

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
                    onChangeText={setFullName}
                    placeholder={intl.formatMessage({ id: 'auth.register.fullName.placeholder' })}
                    autoCapitalize="words"
                    icon={<User size={18} color="#64748b" />}
                  />
                  <Input
                    label={intl.formatMessage({ id: 'auth.register.email.label' })}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={intl.formatMessage({ id: 'auth.login.email.placeholder' })}
                    autoCapitalize="none"
                    icon={<Mail size={18} color="#64748b" />}
                  />
                  <Input
                    label={intl.formatMessage({ id: 'auth.register.password.label' })}
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
                  <Input
                    label={intl.formatMessage({ id: 'auth.register.confirmPassword.label' })}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={intl.formatMessage({ id: 'auth.login.password.placeholder' })}
                    secureTextEntry
                    icon={<RefreshCw size={18} color="#64748b" />}
                  />
                </View>

                <Button
                  title={intl.formatMessage({ id: 'auth.register.button' })}
                  onPress={handleRegister}
                  loading={loading}
                  variant="primary"
                  className="mt-8 mb-4 h-14 rounded-2xl"
                />
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
