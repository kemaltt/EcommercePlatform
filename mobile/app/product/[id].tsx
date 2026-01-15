import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { api } from "../../lib/api";
import { Product } from "@shared/schema";
import { Button } from "../../components/ui/Button";
import { useFavorites } from "../../hooks/use-favorites";


import { ArrowLeft, Star, ShoppingBag, ShieldCheck, Heart, Truck, CheckCircle, Plus, Minus } from "lucide-react-native";
import { FormattedMessage, useIntl } from "react-intl";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/use-auth";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useTheme } from "../../contexts/theme-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, cartItems, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const intl = useIntl();
  const [selectedSize, setSelectedSize] = useState("M");
  const [isAdded, setIsAdded] = useState(false);
  const { isDark } = useTheme();

  // Find if item is in cart
  // id from params is string, productId is number
  const cartItem = cartItems.find(item => item.productId === Number(id));

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
  });

  const handleAddToCart = async () => {
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
       await addToCart(product);
       setIsAdded(true);
       setTimeout(() => setIsAdded(false), 2000);
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
      <StatusBar style={isDark ? "light" : "dark"} />
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
            onPress={() => product && toggleFavorite(product)}
            className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
          >
            <Heart 
              size={24} 
              color={product && isFavorite(product.id) ? "#ef4444" : "white"} 
              fill={product && isFavorite(product.id) ? "#ef4444" : "transparent"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet Details */}
      <View 
        className="flex-1 bg-card -mt-10 rounded-t-[40px] px-6 pt-8 pb-8"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 }}
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
            <Text className="text-3xl font-bold text-foreground mb-2 leading-tight">
              {product.name}
            </Text>
            <Text className="text-2xl font-bold text-foreground mb-4">
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
                   <Text className={`font-bold ${selectedSize === size ? "text-white" : "text-foreground"}`}>
                     {size}
                   </Text>
                 </TouchableOpacity>
               ))}
            </View>
            
            {/* Add to Cart & Actions */}
            <View className="flex-row items-center gap-4 mb-8">
               <TouchableOpacity onPress={() => router.push("/(tabs)/cart")} className="w-14 h-14 bg-card rounded-2xl items-center justify-center border border-border">
                  <ShoppingBag size={24} color="#94a3b8" />
                  {cartItems.length > 0 && (
                    <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
               </TouchableOpacity>
               
               {cartItem ? (
                 <View className="flex-1 h-14 bg-card border border-border rounded-2xl flex-row items-center justify-between px-2">
                     <TouchableOpacity 
                       className={`w-10 h-10 rounded-xl items-center justify-center ${isDark ? 'bg-[#2c2e3e]' : 'bg-secondary'}`}
                       onPress={() => cartItem.quantity > 1 ? updateQuantity(cartItem.id, cartItem.quantity - 1) : removeFromCart(cartItem.id)}
                     >
                       <Minus size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                     </TouchableOpacity>
                     
                     <View className="items-center">
                        <Text className="text-foreground font-bold text-base">{cartItem.quantity} in Cart</Text>
                     </View>
 
                     <TouchableOpacity 
                       className="w-10 h-10 bg-primary rounded-xl items-center justify-center"
                       onPress={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                     >
                       <Plus size={20} color="white" />
                     </TouchableOpacity>
                 </View>
               ) : (
                 <Button
                   title={isAdded ? "Added to Cart!" : "Add to Cart"}
                   onPress={handleAddToCart}
                   variant={isAdded ? "success" : "primary"}
                   className={`flex-1 h-14 rounded-2xl ${isAdded ? "bg-green-500" : ""}`}
                   disabled={product.stock === 0 || isAdded}
                   icon={isAdded ? <CheckCircle size={20} color="white" /> : undefined}
                 />
               )}
            </View>
            
            {/* Footer Badges */}
            <View className="flex-row justify-between mb-4 bg-card p-4 rounded-2xl border border-border/50">
               <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 bg-[#fbbf24]/20 rounded-full items-center justify-center">
                     <Truck size={16} color="#fbbf24" />
                  </View>
                   <View>
                      <Text className="text-foreground text-[10px] font-bold uppercase">Free 2-Day</Text>
                      <Text className="text-muted-foreground text-[10px] font-bold uppercase">Shipping</Text>
                   </View>
               </View>
               
               <View className="w-px bg-border h-full" />

               <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 bg-[#fbbf24]/20 rounded-full items-center justify-center">
                     <CheckCircle size={16} color="#fbbf24" />
                  </View>
                    <View>
                      <Text className="text-foreground text-[10px] font-bold uppercase">Lifetime</Text>
                      <Text className="text-muted-foreground text-[10px] font-bold uppercase">Warranty</Text>
                   </View>
               </View>
            </View>
            
         </ScrollView>
      </View>
    </View>
  );
}
