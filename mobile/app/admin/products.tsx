
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Dimensions } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Product } from "@shared/schema";
import { Image } from "expo-image";
import { Plus, Edit2, Trash2, ChevronLeft, Search, Filter } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

export default function AdminProductsScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const intl = useIntl();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      Alert.alert(
        intl.formatMessage({ id: "common.success" }),
        "Product deleted successfully"
      );
    },
  });

  const handleDelete = (id: number) => {
    Alert.alert(
      intl.formatMessage({ id: "admin.delete.title" }),
      intl.formatMessage({ id: "admin.delete.confirm" }),
      [
        { text: intl.formatMessage({ id: "common.cancel" }), style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deleteMutation.mutate(id) 
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View className="bg-[#1e2029] border border-white/10 rounded-3xl p-4 mb-4">
      <View className="flex-row items-center mb-4">
        <Image
          source={item.imageUrl}
          className="w-16 h-16 rounded-xl mr-4 bg-white"
          contentFit="cover"
        />
        <View className="flex-1">
          <Text className="font-bold text-white text-lg mb-1" numberOfLines={1}>{item.name}</Text>
          <Text className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">{item.category}</Text>
          <Text className="text-[#6366f1] font-bold">${Number(item.price).toFixed(2)}</Text>
        </View>
      </View>
      
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/admin/manage-product", params: { id: item.id } })}
          className="flex-1 bg-[#2A2C39] border border-white/5 py-3 rounded-xl flex-row items-center justify-center dashed"
        >
          <Edit2 size={14} color="white" className="mr-2" />
          <Text className="text-white text-xs font-bold">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          className="flex-1 bg-red-500/10 border border-red-500/20 py-3 rounded-xl flex-row items-center justify-center"
        >
          <Trash2 size={14} color="#ef4444" className="mr-2" />
          <Text className="text-red-500 text-xs font-bold">Delete</Text>
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
               <Text className="text-white text-lg font-bold">Product Management</Text>
            </View>
            <TouchableOpacity 
              className="w-10 h-10 bg-[#1e2029] rounded-full items-center justify-center border border-white/10"
              onPress={() => router.push("/admin/manage-product")}
            >
               <Plus size={20} color="white" />
            </TouchableOpacity>
         </View>

        {/* Search */}
        <View className="px-6 mb-6">
           <View className="bg-[#1e2029] h-12 rounded-xl flex-row items-center px-4 border border-white/10">
              <Search size={20} color="#94a3b8" />
              <TextInput 
                 placeholder="Search products..." 
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
            data={products}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={renderProduct}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
