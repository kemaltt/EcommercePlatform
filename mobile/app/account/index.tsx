import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  ScanFace,
  Lock,
  User,
  CreditCard,
  History,
  Trash2,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useIntl } from "react-intl";

import { useTheme } from "../../contexts/theme-context";
import { BiometricService } from "../../lib/biometric";
import { useAuth } from "../../hooks/use-auth";
import { PasswordConfirmModal } from "../../components/PasswordConfirmModal";
import { SuccessModal } from "../../components/SuccessModal";
import { api } from "../../lib/api";

export default function AccountScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const intl = useIntl();

  const [isFaceIdEnabled, setIsFaceIdEnabled] = React.useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [statusModal, setStatusModal] = React.useState<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmingPassword, setConfirmingPassword] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const available = await BiometricService.isAvailable();
      setIsBiometricAvailable(available);

      const enabled = await BiometricService.isEnabled();
      setIsFaceIdEnabled(enabled);
    })();
  }, []);

  const toggleFaceId = async (value: boolean) => {
    if (value) {
      const authSuccess = await BiometricService.authenticate(
        intl.formatMessage({ id: "account.biometric" }),
      );
      if (authSuccess) {
        setShowPasswordModal(true);
      }
    } else {
      await BiometricService.setEnabled(false);
      setIsFaceIdEnabled(false);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!user) return;

    setConfirmingPassword(true);
    try {
      await api.post("/auth/login", { username: user.email, password });

      await BiometricService.setEnabled(true);
      await BiometricService.storeCredentials({
        username: user.email,
        password,
      });
      setIsFaceIdEnabled(true);
      setShowPasswordModal(false);

      setTimeout(() => {
        setStatusModal({
          visible: true,
          type: "success",
          title: intl.formatMessage({ id: "account.biometric.success.title" }),
          message: intl.formatMessage({
            id: "account.biometric.success.message",
          }),
        });
      }, 500);
    } catch (error: any) {
      setStatusModal({
        visible: true,
        type: "error",
        title: intl.formatMessage({ id: "common.error" }),
        message: intl.formatMessage({ id: "account.biometric.error.message" }),
      });
    } finally {
      setConfirmingPassword(false);
    }
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-muted-foreground font-bold text-[11px] tracking-[2px] uppercase mt-8 mb-2 ml-1">
      {title}
    </Text>
  );

  const AccountItem = ({
    icon,
    label,
    subLabel,
    onPress,
    showSwitch = false,
    switchValue = false,
    onSwitchChange,
    isDestructive = false,
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4 border-b border-border/10"
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`w-10 h-10 items-center justify-center mr-3 rounded-xl ${isDestructive ? "bg-red-500/10" : "bg-card"}`}
        >
          {React.cloneElement(icon, {
            color: isDestructive ? "#ef4444" : isDark ? "white" : "black",
          })}
        </View>
        <Text
          className={`text-[17px] font-medium ${isDestructive ? "text-red-500" : "text-foreground"}`}
        >
          {label}
        </Text>
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

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
          >
            <ChevronLeft size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">
            {intl.formatMessage({ id: "account.title" })}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-10">
            <SectionHeader
              title={intl.formatMessage({ id: "account.security" })}
            />

            {(isBiometricAvailable || __DEV__) && (
              <AccountItem
                icon={<ScanFace size={22} />}
                label={intl.formatMessage({ id: "account.biometric" })}
                showSwitch
                switchValue={isFaceIdEnabled}
                onSwitchChange={toggleFaceId}
              />
            )}

            <AccountItem
              icon={<Shield size={22} />}
              label={intl.formatMessage({ id: "account.changePassword" })}
              onPress={() => router.push("/account/change-password")}
            />

            <SectionHeader
              title={intl.formatMessage({ id: "account.personalData" })}
            />

            <AccountItem
              icon={<User size={22} />}
              label={intl.formatMessage({ id: "account.editProfile" })}
              onPress={() => {}}
            />
            <AccountItem
              icon={<CreditCard size={22} />}
              label={intl.formatMessage({ id: "account.paymentMethods" })}
              onPress={() => router.push("/account/payment-methods")}
            />
            <AccountItem
              icon={<History size={22} />}
              label={intl.formatMessage({ id: "account.orderHistory" })}
              onPress={() => router.push("/account/orders")}
            />

            <SectionHeader
              title={intl.formatMessage({ id: "account.dangerZone" })}
            />
            <AccountItem
              icon={<Trash2 size={22} />}
              label={intl.formatMessage({ id: "account.deleteAccount" })}
              isDestructive
              onPress={() => {}}
            />
          </View>
        </ScrollView>

        <PasswordConfirmModal
          visible={showPasswordModal}
          loading={confirmingPassword}
          onClose={() => setShowPasswordModal(false)}
          onConfirm={handlePasswordConfirm}
        />

        <SuccessModal
          visible={statusModal.visible}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onClose={() =>
            setStatusModal((prev) => ({ ...prev, visible: false }))
          }
        />
      </SafeAreaView>
    </View>
  );
}
