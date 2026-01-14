import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { api } from "../../lib/api";
import { Product } from "@shared/schema";
import { Button } from "../../components/ui/Button";
import { useCart } from "../../hooks/use-cart";
import { ArrowLeft, Star, ShoppingBag, ShieldCheck } from "lucide-react-native";
import { FormattedMessage, useIntl } from "react-intl";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const intl = useIntl();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-xl">Product not found</Text>
        <Button 
          title={intl.formatMessage({ id: "product.details.back" })} 
          onPress={() => router.back()} 
          className="mt-4" 
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1">
        <View className="relative">
          <Image
            source={product.imageUrl}
            className="w-full aspect-square"
            contentFit="cover"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-6 bg-white/90 p-3 rounded-full shadow-lg"
          >
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View className="p-6 bg-background rounded-t-[40px] -mt-10 pb-20">
          <View className="flex-row justify-between items-center mb-4">
            <View className="bg-primary/10 px-4 py-1.5 rounded-full">
              <Text className="text-primary font-bold uppercase text-xs tracking-widest">
                {product.category}
              </Text>
            </View>
            <View className="flex-row items-center bg-yellow-400/10 px-3 py-1 rounded-full">
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
              <Text className="ml-1.5 font-bold text-yellow-700">
                {product.rating?.toFixed(1) || "5.0"}
              </Text>
            </View>
          </View>

          <Text className="text-3xl font-extrabold text-foreground mb-4">
            {product.name}
          </Text>

          <Text className="text-muted-foreground text-lg leading-7 mb-8">
            {product.description}
          </Text>

          <View className="flex-row items-center mb-8 space-x-6">
            <View className="flex-row items-center">
              <View className="bg-green-100 p-2 rounded-lg mr-3">
                <ShoppingBag size={20} color="#059669" />
              </View>
              <Text className="text-sm font-semibold text-muted-foreground">Original</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-2 rounded-lg mr-3">
                <ShieldCheck size={20} color="#2563eb" />
              </View>
              <Text className="text-sm font-semibold text-muted-foreground">Warranty</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-6 bg-background/80 flex-row items-center border-t border-border">
        <View className="flex-1">
          <Text className="text-muted-foreground font-medium">
            <FormattedMessage id="product.details.price" />
          </Text>
          <Text className="text-3xl font-black text-primary">${product.price.toFixed(2)}</Text>
        </View>
        <Button
          title={intl.formatMessage({ id: "product.details.addToCart" })}
          onPress={() => addToCart(product)}
          className="flex-[1.5]"
          disabled={product.stock === 0}
        />
      </View>
    </View>
  );
}
