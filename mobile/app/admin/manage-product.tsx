
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

export default function ManageProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const intl = useIntl();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<InsertProduct>>({
    name: "",
    description: "",
    price: 0,
    category: "electronics",
    imageUrl: "",
    stock: 10,
  });

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
      Alert.alert(
        intl.formatMessage({ id: "common.success" }),
        `Product ${isEditing ? "updated" : "created"} successfully`
      );
      router.back();
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
      <View className="flex-1 justify-center items-center bg-[#121212]">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#121212]">
        <StatusBar style="light" />
        <SafeAreaView className="flex-1" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-white/5 bg-[#1e2029]">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-[#2A2C39] rounded-full items-center justify-center border border-white/10"
                >
                    <ChevronLeft size={20} color="white" />
                </TouchableOpacity>
                <View className="flex-1 items-center">
                    <Text className="text-white text-lg font-bold">
                        {isEditing ? "Edit Product" : "Add New Product"}
                    </Text>
                </View>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                
                {/* Image Upload Placeholder */}
                <View className="border-2 border-dashed border-[#6366f1]/30 bg-[#6366f1]/5 rounded-3xl h-64 items-center justify-center mb-8 relative overflow-hidden">
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
                            <View className="w-16 h-16 bg-[#6366f1]/20 rounded-full items-center justify-center mb-4">
                                <ImageIcon size={32} color="#6366f1" />
                            </View>
                            <Text className="text-white font-bold text-lg mb-1">Add Product Images</Text>
                            <Text className="text-slate-400 text-sm">Enter URL below</Text>
                        </View>
                    )}
                </View>

                {/* Form Fields */}
                <View className="gap-4 mb-8">
                     <View>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Basic Information</Text>
                        <View className="bg-[#1e2029] p-4 rounded-3xl border border-white/5 space-y-4">
                            <Input
                                label="Product Name"
                                value={formData.name || ""}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="e.g. Lunar Gravity Sneakers"
                                style={{ backgroundColor: '#2A2C39', borderColor: '#334155', color: 'white' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Input
                                        label="Price"
                                        value={formData.price?.toString() || "0"}
                                        onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) || 0 })}
                                        placeholder="0.00"
                                        style={{ backgroundColor: '#2A2C39', borderColor: '#334155', color: 'white' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Input
                                        label="Stock"
                                        value={formData.stock?.toString() || "0"}
                                        onChangeText={(text) => setFormData({ ...formData, stock: parseInt(text) || 0 })}
                                        placeholder="0"
                                        style={{ backgroundColor: '#2A2C39', borderColor: '#334155', color: 'white' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                </View>
                            </View>

                            <Input
                                label="Category"
                                value={formData.category || ""}
                                onChangeText={(text) => setFormData({ ...formData, category: text })}
                                placeholder="electronics, clothing, etc."
                                style={{ backgroundColor: '#2A2C39', borderColor: '#334155', color: 'white' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            
                            <Input
                                label="Image URL"
                                value={formData.imageUrl || ""}
                                onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                                placeholder="https://..."
                                style={{ backgroundColor: '#2A2C39', borderColor: '#334155', color: 'white' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                        </View>
                     </View>

                     <View>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Description</Text>
                        <View className="bg-[#1e2029] p-4 rounded-3xl border border-white/5">
                            <Input
                                value={formData.description || ""}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Product Story..."
                                multiline
                                numberOfLines={4}
                                style={{ backgroundColor: '#2A2C39', borderColor: '#334155', color: 'white', height: 100, textAlignVertical: 'top' }}
                            />
                        </View>
                     </View>
                </View>

            </ScrollView>

            {/* Footer Actions */}
            <View className="bg-[#1e2029] p-4 border-t border-white/5 flex-row gap-4 shadow-2xl pb-8">
                <Button 
                   title="Discard" 
                   onPress={() => router.back()} 
                   variant="outline"
                   className="flex-1 bg-[#2A2C39] border-white/10"
                   textStyle={{ color: 'white' }}
                   icon={<X size={18} color="white" />}
                />
                <Button 
                   title={isEditing ? "Update Product" : "Save Product"}
                   onPress={handleSubmit} 
                   loading={mutation.isPending}
                   className="flex-1"
                   icon={<Save size={18} color="white" />}
                />
            </View>
        </SafeAreaView>
    </View>
  );
}
