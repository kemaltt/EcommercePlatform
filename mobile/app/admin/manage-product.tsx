
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Image as RNImage } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Product, InsertProduct } from "@shared/schema";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Image as ImageIcon, Save, X } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { useTheme } from "../../contexts/theme-context";
import { SuccessModal } from "../../components/SuccessModal";

export default function ManageProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const intl = useIntl();
  const { isDark } = useTheme();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<InsertProduct>>({
    name: "",
    description: "",
    price: 0,
    category: "electronics",
    imageUrl: "",
    stock: 10,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        stock: product.stock,
      });
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        await api.put(`/products/${id}`, data);
      } else {
        await api.post("/products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowSuccessModal(true);
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.imageUrl) {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        "Please fill in all required fields"
      );
      return;
    }
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
        <StatusBar style={isDark ? "light" : "dark"} />
        <SafeAreaView className="flex-1" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-border/50 bg-background">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border"
                >
                    <ChevronLeft size={20} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
                <View className="flex-1 items-center">
                    <Text className="text-foreground text-lg font-bold">
                        {isEditing ? "Edit Product" : "Add New Product"}
                    </Text>
                </View>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                
                {/* Image Upload Placeholder */}
                <View className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-3xl h-64 items-center justify-center mb-8 relative overflow-hidden">
                    {formData.imageUrl ? (
                        <>
                            <Image 
                                source={formData.imageUrl} 
                                style={{ width: '100%', height: '100%' }} 
                                contentFit="cover" 
                            />
                            <TouchableOpacity 
                                className="absolute top-4 right-4 bg-black/40 p-2 rounded-full"
                                onPress={() => setFormData({...formData, imageUrl: ""})}
                            >
                                <X size={20} color="white" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View className="items-center">
                            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                                <ImageIcon size={32} color={isDark ? "#818cf8" : "#4f46e5"} />
                            </View>
                            <Text className="text-foreground font-bold text-lg mb-1">Add Product Images</Text>
                            <Text className="text-muted-foreground text-sm">Enter URL below</Text>
                        </View>
                    )}
                </View>

                {/* Form Fields */}
                <View className="gap-4 mb-8">
                     <View>
                        <Text className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2 ml-1">Basic Information</Text>
                        <View className="bg-card p-4 rounded-3xl border border-border space-y-4">
                            <Input
                                label="Product Name"
                                value={formData.name || ""}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="e.g. Lunar Gravity Sneakers"
                            />
                            
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Input
                                        label="Price"
                                        value={formData.price?.toString() || "0"}
                                        onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) || 0 })}
                                        placeholder="0.00"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Input
                                        label="Stock"
                                        value={formData.stock?.toString() || "0"}
                                        onChangeText={(text) => setFormData({ ...formData, stock: parseInt(text) || 0 })}
                                        placeholder="0"
                                    />
                                </View>
                            </View>

                            <Input
                                label="Category"
                                value={formData.category || ""}
                                onChangeText={(text) => setFormData({ ...formData, category: text })}
                                placeholder="electronics, clothing, etc."
                            />
                            
                            <Input
                                label="Image URL"
                                value={formData.imageUrl || ""}
                                onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                                placeholder="https://..."
                            />
                        </View>
                     </View>

                     <View>
                        <Text className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2 ml-1">Description</Text>
                        <View className="bg-card p-4 rounded-3xl border border-border">
                            <Input
                                value={formData.description || ""}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Product Story..."
                                multiline
                                numberOfLines={4}
                                style={{ height: 100, textAlignVertical: 'top' }}
                            />
                        </View>
                     </View>
                </View>

            </ScrollView>

            {/* Footer Actions */}
            <View className="bg-card p-4 border-t border-border flex-row gap-4 shadow-2xl pb-8">
                <Button 
                   title="Discard" 
                   onPress={() => router.back()} 
                   variant="outline"
                   className="flex-1 bg-secondary border-border"
                   icon={<X size={18} color={isDark ? "white" : "black"} />}
                />
                <Button 
                   title={isEditing ? "Update" : "Save"}
                   onPress={handleSubmit} 
                   loading={mutation.isPending}
                   className="flex-1"
                   icon={<Save size={18} color="white" />}
                />
            </View>
        </SafeAreaView>

        <SuccessModal 
            visible={showSuccessModal}
            title={isEditing ? "Product Updated" : "Product Created"}
            message={`The product has been successfully ${isEditing ? "updated" : "added to the inventory"}.`}
            onClose={() => {
                setShowSuccessModal(false);
                router.back();
            }}
        />
    </View>
  );
}
