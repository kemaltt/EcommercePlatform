
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image as RNImage, TextInput } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { User } from "@shared/schema";
import { Image } from "expo-image";
import { Edit2, Search, Filter, ShieldCheck, Mail, ShoppingCart, Lock, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function AdminUsersScreen() {
  const router = useRouter();

  // We need to fetch users. Assuming an endpoint /api/users exists or we need to add one.
  // Ideally, the backend should expose GET /api/users for admins.
  // I will assume it does or I will create it. Given the context, I might need to check if it exists.
  // For now, I'll use /api/users and if it fails I'll add it to the backend.
  
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data;
    },
  });

  const renderUser = ({ item }: { item: User }) => (
    <View className="bg-[#1e2029] border border-white/10 rounded-3xl p-4 mb-4">
      <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-[#2A2C39] rounded-full items-center justify-center mr-4 overflow-hidden border border-white/10">
              {/* Avatar placeholder */}
              <Image 
                 source={`https://ui-avatars.com/api/?name=${item.fullName}&background=6366f1&color=fff`} 
                 style={{ width: '100%', height: '100%' }}
                 contentFit="cover"
              />
          </View>
          <View className="flex-1">
             <View className="flex-row items-center">
               <Text className="text-white font-bold text-lg mr-2">{item.fullName}</Text>
               {item.isAdmin && (
                 <View className="bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                    <Text className="text-amber-500 text-[8px] font-bold uppercase tracking-tighter">Admin</Text>
                 </View>
               )}
             </View>
             <Text className="text-slate-400 text-sm">{item.email}</Text>
          </View>
          <View className={`px-2 py-1 rounded-md ${item.status === 'active' || !item.status ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <Text className={`text-[10px] font-bold uppercase ${item.status === 'active' || !item.status ? 'text-green-500' : 'text-red-500'}`}>
                 {item.status || 'ACTIVE'}
              </Text>
          </View>
      </View>
      
       <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => router.push(`/admin/users/${item.id}`)}
            className="flex-1 bg-[#2A2C39] border border-white/5 py-3 rounded-xl flex-row items-center justify-center"
          >
             <Edit2 size={14} color="white" className="mr-2" />
             <Text className="text-white text-xs font-bold">Edit User</Text>
          </TouchableOpacity>
         
         <TouchableOpacity className="flex-1 bg-[#6366f1] py-3 rounded-xl flex-row items-center justify-center">
            <ShoppingCart size={14} color="white" className="mr-2" />
            <Text className="text-white text-xs font-bold">View Orders</Text>
         </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
         <View className="px-6 py-4 flex-row items-center mb-2">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-[#1e2029] rounded-full items-center justify-center border border-white/10"
            >
               <ChevronLeft size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
               <Text className="text-white text-lg font-bold">User Management</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-[#1e2029] rounded-full items-center justify-center border border-white/10">
               <Filter size={20} color="white" />
            </TouchableOpacity>
         </View>

        {/* Search */}
        <View className="px-6 mb-6">
           <View className="bg-[#1e2029] h-12 rounded-xl flex-row items-center px-4 border border-white/10">
              <Search size={20} color="#94a3b8" />
              <TextInput 
                 placeholder="Search users by name or email..." 
                 placeholderTextColor="#64748b"
                 className="flex-1 ml-3 text-white"
              />
           </View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <FlatList
             data={users}
             keyExtractor={(item) => item.id.toString()}
             contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
             renderItem={renderUser}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
