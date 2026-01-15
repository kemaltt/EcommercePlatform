
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, User, Mail, ShieldCheck, Save, Trash2 } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { User as UserType } from "@shared/schema";
import { useState, useEffect } from "react";

export default function EditUserScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

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
      <View className="flex-1 bg-[#121212] justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
           <TouchableOpacity 
             onPress={() => router.back()}
             className="w-10 h-10 bg-[#1e2029] rounded-full items-center justify-center border border-white/10"
           >
              <ChevronLeft size={20} color="white" />
           </TouchableOpacity>
           <Text className="text-white text-lg font-bold">Edit User</Text>
           <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          {/* Form */}
          <View className="mb-6">
            <Text className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">Full Name</Text>
            <View className="bg-[#1e2029] h-14 rounded-2xl flex-row items-center px-4 border border-white/10">
              <User size={20} color="#6366f1" />
              <TextInput 
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor="#64748b"
                className="flex-1 ml-3 text-white font-medium"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">Email Address</Text>
            <View className="bg-[#1e2029] h-14 rounded-2xl flex-row items-center px-4 border border-white/10">
              <Mail size={20} color="#6366f1" />
              <TextInput 
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 text-white font-medium"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">Account Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {["active", "trial", "passive", "cancellation_request", "cancelled", "deleted"].map((s) => (
                <TouchableOpacity 
                  key={s}
                  onPress={() => setStatus(s)}
                  className={`px-4 py-3 rounded-xl border ${status === s ? 'bg-[#6366f1]/10 border-[#6366f1]' : 'bg-[#1e2029] border-white/10'} items-center mb-2`}
                  style={{ minWidth: '30%' }}
                >
                  <Text className={`font-bold text-[10px] uppercase ${status === s ? 'text-[#6366f1]' : 'text-slate-400'}`}>
                    {s.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {status === 'trial' && user?.trialExpiresAt && (
             <View className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
                <Text className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">Trial Expiration</Text>
                <Text className="text-white font-medium">
                  {new Date(user.trialExpiresAt).toLocaleDateString()}
                </Text>
             </View>
          )}

          <View className="bg-[#1e2029] border border-white/10 rounded-3xl p-5 mb-10">
             <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                   <View className="w-10 h-10 bg-amber-500/20 rounded-xl items-center justify-center mr-4">
                      <ShieldCheck size={20} color="#fbbf24" />
                   </View>
                   <View>
                      <Text className="text-white font-bold">Admin Access</Text>
                      <Text className="text-slate-500 text-xs">Grant administrator privileges</Text>
                   </View>
                </View>
                <Switch 
                  value={isAdmin}
                  onValueChange={setIsAdmin}
                  trackColor={{ false: "#334155", true: "#6366f1" }}
                  thumbColor="white"
                />
             </View>
          </View>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={updateMutation.isPending}
            className="bg-[#6366f1] h-16 rounded-2xl items-center justify-center flex-row mb-8"
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
