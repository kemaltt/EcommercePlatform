import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { api } from "../../lib/api";
import { Product } from "@shared/schema";
import { Button } from "../../components/ui/Button";
import { useCart } from "../../hooks/use-cart";
import { ArrowLeft, Star, ShoppingBag, ShieldCheck, Heart, Truck, CheckCircle } from "lucide-react-native";
import { FormattedMessage, useIntl } from "react-intl";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/use-auth";
import { useState } from "react";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const intl = useIntl();
  const [selectedSize, setSelectedSize] = useState("M");

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
  });

  const handleAddToCart = () => {
     if (!user) {
        Alert.alert(
          "Login Required",
          "Please login to add items to your cart",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Login", onPress: () => router.push("/(auth)/login") }
          ]
        );
        return;
     }
     
     if (product) {
       addToCart(product);
       Alert.alert("Success", "Added to cart!");
     }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-xl text-foreground">Product not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          className="mt-4" 
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background relative">
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Hero Image - Takes up top portion */}
      <View className="relative w-full" style={{ height: SCREEN_HEIGHT * 0.55 }}>
        <Image
          source={product.imageUrl ? { uri: product.imageUrl } : { uri: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop" }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
        
        {/* Navigation Overlays */}
        <View className="absolute top-12 left-6 right-6 flex-row justify-between items-center z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
          >
            <Heart size={24} color="white" fill="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet Details */}
      <View 
        className="flex-1 bg-[#1e2029] -mt-10 rounded-t-[40px] px-6 pt-8 pb-8"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.3, shadowRadius: 20 }}
      >
         <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Tag & Rating */}
            <View className="flex-row justify-between items-center mb-4">
               <View className="bg-[#fbbf24]/20 px-3 py-1.5 rounded-lg border border-[#fbbf24]/30">
                 <Text className="text-[#fbbf24] font-bold text-[10px] tracking-widest uppercase">
                    Limited Edition
                 </Text>
               </View>
               <View className="flex-row items-center gap-1">
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text className="text-muted-foreground text-sm font-medium">
                     4.9 <Text className="text-muted-foreground/50">(124 reviews)</Text>
                  </Text>
               </View>
            </View>

            {/* Title & Price */}
            <Text className="text-3xl font-bold text-white mb-2 leading-tight">
              {product.name}
            </Text>
            <Text className="text-2xl font-bold text-white mb-4">
              ${Number(product.price).toFixed(2)}
            </Text>

            {/* Description */}
            <Text className="text-muted-foreground text-sm leading-6 mb-6">
              {product.description || "Crafted from premium materials with a deep finish. This structured silhouette offers a modern take on classic design."}
            </Text>

            {/* Color Palette Placeholder */}
            {/* 
            <Text className="text-white font-bold text-xs uppercase tracking-widest mb-3">Color Palette</Text>
            <View className="flex-row gap-3 mb-6">
                <View className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-white" />
                <View className="w-8 h-8 rounded-full bg-[#475569]" />
                <View className="w-8 h-8 rounded-full bg-[#94a3b8]" />
            </View>
            */}

            {/* Size Selector */}
            <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-3 mt-2">
               Select Size
            </Text>
            <View className="flex-row gap-3 mb-8">
               {["S", "M", "L", "XL"].map((size) => (
                 <TouchableOpacity 
                   key={size}
                   onPress={() => setSelectedSize(size)}
                   className={`w-12 h-12 rounded-2xl items-center justify-center border ${
                     selectedSize === size 
                       ? "bg-[#6366f1] border-[#6366f1]" 
                       : "bg-card border-border"
                   }`}
                 >
                   <Text className={`font-bold ${selectedSize === size ? "text-white" : "text-white"}`}>
                     {size}
                   </Text>
                 </TouchableOpacity>
               ))}
            </View>
            
            {/* Add to Cart & Actions */}
            <View className="flex-row items-center gap-4 mb-8">
               <TouchableOpacity className="w-14 h-14 bg-card rounded-2xl items-center justify-center border border-border">
                  <ShoppingBag size={24} color="#94a3b8" />
               </TouchableOpacity>
               
               <Button
                 title="Add to Cart"
                 onPress={handleAddToCart}
                 variant="primary"
                 className="flex-1 h-14 rounded-2xl"
                 disabled={product.stock === 0}
               />
            </View>
            
            {/* Footer Badges */}
            <View className="flex-row justify-between mb-4 bg-card p-4 rounded-2xl border border-border/50">
               <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 bg-[#fbbf24]/20 rounded-full items-center justify-center">
                     <Truck size={16} color="#fbbf24" />
                  </View>
                  <View>
                     <Text className="text-white text-[10px] font-bold uppercase">Free 2-Day</Text>
                     <Text className="text-muted-foreground text-[10px] font-bold uppercase">Shipping</Text>
                  </View>
               </View>
               
               <View className="w-px bg-border h-full" />

               <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 bg-[#fbbf24]/20 rounded-full items-center justify-center">
                     <CheckCircle size={16} color="#fbbf24" />
                  </View>
                   <View>
                     <Text className="text-white text-[10px] font-bold uppercase">Lifetime</Text>
                     <Text className="text-muted-foreground text-[10px] font-bold uppercase">Warranty</Text>
                  </View>
               </View>
            </View>
            
         </ScrollView>
      </View>
    </View>
  );
}
