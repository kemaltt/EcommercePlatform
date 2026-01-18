import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  Lock,
  KeyRound,
  CheckCircle2,
  Send,
  RotateCcw,
} from "lucide-react-native";
import { useIntl } from "react-intl";

import { useTheme } from "../../contexts/theme-context";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { SuccessModal } from "../../components/SuccessModal";
import { PasswordStrengthIndicator } from "../../components/PasswordStrengthIndicator";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);

  // Verification form state
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    type: "success",
    title: "",
    message: "",
  });

  const showModal = (
    type: "success" | "error",
    title: string,
    message: string,
    onClose?: () => void,
  ) => {
    setModalConfig({ type, title, message, onClose });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalConfig.onClose) {
      modalConfig.onClose();
    }
  };

  const handleRequestCode = async () => {
    setLoading(true);
    try {
      await api.post("/auth/change-password-request");
      setStep("verify");
      showModal(
        "success",
        "Code Sent!",
        "A verification code has been sent to your email.",
      );
    } catch (error: any) {
      console.error("Failed to send code:", error);
      showModal(
        "error",
        "Error",
        error.response?.data?.message || "Failed to send verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code || !newPassword || !confirmPassword) {
      showModal("error", "Error", "Please fill in all fields.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showModal(
        "error",
        "Error",
        intl.formatMessage({ id: "validation.password.complexity" }),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal(
        "error",
        "Error",
        intl.formatMessage({ id: "auth.error.passwordMismatch" }),
      );
      return;
    }

    setLoading(true);
    try {
      // Reusing the reset-password endpoint since it takes token (code) and new password
      await api.post("/auth/reset-password", {
        token: code,
        password: newPassword,
      });

      showModal(
        "success",
        "Success",
        "Your password has been changed successfully.",
        () => router.back(),
      );
    } catch (error: any) {
      console.error("Failed to change password:", error);
      showModal(
        "error",
        "Error",
        error.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-border/10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
          >
            <ChevronLeft size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">
            {intl.formatMessage({ id: "account.changePassword" })}
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-6 pt-6"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {step === "request" ? (
              <View className="items-center mt-10">
                <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6">
                  <Lock size={48} color="#6366f1" />
                </View>

                <Text className="text-2xl font-bold text-foreground text-center mb-3">
                  Change Password
                </Text>

                <Text className="text-muted-foreground text-center mb-10 text-base leading-6 px-4">
                  For your security, we will send a 6-digit verification code to
                  your email address before you can change your password.
                </Text>

                <Button
                  title={loading ? "Sending..." : "Send Verification Code"}
                  onPress={handleRequestCode}
                  className="w-full"
                  disabled={loading}
                  icon={<Send size={18} color="white" />}
                />
              </View>
            ) : (
              <View>
                <View className="items-center mb-8">
                  <View className="w-16 h-16 rounded-full bg-green-500/10 items-center justify-center mb-4">
                    <CheckCircle2 size={32} color="#22c55e" />
                  </View>
                  <Text className="text-lg font-bold text-foreground text-center">
                    Code Sent!
                  </Text>
                  <Text className="text-muted-foreground text-center text-sm">
                    Please check your email and enter the code below.
                  </Text>
                </View>

                {/* Code Input */}
                <View className="mb-4">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">
                    Verification Code
                  </Text>
                  <View className="flex-row items-center bg-card rounded-2xl px-4 py-3 border border-border">
                    <KeyRound
                      size={20}
                      color={isDark ? "#94a3b8" : "#64748b"}
                    />
                    <TextInput
                      className="flex-1 ml-3 text-foreground text-base h-8"
                      placeholder="123456"
                      placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* New Password Input */}
                <View className="mb-4">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">
                    {intl.formatMessage({ id: "auth.register.password.label" })}
                  </Text>
                  <View className="flex-row items-center bg-card rounded-2xl px-4 py-3 border border-border">
                    <Lock size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                    <TextInput
                      className="flex-1 ml-3 text-foreground text-base h-8"
                      placeholder={intl.formatMessage({
                        id: "auth.login.password.placeholder",
                      })}
                      placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                  </View>
                  <PasswordStrengthIndicator password={newPassword} />
                </View>

                {/* Confirm Password Input */}
                <View className="mb-8">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">
                    {intl.formatMessage({
                      id: "auth.register.confirmPassword.label",
                    })}
                  </Text>
                  <View className="flex-row items-center bg-card rounded-2xl px-4 py-3 border border-border">
                    <Lock size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                    <TextInput
                      className="flex-1 ml-3 text-foreground text-base h-8"
                      placeholder={intl.formatMessage({
                        id: "auth.login.password.placeholder",
                      })}
                      placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <Button
                  title={loading ? "Changing Password..." : "Change Password"}
                  onPress={handleSubmit}
                  className="w-full mb-4"
                  disabled={loading}
                  icon={<RotateCcw size={18} color="white" />}
                />

                <TouchableOpacity
                  onPress={handleRequestCode}
                  disabled={loading}
                  className="items-center py-2"
                >
                  <Text className="text-primary font-medium">Resend Code</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <SuccessModal
          visible={modalVisible}
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
          onClose={handleModalClose}
        />
      </SafeAreaView>
    </View>
  );
}
