import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, Platform } from "react-native";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "../../components/ui/Button";
import { 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Edit2,
  ChevronLeft,
  Lock,
  Bell,
  Trophy
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

  const GridMenuItem = ({ icon, label, subLabel, onPress, isFullWidth = false }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      style={{ width: isFullWidth ? '100%' : '48%' }}
      className="bg-slate-800/80 rounded-[28px] p-5 mb-4 aspect-[1.1] justify-between border border-white/5"
    >
      <View className="w-10 h-10 rounded-2xl bg-slate-700/50 items-center justify-center">
        {icon}
      </View>
      <View>
         <Text className="text-white text-lg font-bold leading-6">
           {label}
         </Text>
         {subLabel && (
           <Text className="text-slate-400 text-xs mt-1" numberOfLines={1}>
             {subLabel}
           </Text>
         )}
      </View>
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

          {/* GRID MENU */}
          <View className="flex-row flex-wrap justify-between mt-4">
             <GridMenuItem 
                icon={<Bell size={22} color="white" />} 
                label="Mitteilungen" 
                subLabel="0 neu"
                onPress={() => {}}
             />
             <GridMenuItem 
                icon={<User size={22} color="white" />} 
                label="Profil" 
                subLabel="Name, Profilbild..."
                onPress={() => {}}
             />
             <GridMenuItem 
                icon={<Lock size={22} color="white" />} 
                label="Konto" 
                subLabel="Daten, Sicherheit, Plus..."
                onPress={() => {}}
             />
             <GridMenuItem 
                icon={<Settings size={22} color="white" />} 
                label="Einstellungen" 
                subLabel="Sprache, Design..."
                onPress={() => {}}
             />
             <GridMenuItem 
                icon={<Trophy size={22} color="white" />} 
                label="Erfolge" 
                subLabel="Abzeichen"
                onPress={() => {}}
             />
             
             {user.isAdmin && (
               <GridMenuItem 
                  icon={<ShieldCheck size={22} color="#fbbf24" />} 
                  label="Admin-Dashboard" 
                  subLabel="Benutzer & Statistiken..."
                  onPress={() => router.push("/admin")}
               />
             )}
          </View>
          
          <TouchableOpacity 
            className="mt-4 bg-slate-800/30 border border-slate-800 rounded-2xl py-4 flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
            onPress={handleLogout}
          >
             <LogOut size={18} color="#ef4444" />
             <Text className="text-red-500 font-bold">Sign Out</Text>
          </TouchableOpacity>
          
          < View className="h-6" />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Quick component for locking icon above since it wasn't imported initially
// End of ProfileScreen
