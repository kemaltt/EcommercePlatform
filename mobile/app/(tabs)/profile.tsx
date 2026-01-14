import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, Platform } from "react-native";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "../../components/ui/Button";
import { 
  User, 
  Settings, 
  LogOut, 
  Package, 
  CreditCard, 
  ChevronRight, 
  ShieldCheck, 
  Languages,
  Moon,
  HelpCircle,
  Shield,
  Edit2,
  Trash2,
  ChevronLeft
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";
import { useI18n } from "../../contexts/i18n-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import React from 'react';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const intl = useIntl();
  const { locale, setLocale } = useI18n();
  const [isDarkMode, setIsDarkMode] = useState(true); // Mock state for now

  // --- Actions ---
  const handleLogout = () => {
    Alert.alert(
      intl.formatMessage({ id: "profile.signOut" }),
      "Are you sure you want to logout?",
      [
        { text: intl.formatMessage({ id: "common.cancel" }), style: "cancel" },
        {
          text: intl.formatMessage({ id: "profile.signOut" }),
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "tr" : "en");
  };

  // --- Loading / No User State ---
  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-6">
        <Text className="text-xl font-bold mb-4 text-foreground">
          <FormattedMessage id="profile.loginRequired" />
        </Text>
        <Button 
          title={intl.formatMessage({ id: "auth.register.login" })} 
          onPress={() => router.push("/(auth)/login")} 
        />
      </View>
    );
  }

  // --- Components ---
  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 mt-6 ml-1">
      {title}
    </Text>
  );

  const MenuItem = ({ icon, label, subLabel, onPress, showToggle, isToggled, isDestructive = false }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={showToggle}
      className={`flex-row items-center justify-between p-4 bg-card mb-[1px] ${
        // Add rounded corners for first/last items if we grouped them, 
        // but for now simplistic approach similar to design
        "border-b border-border/10 last:border-b-0"
      }`}
    >
      <View className="flex-row items-center flex-1">
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
          isDestructive ? 'bg-red-500/10' : 'bg-secondary/30'
        }`}>
          {icon}
        </View>
        <View>
           <Text className={`text-base font-semibold ${isDestructive ? 'text-red-500' : 'text-foreground'}`}>
             {label}
           </Text>
           {subLabel && (
             <Text className="text-xs text-muted-foreground mt-0.5">{subLabel}</Text>
           )}
        </View>
      </View>
      
      {showToggle ? (
        <Switch 
          value={isToggled} 
          onValueChange={onPress}
          trackColor={{ false: "#3f3f46", true: "#6366f1" }}
          thumbColor={Platform.OS === 'ios' ? '#fff' : isToggled ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <ChevronRight size={20} color="#52525b" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
           <TouchableOpacity 
             className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
             onPress={() => router.back()}
           >
             <ChevronLeft size={20} color="white" />
           </TouchableOpacity>
           
           <Text className="text-lg font-bold text-white">Profile</Text>
           
           <TouchableOpacity 
             className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
             onPress={handleLogout}
           >
             <LogOut size={18} color="white" />
           </TouchableOpacity>
        </View>
        
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          {/* Avatar Section */}
          <View className="items-center mt-4 mb-8">
            <View className="relative">
              <View className="w-28 h-28 rounded-full bg-slate-800 items-center justify-center border-4 border-slate-800 shadow-xl">
                 <User size={48} color="#94a3b8" />
              </View>
              <TouchableOpacity className="absolute bottom-0 right-0 bg-[#fbbf24] w-8 h-8 rounded-full items-center justify-center border-2 border-slate-900">
                 <Edit2 size={14} color="#1e293b" />
              </TouchableOpacity>
            </View>
            <Text className="text-xl font-bold text-white mt-4">{user.fullName}</Text>
            <Text className="text-slate-400 text-sm mt-1">{user.email}</Text>
          </View>

          {/* GROUPS */}
          
          {/* Account Settings */}
          <SectionHeader title="Account Settings" />
          <View className="bg-slate-800 rounded-2xl overflow-hidden">
             <MenuItem 
                icon={<User size={18} color="#6366f1" />} 
                label="Profile Picture" 
                onPress={() => {}}
             />
             <MenuItem 
                icon={<User size={18} color="#6366f1" />} // Using user icon for email based on design, typically mail icon
                label="Email Address" 
                subLabel={user.email}
                onPress={() => {}}
             />
             <MenuItem 
                icon={<Lock size={18} color="#6366f1" />} // Assuming Lock icon
                label="Change Password" 
                onPress={() => {}}
             />
          </View>

          {/* Preferences */}
          <SectionHeader title="Preferences" />
          <View className="bg-slate-800 rounded-2xl overflow-hidden">
             <MenuItem 
                icon={<Languages size={18} color="#fbbf24" />} 
                label="Language" 
                subLabel={locale === 'en' ? 'English (US)' : 'Türkçe (TR)'}
                onPress={toggleLanguage}
             />
             <MenuItem 
                icon={<Moon size={18} color="#fbbf24" />} 
                label="Dark Mode" 
                showToggle
                isToggled={isDarkMode}
                onPress={() => setIsDarkMode(!isDarkMode)}
             />
          </View>

          {/* Support */}
          <SectionHeader title="Support" />
          <View className="bg-slate-800 rounded-2xl overflow-hidden">
             <MenuItem 
                icon={<HelpCircle size={18} color="#e2e8f0" />} 
                label="Help Center" 
                onPress={() => {}}
             />
             <MenuItem 
                icon={<ShieldCheck size={18} color="#e2e8f0" />} 
                label="Privacy Policy" 
                onPress={() => {}}
             />
             
             {/* Admin Link if Admin */}
             {user.isAdmin && (
               <MenuItem 
                  icon={<Shield size={18} color="#e2e8f0" />} 
                  label="Admin Panel" 
                  onPress={() => router.push("/admin")}
               />
             )}
          </View>
          
          {/* Delete Account */}
          <TouchableOpacity 
            className="mt-8 bg-slate-800/50 border border-slate-800 rounded-2xl py-4 flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
          >
             <Trash2 size={18} color="#ef4444" />
             <Text className="text-red-500 font-bold">Delete Account</Text>
          </TouchableOpacity>
          
          < View className="h-6" />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Quick component for locking icon above since it wasn't imported initially
import { Lock } from "lucide-react-native";
