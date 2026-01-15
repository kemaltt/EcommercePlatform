import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Languages,
  Moon,
  Shield,
  Info,
  LifeBuoy,
  FileText,
  ScanFace,
  LayoutGrid
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useI18n } from "../../contexts/i18n-context";
import { FormattedMessage, useIntl } from "react-intl";
import * as LocalAuthentication from 'expo-local-authentication';

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const intl = useIntl();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricAvailable(compatible);
    })();
  }, []);

  const toggleFaceId = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable FaceID Login',
        fallbackLabel: 'Enter Password',
      });
      if (result.success) {
        setIsFaceIdEnabled(true);
      }
    } else {
      setIsFaceIdEnabled(false);
    }
  };

  const SettingItem = ({ 
    icon, 
    label, 
    subLabel, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange 
  }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4 border-b border-white/5"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 items-center justify-center mr-3">
          {icon}
        </View>
        <Text className="text-white text-[17px] font-medium">{label}</Text>
      </View>
      
      <View className="flex-row items-center">
        {subLabel && !showSwitch && (
          <Text className="text-slate-500 mr-2 text-sm">{subLabel}</Text>
        )}
        {showSwitch ? (
          <Switch 
            value={switchValue} 
            onValueChange={onSwitchChange}
            trackColor={{ false: "#27272a", true: "#6366f1" }}
            thumbColor="#fff"
          />
        ) : (
          <ChevronRight size={20} color="#52525b" />
        )}
      </View>
    </TouchableOpacity>
  );

  const LegalItem = ({ label, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4 border-b border-white/5"
    >
      <Text className="text-white text-[16px]">{label}</Text>
      <ChevronRight size={20} color="#52525b" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-900 items-center justify-center mr-4"
          >
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Einstellungen</Text>
        </View>

        <ScrollView className="flex-1 px-6">
          <View className="mt-4">
            <SettingItem 
              icon={<Bell size={22} color="white" />} 
              label="Mitteilungen" 
              onPress={() => {}}
            />
            <SettingItem 
              icon={<Moon size={22} color="white" />} 
              label="Design" 
              subLabel={isDarkMode ? "Dunkel" : "Hell"}
              onPress={() => setIsDarkMode(!isDarkMode)}
            />
            <SettingItem 
              icon={<Languages size={22} color="white" />} 
              label="Sprache" 
              subLabel={locale === 'en' ? 'English' : 'Deutsch'}
              onPress={() => setLocale(locale === 'en' ? 'tr' : 'en')}
            />
            
            {isBiometricAvailable && (
              <SettingItem 
                icon={<ScanFace size={22} color="white" />} 
                label="Mit FaceID anmelden" 
                showSwitch
                switchValue={isFaceIdEnabled}
                onSwitchChange={toggleFaceId}
              />
            )}

            <SettingItem 
              icon={<LayoutGrid size={22} color="white" />} 
              label="Sonstiges" 
              onPress={() => {}}
            />
          </View>

          {/* Legal / Info Section */}
          <View className="mt-8 mb-10">
            <LegalItem label="Impressum" onPress={() => {}} />
            <LegalItem label="Barrierefreiheit" onPress={() => {}} />
            <LegalItem label="Infos zum Tracking" onPress={() => {}} />
            <LegalItem label="Datenschutz" onPress={() => {}} />
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
