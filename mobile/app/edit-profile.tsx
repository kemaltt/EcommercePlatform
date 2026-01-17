import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ChevronLeft, User, Mail, AtSign } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React, { useState } from 'react';
import { useTheme } from "../contexts/theme-context";
import { api } from "../lib/api";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const intl = useIntl();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName || !username || !email) {
      Alert.alert(intl.formatMessage({ id: 'common.error' }), intl.formatMessage({ id: 'auth.error.required' }));
      return;
    }

    setLoading(true);
    try {
      await api.put("/user/profile", { fullName, username, email });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      Alert.alert(
        intl.formatMessage({ id: 'common.success' }), 
        intl.formatMessage({ id: 'profile.updateSuccess' }),
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error("Update profile error:", error);
      const message = error.response?.data?.message || intl.formatMessage({ id: 'profile.updateError' });
      Alert.alert(intl.formatMessage({ id: 'common.error' }), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
           <TouchableOpacity 
             className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
             onPress={() => router.back()}
           >
             <ChevronLeft size={20} color={isDark ? "white" : "black"} />
           </TouchableOpacity>
           
           <Text className="text-lg font-bold text-foreground">{intl.formatMessage({ id: 'profile.editProfile' })}</Text>
           
           <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="mt-8 bg-card rounded-3xl p-6 border border-border shadow-sm">
            <View className="mb-6">
              <Text className="text-sm font-bold text-muted-foreground mb-2 ml-1">
                {intl.formatMessage({ id: 'profile.fullName' })}
              </Text>
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder={intl.formatMessage({ id: 'profile.fullName' })}
                icon={<User size={20} color={isDark ? "#94a3b8" : "#64748b"} />}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-bold text-muted-foreground mb-2 ml-1">
                {intl.formatMessage({ id: 'profile.username' })}
              </Text>
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder={intl.formatMessage({ id: 'profile.username' })}
                icon={<AtSign size={20} color={isDark ? "#94a3b8" : "#64748b"} />}
                autoCapitalize="none"
              />
            </View>

            <View className="mb-8">
              <Text className="text-sm font-bold text-muted-foreground mb-2 ml-1">
                {intl.formatMessage({ id: 'profile.email' })}
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder={intl.formatMessage({ id: 'profile.email' })}
                icon={<Mail size={20} color={isDark ? "#94a3b8" : "#64748b"} />}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Button
              title={intl.formatMessage({ id: 'profile.saveChanges' })}
              onPress={handleSave}
              loading={loading}
              className="mt-2"
            />

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
