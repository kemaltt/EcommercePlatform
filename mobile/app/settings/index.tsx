import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Modal,
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
  LayoutGrid,
  Sun,
  Smartphone,
  X
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useI18n } from "../../contexts/i18n-context";
import { FormattedMessage, useIntl } from "react-intl";
import * as LocalAuthentication from 'expo-local-authentication';

import { useTheme } from "../../contexts/theme-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const intl = useIntl();
  
  const [isFaceIdEnabled, setIsFaceIdEnabled] = React.useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = React.useState(false);
  const [showThemeModal, setShowThemeModal] = React.useState(false);

  React.useEffect(() => {
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
      className="flex-row items-center justify-between py-4 border-b border-border/10"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 items-center justify-center mr-3">
          {icon}
        </View>
        <Text className="text-foreground text-[17px] font-medium">{label}</Text>
      </View>
      
      <View className="flex-row items-center">
        {subLabel && !showSwitch && (
          <Text className="text-muted-foreground mr-2 text-sm">{subLabel}</Text>
        )}
        {showSwitch ? (
          <Switch 
            value={switchValue} 
            onValueChange={onSwitchChange}
            trackColor={{ false: "#e4e4e7", true: "#6366f1" }}
            thumbColor="#fff"
          />
        ) : (
          <ChevronRight size={20} color="#52525b" />
        )}
      </View>
    </TouchableOpacity>
  );

  const ThemeOption = ({ mode, label, icon }: any) => (
    <TouchableOpacity 
      onPress={() => {
        setThemeMode(mode);
        setShowThemeModal(false);
      }}
      className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
        themeMode === mode ? 'bg-primary/10 border border-primary/30' : 'bg-card'
      }`}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-secondary/30 items-center justify-center mr-3">
          {icon}
        </View>
        <Text className={`text-[16px] font-semibold ${themeMode === mode ? 'text-primary' : 'text-foreground'}`}>
          {label}
        </Text>
      </View>
      {themeMode === mode && (
         <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
            <Text className="text-white text-[10px]">✓</Text>
         </View>
      )}
    </TouchableOpacity>
  );

  const LegalItem = ({ label, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4 border-b border-border/10"
    >
      <Text className="text-foreground text-[16px]">{label}</Text>
      <ChevronRight size={20} color="#52525b" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
          >
            <ChevronLeft size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Einstellungen</Text>
        </View>

        <ScrollView className="flex-1 px-6">
          <View className="mt-4">
            <SettingItem 
              icon={<Bell size={22} color={isDark ? "white" : "black"} />} 
              label="Mitteilungen" 
              onPress={() => {}}
            />
            <SettingItem 
              icon={<Moon size={22} color={isDark ? "white" : "black"} />} 
              label="Design" 
              subLabel={themeMode === 'dark' ? "Dunkel" : themeMode === 'light' ? "Hell" : "System"}
              onPress={() => setShowThemeModal(true)}
            />
            <SettingItem 
              icon={<Languages size={22} color={isDark ? "white" : "black"} />} 
              label="Sprache" 
              subLabel={locale === 'en' ? 'English' : 'Deutsch'}
              onPress={() => setLocale(locale === 'en' ? 'tr' : 'en')}
            />
            
            {isBiometricAvailable && (
              <SettingItem 
                icon={<ScanFace size={22} color={isDark ? "white" : "black"} />} 
                label="Mit FaceID anmelden" 
                showSwitch
                switchValue={isFaceIdEnabled}
                onSwitchChange={toggleFaceId}
              />
            )}

            <SettingItem 
              icon={<LayoutGrid size={22} color={isDark ? "white" : "black"} />} 
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

        {/* Theme Selection Modal */}
        <Modal
          visible={showThemeModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowThemeModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-background rounded-t-[32px] p-6 pb-12 border-t border-border/10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-foreground">Design wählen</Text>
                <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                  <X size={24} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
              </View>
              
              <ThemeOption 
                mode="light" 
                label="Hell" 
                icon={<Sun size={20} color={isDark ? "white" : "black"} />} 
              />
              <ThemeOption 
                mode="dark" 
                label="Dunkel" 
                icon={<Moon size={20} color={isDark ? "white" : "black"} />} 
              />
              <ThemeOption 
                mode="system" 
                label="System" 
                icon={<Smartphone size={20} color={isDark ? "white" : "black"} />} 
              />
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}
