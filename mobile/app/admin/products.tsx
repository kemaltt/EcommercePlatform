
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
import { useTheme } from "../../contexts/theme-context";

const { width } = Dimensions.get("window");

export default function AdminProductsScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const intl = useIntl();
  const { isDark } = useTheme();

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
    <View className="bg-card border border-border/50 rounded-[30px] p-3 flex-row items-center mb-4 min-h-[100px]">
      {/* Image Wrapper with explicit style for expo-image compatibility */}
      <View 
        style={{ width: 80, height: 80 }} 
        className="bg-background rounded-[22px] mr-4 overflow-hidden items-center justify-center p-1.5 border border-border/50"
      >
        <Image
          source={item.imageUrl}
          placeholder={{ uri: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=10&w=100" }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          transition={300}
          recyclingKey={item.id.toString()}
          onError={() => {
            if (__DEV__) {
              console.warn(`[AdminImageLoad] Failed to load image for: ${item.name}, URL: ${item.imageUrl}`);
            }
          }}
        />
      </View>
      
      <View className="flex-1 justify-center py-1">
        <View className="flex-row items-center justify-between pr-1">
          <View className="flex-1 flex-row items-center">
            <Text className="font-bold text-foreground text-base mr-2 flex-shrink" numberOfLines={1}>{item.name}</Text>
            {item.price > 100 && (
              <View className="bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                <Text className="text-orange-400 text-[8px] font-bold uppercase tracking-widest">Premium</Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/admin/manage-product", params: { id: item.id } })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit2 size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text className="text-muted-foreground text-xs font-medium mt-1">
          Stock: {item.stock} • Ref: #{item.id}
        </Text>
        
        <Text className="text-primary text-lg font-bold mt-2">
          ${Number(item.price).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
         <View className="px-6 py-4 flex-row items-center mb-2">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border"
            >
               <ChevronLeft size={20} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
            <View className="flex-1 items-center">
               <Text className="text-foreground text-lg font-bold">Product Management</Text>
            </View>
            <TouchableOpacity 
              className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border"
              onPress={() => router.push("/admin/manage-product")}
            >
               <Plus size={20} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
         </View>

        {/* Search */}
        <View className="px-6 mb-6">
           <View className="bg-card h-12 rounded-xl flex-row items-center px-4 border border-border">
              <Search size={20} color={isDark ? "#94a3b8" : "#64748b"} />
              <TextInput 
                 placeholder="Search products..." 
                 placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                 className="flex-1 ml-3 px-2 text-foreground"
                 style={{ height: '100%' }}
                 textAlignVertical="center"
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
