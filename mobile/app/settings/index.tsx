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
  LayoutGrid,
  Sun,
  Smartphone,
  X
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useI18n } from "../../contexts/i18n-context";
import { useIntl } from "react-intl";

import { useTheme } from "../../contexts/theme-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const intl = useIntl();
  
  const [showThemeModal, setShowThemeModal] = React.useState(false);
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);

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

  const getLanguageLabel = () => {
    switch(locale) {
        case 'de': return 'Deutsch';
        case 'en': return 'English';
        case 'tr': return 'Türkçe';
        default: return 'Deutsch';
    }
  };

  const LanguageOption = ({ lang, label, icon }: any) => (
    <TouchableOpacity 
      onPress={() => {
        setLocale(lang);
        setShowLanguageModal(false);
      }}
      className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
        locale === lang ? 'bg-primary/10 border border-primary/30' : 'bg-card'
      }`}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-secondary/30 items-center justify-center mr-3">
          {icon}
        </View>
        <Text className={`text-[16px] font-semibold ${locale === lang ? 'text-primary' : 'text-foreground'}`}>
          {label}
        </Text>
      </View>
      {locale === lang && (
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
          <Text className="text-xl font-bold text-foreground">{intl.formatMessage({ id: 'settings.title' })}</Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="mb-10 mt-4">
            <SettingItem 
              icon={<Bell size={22} color={isDark ? "white" : "black"} />} 
              label={intl.formatMessage({ id: 'settings.notifications' })} 
              onPress={() => {}}
            />
            <SettingItem 
              icon={<Moon size={22} color={isDark ? "white" : "black"} />} 
              label={intl.formatMessage({ id: 'settings.theme' })} 
              subLabel={themeMode === 'dark' ? intl.formatMessage({ id: 'settings.theme.dark' }) : themeMode === 'light' ? intl.formatMessage({ id: 'settings.theme.light' }) : intl.formatMessage({ id: 'settings.theme.system' })}
              onPress={() => setShowThemeModal(true)}
            />
            <SettingItem 
              icon={<Languages size={22} color={isDark ? "white" : "black"} />} 
              label={intl.formatMessage({ id: 'settings.language' })} 
              subLabel={getLanguageLabel()}
              onPress={() => setShowLanguageModal(true)}
            />
            <SettingItem 
              icon={<LayoutGrid size={22} color={isDark ? "white" : "black"} />} 
              label={intl.formatMessage({ id: 'settings.defaultView' })} 
              onPress={() => {}}
            />

            <View className="mt-8">
              <LegalItem label={intl.formatMessage({ id: 'settings.legal.imprint' })} onPress={() => {}} />
              <LegalItem label={intl.formatMessage({ id: 'settings.legal.accessibility' })} onPress={() => {}} />
              <LegalItem label={intl.formatMessage({ id: 'settings.legal.tracking' })} onPress={() => {}} />
              <LegalItem label={intl.formatMessage({ id: 'settings.legal.privacy' })} onPress={() => {}} />
            </View>
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
                <Text className="text-xl font-bold text-foreground">{intl.formatMessage({ id: 'settings.theme.choose' })}</Text>
                <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                  <X size={24} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
              </View>
              
              <ThemeOption 
                mode="light" 
                label={intl.formatMessage({ id: 'settings.theme.light' })} 
                icon={<Sun size={20} color={isDark ? "white" : "black"} />} 
              />
              <ThemeOption 
                mode="dark" 
                label={intl.formatMessage({ id: 'settings.theme.dark' })} 
                icon={<Moon size={20} color={isDark ? "white" : "black"} />} 
              />
              <ThemeOption 
                mode="system" 
                label={intl.formatMessage({ id: 'settings.theme.system' })} 
                icon={<Smartphone size={20} color={isDark ? "white" : "black"} />} 
              />
            </View>
          </View>
        </Modal>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-background rounded-t-[32px] p-6 pb-12 border-t border-border/10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-foreground">{intl.formatMessage({ id: 'settings.language.choose' })}</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <X size={24} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
              </View>
              
              <LanguageOption 
                lang="de" 
                label="Deutsch" 
                icon={<Languages size={20} color={isDark ? "white" : "black"} />} 
              />
              <LanguageOption 
                lang="en" 
                label="English" 
                icon={<Languages size={20} color={isDark ? "white" : "black"} />} 
              />
              <LanguageOption 
                lang="tr" 
                label="Türkçe" 
                icon={<Languages size={20} color={isDark ? "white" : "black"} />} 
              />
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
}
