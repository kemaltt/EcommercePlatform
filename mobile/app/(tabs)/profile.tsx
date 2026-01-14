import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "../../components/ui/Button";
import { User, Settings, LogOut, Package, CreditCard, ChevronRight, ShieldCheck, Languages } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";
import { useI18n } from "../../contexts/i18n-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const intl = useIntl();
  const { locale, setLocale } = useI18n();

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

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-6">
        <Text className="text-xl font-bold mb-4">
          <FormattedMessage id="profile.loginRequired" />
        </Text>
        <Button 
          title={intl.formatMessage({ id: "auth.register.login" })} 
          onPress={() => router.push("/(auth)/login")} 
        />
      </View>
    );
  }

  const menuItems = [
    { icon: <Package size={22} color="#6366f1" />, label: intl.formatMessage({ id: "profile.orders" }) },
    { icon: <CreditCard size={22} color="#10b981" />, label: intl.formatMessage({ id: "profile.payments" }) },
    { icon: <Settings size={22} color="#6b7280" />, label: intl.formatMessage({ id: "profile.settings" }) },
  ];

  if (user.isAdmin) {
    menuItems.unshift({ 
      icon: <ShieldCheck size={22} color="#3b82f6" />, 
      label: intl.formatMessage({ id: "profile.admin" }), 
      action: () => router.push("/admin") 
    } as any);
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-10 pb-6 items-center border-b border-border">
        <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
          <User size={48} color="#3b82f6" />
        </View>
        <Text className="text-2xl font-bold text-foreground">{user.fullName}</Text>
        <Text className="text-muted-foreground">@{user.username}</Text>
      </View>

      <View className="p-6">
        <Text className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
          <FormattedMessage id="profile.general" />
        </Text>

        <TouchableOpacity
          onPress={toggleLanguage}
          className="flex-row items-center justify-between py-4 border-b border-border"
        >
          <View className="flex-row items-center">
            <View className="mr-4">
              <Languages size={22} color="#8b5cf6" />
            </View>
            <Text className="text-base font-medium text-foreground">
              {locale === "en" ? "Türkçe'ye Geç" : "Switch to English"}
            </Text>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={(item as any).action}
            className="flex-row items-center justify-between py-4 border-b border-border"
          >
            <View className="flex-row items-center">
              <View className="mr-4">{item.icon}</View>
              <Text className="text-base font-medium text-foreground">{item.label}</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-between py-4 mt-10"
        >
          <View className="flex-row items-center">
            <View className="mr-4">
              <LogOut size={22} color="#ef4444" />
            </View>
            <Text className="text-base font-bold text-red-500">
              <FormattedMessage id="profile.signOut" />
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
