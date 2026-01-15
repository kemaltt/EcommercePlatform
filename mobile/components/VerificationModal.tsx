import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Button } from './ui/Button';
import { X, Lock } from 'lucide-react-native';
import { api } from '../lib/api';
import { useAuth } from '../hooks/use-auth';
import { SuccessModal } from './SuccessModal';

interface VerificationModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function VerificationModal({ visible, email, onClose, onSuccess }: VerificationModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { login } = useAuth(); // We might need this to refetch user or auto-login if manual

  const handleVerify = async () => {
    if (!code || code.length < 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      // Direct API call
      await api.post('/auth/verify-email-code', { email, code });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Verification error:", error);
      const msg = error.response?.data?.message || "Failed to verify email.";
      Alert.alert("Verification Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/resend-verification-code', { email });
      Alert.alert("Sent", "A new verification code has been sent to your email.");
    } catch (error: any) {
      console.error("Resend error:", error);
      const msg = error.response?.data?.message || "Failed to resend code.";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      className="flex-1 justify-center items-center"
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-card w-full rounded-3xl p-6 border border-border shadow-2xl">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-foreground">Verify Email</Text>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
               <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
              <Lock size={32} color="#6366f1" />
            </View>
            <Text className="text-foreground text-center mb-2 font-medium">
               Enter Verification Code
            </Text>
            <Text className="text-muted-foreground text-center text-sm">
               We sent a 6-digit code to
            </Text>
            <Text className="text-primary font-bold text-center mt-1">
               {email}
            </Text>
          </View>

          <View className="mb-6">
             <TextInput
               value={code}
               onChangeText={setCode}
               placeholder="000000"
               placeholderTextColor="#475569"
               keyboardType="number-pad"
               maxLength={6}
               textAlign="center"
               className="bg-background border border-border rounded-2xl p-4 text-2xl font-bold text-foreground tracking-[10px]"
             />
          </View>

          <Button
            title={isLoading ? "Verifying..." : "Verify Code"}
            onPress={handleVerify}
            disabled={isLoading}
            variant="primary"
            className="w-full rounded-xl mb-4"
          />

          <TouchableOpacity 
             onPress={handleResend}
             disabled={isLoading}
             className="items-center py-2"
          >
             <Text className="text-primary font-bold">Resend Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SuccessModal 
        visible={showSuccessModal}
        title="Verified!"
        message="Your email has been successfully verified. You can now access all features."
        onClose={() => {
          setShowSuccessModal(false);
          onSuccess();
        }}
      />
    </Modal>
  );
}
