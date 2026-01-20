import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  User,
  Mail,
  ShieldCheck,
  Save,
  Trash2,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User as UserType } from "@shared/schema";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import { PasswordConfirmModal } from "@/components/PasswordConfirmModal";
import { SuccessModal } from "@/components/SuccessModal";
import { useIntl } from "react-intl";

export default function EditUserScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const intl = useIntl();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("active");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: [`/api/admin/users/${id}`],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setStatus(user.status || "active");
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<UserType>) => {
      const res = await api.patch(`/admin/users/${id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${id}`] });
      setShowSuccessModal(true);
    },
    onError: (error: any) => {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        error.response?.data?.message ||
          intl.formatMessage({ id: "admin.users.errors.updateFailed" }),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await api.post(`/admin/users/${id}/delete`, { password });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowDeleteModal(false);
      router.back();
      Alert.alert(
        intl.formatMessage({ id: "common.success" }),
        intl.formatMessage({ id: "admin.users.deleteSuccess" }),
      );
    },
    onError: (error: any) => {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        error.response?.data?.message ||
          intl.formatMessage({ id: "admin.users.errors.deleteFailed" }),
      );
    },
  });

  const handleSave = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        intl.formatMessage({ id: "admin.users.errors.requiredFields" }),
      );
      return;
    }
    updateMutation.mutate({
      fullName,
      email,
      status,
      isAdmin,
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border"
          >
            <ChevronLeft size={20} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <Text className="text-foreground text-lg font-bold">
            {intl.formatMessage({ id: "admin.users.editTitle" })}
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Form */}
          <View className="mb-6">
            <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase tracking-widest">
              {intl.formatMessage({ id: "admin.users.fullName" })}
            </Text>
            <View className="bg-card h-14 rounded-2xl flex-row items-center px-4 border border-border">
              <User size={20} color="#6366f1" />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder={intl.formatMessage({ id: "admin.users.fullName" })}
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                className="flex-1 ml-3 px-2 text-foreground font-medium"
                style={{ height: "100%" }}
                textAlignVertical="center"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase tracking-widest">
              {intl.formatMessage({ id: "admin.users.email" })}
            </Text>
            <View className="bg-card h-14 rounded-2xl flex-row items-center px-4 border border-border">
              <Mail size={20} color="#6366f1" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={intl.formatMessage({ id: "admin.users.email" })}
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 px-2 text-foreground font-medium"
                style={{ height: "100%" }}
                textAlignVertical="center"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase tracking-widest">
              {intl.formatMessage({ id: "admin.users.status" })}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                "active",
                "passive",
                "cancellation_request",
                "cancelled",
                "deleted",
              ].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  className={`px-4 py-3 rounded-xl border ${status === s ? "bg-primary/10 border-primary" : "bg-card border-border"} items-center mb-2`}
                  style={{ minWidth: "30%" }}
                >
                  <Text
                    className={`font-bold text-[10px] uppercase ${status === s ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {intl.formatMessage({ id: `admin.users.statusTypes.${s}` })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="bg-card border border-border rounded-3xl p-5 mb-10">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-amber-500/20 rounded-xl items-center justify-center mr-4">
                  <ShieldCheck size={20} color="#f59e0b" />
                </View>
                <View>
                  <Text className="text-foreground font-bold">
                    {intl.formatMessage({ id: "admin.users.adminAccess" })}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    {intl.formatMessage({ id: "admin.users.grantAdmin" })}
                  </Text>
                </View>
              </View>
              <Switch
                value={isAdmin}
                onValueChange={setIsAdmin}
                trackColor={{
                  false: isDark ? "#334155" : "#e2e8f0",
                  true: "#6366f1",
                }}
                thumbColor="white"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={updateMutation.isPending}
            className="bg-primary h-16 rounded-2xl items-center justify-center flex-row mb-4"
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">
                  {intl.formatMessage({ id: "admin.users.saveChanges" })}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="bg-red-500/10 h-16 rounded-2xl items-center justify-center flex-row mb-8 border border-red-500/20"
          >
            <Trash2 size={20} color="#ef4444" className="mr-2" />
            <Text className="text-red-500 font-bold text-lg">
              {intl.formatMessage({ id: "admin.users.deleteUser" })}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <SuccessModal
        visible={showSuccessModal}
        title={intl.formatMessage({ id: "admin.users.updateSuccess" })}
        message={intl.formatMessage({ id: "admin.users.updateSuccessMessage" })}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
      />

      <PasswordConfirmModal
        visible={showDeleteModal}
        title={intl.formatMessage({ id: "admin.users.deleteTitle" })}
        subtitle={intl.formatMessage({
          id: "admin.users.deleteConfirmMessage",
        })}
        confirmLabel={intl.formatMessage({ id: "admin.users.deleteUser" })}
        loading={deleteMutation.isPending}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async (password) => {
          await deleteMutation.mutateAsync(password);
        }}
      />
    </View>
  );
}
