import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, Platform, Image, ActivityIndicator } from "react-native";
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
  Trophy,
  MapPin
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";
import { useI18n } from "../../contexts/i18n-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React, { useState } from 'react';

import { useTheme } from "../../contexts/theme-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const intl = useIntl();
  const { locale, setLocale } = useI18n();
  const { isDark } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  // --- Actions ---
  const handleLogout = async () => {
    if (loggingOut) return;
    
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      setLoggingOut(false);
      console.error("Logout failed:", error);
      Alert.alert(
        intl.formatMessage({ id: 'common.error' }),
        intl.formatMessage({ id: 'profile.logout.error' })
      );
    }
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
      className="bg-card rounded-[28px] p-5 mb-4 aspect-[1.1] justify-between border border-border"
    >
      <View className="w-10 h-10 rounded-2xl bg-secondary items-center justify-center">
        {icon}
      </View>
      <View>
         <Text className="text-foreground text-lg font-bold leading-6">
           {label}
         </Text>
         {subLabel && (
           <Text className="text-muted-foreground text-xs mt-1" numberOfLines={1}>
             {subLabel}
           </Text>
         )}
      </View>
    </TouchableOpacity>
  );

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
           
           <Text className="text-lg font-bold text-foreground">{intl.formatMessage({ id: 'profile.title' })}</Text>
           
           <TouchableOpacity 
             className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
             onPress={handleLogout}
             disabled={loggingOut}
           >
             {loggingOut ? (
               <ActivityIndicator size="small" color="#ef4444" />
             ) : (
               <LogOut size={18} color={isDark ? "white" : "black"} />
             )}
           </TouchableOpacity>
        </View>
        
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          {/* Avatar Section */}
          <View className="items-center mt-4 mb-8">
            <View className="relative">
              <View className="w-28 h-28 rounded-full bg-card items-center justify-center border-4 border-card shadow-xl overflow-hidden">
                 {user.avatarUrl ? (
                   <Image 
                     source={{ uri: user.avatarUrl }} 
                     className="w-full h-full"
                     resizeMode="cover"
                   />
                 ) : (
                   <User size={48} color={isDark ? "#94a3b8" : "#64748b"} />
                 )}
              </View>
                <TouchableOpacity 
                  className="absolute bottom-0 right-0 bg-[#fbbf24] w-8 h-8 rounded-full items-center justify-center border-2 border-slate-900"
                  onPress={() => router.push("/edit-profile" as any)}
                >
                   <Edit2 size={14} color="#1e293b" />
                </TouchableOpacity>
            </View>
            <Text className="text-xl font-bold text-foreground mt-4">{user.fullName}</Text>
            <Text className="text-muted-foreground text-sm mt-1">@{user.username}</Text>
            <Text className="text-muted-foreground text-sm">{user.email}</Text>

            {/* Default Address Summary */}
            {user.defaultAddress && (
              <View className="bg-card/50 border border-border/50 rounded-2xl p-4 mt-6 w-full flex-row items-center gap-3">
                <View className="bg-primary/10 p-2 rounded-xl">
                  <MapPin size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
                    {intl.formatMessage({ id: 'address.type.delivery' })}
                  </Text>
                  <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                    {user.defaultAddress.addressLine1}
                    {user.defaultAddress.addressLine2 ? `, ${user.defaultAddress.addressLine2}` : ''}, {user.defaultAddress.city}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* GRID MENU */}
          <View className="flex-row flex-wrap justify-between mt-4">
             <GridMenuItem 
                icon={<MapPin size={22} color={isDark ? "white" : "black"} />} 
                label={intl.formatMessage({ id: 'profile.myAddresses' })} 
                subLabel={intl.formatMessage({ id: 'profile.myAddresses.sub', defaultMessage: 'Manage your addresses' })}
                onPress={() => router.push("/addresses" as any)}
             />
             <GridMenuItem 
                icon={<User size={22} color={isDark ? "white" : "black"} />} 
                label={intl.formatMessage({ id: 'profile.myProfile' })} 
                subLabel={intl.formatMessage({ id: 'profile.myProfile.sub' })}
                onPress={() => router.push("/edit-profile" as any)}
             />
             <GridMenuItem 
                icon={<Lock size={22} color={isDark ? "white" : "black"} />} 
                label={intl.formatMessage({ id: 'profile.account' })} 
                subLabel={intl.formatMessage({ id: 'profile.account.sub' })}
                onPress={() => router.push("/account")}
             />
             <GridMenuItem 
                icon={<Settings size={22} color={isDark ? "white" : "black"} />} 
                label={intl.formatMessage({ id: 'profile.settings' })} 
                subLabel={intl.formatMessage({ id: 'profile.settings.sub' })}
                onPress={() => router.push("/settings")}
             />
             <GridMenuItem 
                icon={<Trophy size={22} color={isDark ? "white" : "black"} />} 
                label={intl.formatMessage({ id: 'profile.achievements' })} 
                subLabel={intl.formatMessage({ id: 'profile.achievements.sub' })}
                onPress={() => {}}
             />
             
             {user.isAdmin && (
               <GridMenuItem 
                  icon={<ShieldCheck size={22} color="#fbbf24" />} 
                  label={intl.formatMessage({ id: 'profile.adminDashboard' })} 
                  subLabel={intl.formatMessage({ id: 'profile.adminDashboard.sub' })}
                  onPress={() => router.push("/admin")}
               />
             )}
          </View>
          
          <TouchableOpacity 
            className="mt-4 bg-card border border-border rounded-2xl py-4 flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={loggingOut}
          >
             {loggingOut ? (
               <ActivityIndicator size="small" color="#ef4444" />
             ) : (
               <>
                 <LogOut size={18} color="#ef4444" />
                 <Text className="text-red-500 font-bold">{intl.formatMessage({ id: 'profile.signOut' })}</Text>
               </>
             )}
          </TouchableOpacity>
          
          < View className="h-6" />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Quick component for locking icon above since it wasn't imported initially
// End of ProfileScreen
