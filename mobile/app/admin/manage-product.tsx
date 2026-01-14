import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Product, InsertProduct } from "@shared/schema";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useIntl } from "react-intl";

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
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background p-6">
      <Text className="text-2xl font-bold text-foreground mb-6">
        {isEditing 
          ? intl.formatMessage({ id: "admin.manage.title.edit" })
          : intl.formatMessage({ id: "admin.manage.title.add" })
        }
      </Text>

      <Input
        label={intl.formatMessage({ id: "admin.manage.name" })}
        value={formData.name || ""}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        placeholder={intl.formatMessage({ id: "admin.manage.name" })}
      />

      <Input
        label={intl.formatMessage({ id: "admin.manage.description" })}
        value={formData.description || ""}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        placeholder={intl.formatMessage({ id: "admin.manage.description" })}
        className="h-24"
      />

      <Input
        label={intl.formatMessage({ id: "admin.manage.price" })}
        value={formData.price?.toString() || "0"}
        onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) || 0 })}
        placeholder="0.00"
      />

      <Input
        label={intl.formatMessage({ id: "admin.manage.category" })}
        value={formData.category || ""}
        onChangeText={(text) => setFormData({ ...formData, category: text })}
        placeholder="electronics, clothing, etc."
      />

      <Input
        label={intl.formatMessage({ id: "admin.manage.imageUrl" })}
        value={formData.imageUrl || ""}
        onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
        placeholder="https://example.com/image.jpg"
      />

      <Input
        label={intl.formatMessage({ id: "admin.manage.stock" })}
        value={formData.stock?.toString() || "0"}
        onChangeText={(text) => setFormData({ ...formData, stock: parseInt(text) || 0 })}
        placeholder="0"
      />

      <Button
        title={isEditing 
          ? intl.formatMessage({ id: "admin.manage.update" })
          : intl.formatMessage({ id: "admin.manage.create" })
        }
        onPress={handleSubmit}
        loading={mutation.isPending}
        className="mt-6 mb-12"
      />
    </ScrollView>
  );
}
