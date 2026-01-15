
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, User, Mail, ShieldCheck, Save, Trash2 } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { User as UserType } from "@shared/schema";
import { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/theme-context";

export default function EditUserScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("active");
  const [isAdmin, setIsAdmin] = useState(false);

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
      Alert.alert("Success", "User updated successfully");
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to update user");
    },
  });

  const handleSave = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Error", "Full Name and Email are required");
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
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
           <TouchableOpacity 
             onPress={() => router.back()}
             className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border"
           >
              <ChevronLeft size={20} color={isDark ? "white" : "black"} />
           </TouchableOpacity>
           <Text className="text-foreground text-lg font-bold">Edit User</Text>
           <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          {/* Form */}
          <View className="mb-6">
            <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase tracking-widest">Full Name</Text>
            <View className="bg-card h-14 rounded-2xl flex-row items-center px-4 border border-border">
              <User size={20} color="#6366f1" />
              <TextInput 
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                className="flex-1 ml-3 px-2 text-foreground font-medium"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase tracking-widest">Email Address</Text>
            <View className="bg-card h-14 rounded-2xl flex-row items-center px-4 border border-border">
              <Mail size={20} color="#6366f1" />
              <TextInput 
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 px-2 text-foreground font-medium"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase tracking-widest">Account Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {["active", "trial", "passive", "cancellation_request", "cancelled", "deleted"].map((s) => (
                <TouchableOpacity 
                  key={s}
                  onPress={() => setStatus(s)}
                  className={`px-4 py-3 rounded-xl border ${status === s ? 'bg-primary/10 border-primary' : 'bg-card border-border'} items-center mb-2`}
                  style={{ minWidth: '30%' }}
                >
                  <Text className={`font-bold text-[10px] uppercase ${status === s ? 'text-primary' : 'text-muted-foreground'}`}>
                    {s.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {status === 'trial' && user?.trialExpiresAt && (
             <View className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
                <Text className="text-amber-600 dark:text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">Trial Expiration</Text>
                <Text className="text-foreground font-medium">
                  {new Date(user.trialExpiresAt).toLocaleDateString()}
                </Text>
             </View>
          )}

          <View className="bg-card border border-border rounded-3xl p-5 mb-10">
             <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                   <View className="w-10 h-10 bg-amber-500/20 rounded-xl items-center justify-center mr-4">
                      <ShieldCheck size={20} color="#f59e0b" />
                   </View>
                   <View>
                      <Text className="text-foreground font-bold">Admin Access</Text>
                      <Text className="text-muted-foreground text-xs">Grant administrator privileges</Text>
                   </View>
                </View>
                <Switch 
                  value={isAdmin}
                  onValueChange={setIsAdmin}
                  trackColor={{ false: isDark ? "#334155" : "#e2e8f0", true: "#6366f1" }}
                  thumbColor="white"
                />
             </View>
          </View>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={updateMutation.isPending}
            className="bg-primary h-16 rounded-2xl items-center justify-center flex-row mb-8"
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
