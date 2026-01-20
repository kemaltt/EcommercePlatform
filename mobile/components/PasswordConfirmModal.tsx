import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Lock, X, ShieldCheck } from "lucide-react-native";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface PasswordConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
}

export function PasswordConfirmModal({
  visible,
  onClose,
  onConfirm,
  loading = false,
  title = "Confirm Identity",
  subtitle = "Please enter your current password to continue.",
  confirmLabel = "Confirm",
}: PasswordConfirmModalProps) {
  const [password, setPassword] = useState("");

  const handleConfirm = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
    await onConfirm(password);
    setPassword("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center px-6">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="bg-card rounded-[32px] p-6 border border-border/50 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                <ShieldCheck size={24} color="#6366f1" />
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 items-center justify-center"
              >
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text className="text-xl font-bold text-foreground mb-2">
              {title}
            </Text>
            <Text className="text-muted-foreground text-sm mb-6 leading-5">
              {subtitle}
            </Text>

            <Input
              label="CURRENT PASSWORD"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              icon={<Lock size={18} color="#64748b" />}
              className="mb-6"
            />

            <Button
              title={confirmLabel}
              onPress={handleConfirm}
              loading={loading}
              className="rounded-2xl h-14"
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
