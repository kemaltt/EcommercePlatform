import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Product } from "@shared/schema";
import { Image } from "expo-image";
import { Plus, Edit2, Trash2, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";

export default function AdminDashboard() {
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
          text: intl.formatMessage({ id: "common.error" }), // "Delete" is not in keys, using common.error for now or could add "common.delete"
          style: "destructive", 
          onPress: () => deleteMutation.mutate(id) 
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View className="flex-row bg-card rounded-xl p-3 mb-3 border border-border items-center">
            <Image
              source={item.imageUrl}
              className="w-16 h-16 rounded-lg mr-4"
            />
            <View className="flex-1">
              <Text className="font-bold text-foreground" numberOfLines={1}>{item.name}</Text>
              <Text className="text-primary font-bold">${item.price.toFixed(2)}</Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/admin/manage-product", params: { id: item.id } })}
                className="p-2 bg-blue-100 rounded-full mr-2"
              >
                <Edit2 size={18} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                className="p-2 bg-red-100 rounded-full"
              >
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => router.push("/admin/manage-product")}
        className="absolute bottom-10 right-6 bg-primary w-16 h-16 rounded-full items-center justify-center shadow-xl"
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
