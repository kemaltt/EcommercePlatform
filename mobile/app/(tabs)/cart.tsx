import { View, Text, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useCart } from "../../hooks/use-cart";
import { Button } from "../../components/ui/Button";
import { Trash2, Plus, Minus, ShoppingBag, X, Sparkles, ChevronLeft, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../contexts/theme-context";

export default function CartScreen() {
  const { cartItems, subtotal, updateQuantity, removeFromCart, isLoading } = useCart();
  const router = useRouter();
  const intl = useIntl();
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-6">
        <View className="bg-card w-24 h-24 rounded-full items-center justify-center mb-6 border border-border">
          <ShoppingBag size={40} color="#6366f1" />
        </View>
        <Text className="text-2xl font-bold text-foreground mb-2">
          Your Cart is Empty
        </Text>
        <Text className="text-muted-foreground text-center mb-8 max-w-[250px]">
          Looks like you haven't added anything to your cart yet.
        </Text>
        <Button 
          title="Start Shopping"
          onPress={() => router.push("/(tabs)")} 
          className="w-full max-w-xs h-14 rounded-2xl"
          icon={<ArrowRight size={20} color="white" />}
        />
      </View>
    );
  }

  const freeShippingThreshold = 365.00; // Example threshold
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-background z-10">
          <TouchableOpacity 
             onPress={() => router.back()}
             className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border"
           >
              <ChevronLeft size={20} color={isDark ? "#94a3b8" : "#52525b"} />
           </TouchableOpacity>
           
           <Text className="text-xl font-bold text-foreground">Your Cart</Text>

           <View className="w-10 h-10 items-center justify-center">
              <ShoppingBag size={24} color={isDark ? "white" : "black"} />
              <View className="absolute top-0 right-0 bg-[#6366f1] w-4 h-4 rounded-full items-center justify-center border border-background">
                 <Text className="text-[9px] font-bold text-white">{cartItems.length}</Text>
              </View>
           </View>
        </View>
        
        <ScrollView 
           contentContainerStyle={{ paddingBottom: 180 }}
           showsVerticalScrollIndicator={false}
           className="flex-1 px-6 pt-2"
        >
           {/* Free Shipping Banner */}
           {remainingForFreeShipping > 0 ? (
             <View className="bg-card border border-[#fbbf24]/30 rounded-2xl p-4 mb-6 flex-row items-center justify-center gap-3">
               <Sparkles size={18} color="#fbbf24" fill="#fbbf24" />
               <Text className="text-[#fbbf24] font-bold text-xs uppercase tracking-wider">
                 You're ${remainingForFreeShipping.toFixed(2)} away from free shipping
               </Text>
             </View>
           ) : (
              <View className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 flex-row items-center justify-center gap-3">
               <Sparkles size={18} color="#22c55e" fill="#22c55e" />
               <Text className="text-green-500 font-bold text-xs uppercase tracking-wider">
                 You've unlocked free shipping!
               </Text>
             </View>
           )}

           {/* Cart Items */}
           <View className="space-y-4">
             {cartItems.map((item) => (
               <View key={item.id} className="flex-row bg-card rounded-3xl p-3 border border-border mb-4">
                 {/* Image */}
                 <View className="bg-background rounded-2xl h-24 w-24 overflow-hidden mr-4">
                    <Image
                      source={item.product?.imageUrl ? { uri: item.product.imageUrl } : undefined}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                 </View>

                 {/* Details */}
                 <View className="flex-1 justify-between py-1">
                    <View>
                        <View className="flex-row justify-between items-start">
                           <Text className="text-foreground font-bold text-base flex-1 mr-2" numberOfLines={1}>
                             {item.product?.name || "Product"}
                           </Text>
                           <TouchableOpacity 
                             onPress={() => removeFromCart(item.id)}
                             hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                           >
                              <X size={16} color="#64748b" />
                           </TouchableOpacity>
                        </View>
                        <Text className="text-muted-foreground text-xs mt-1">
                           Size: M | Color: Charcoal
                        </Text>
                    </View>
                    
                    <View className="flex-row justify-between items-end mt-2">
                       <Text className="text-primary text-lg font-bold">
                          ${Number(item.product?.price || 0).toFixed(2)}
                       </Text>
                       
                       {/* Qty Control */}
                       <View className="flex-row items-center bg-[#1e2029] rounded-xl overflow-hidden border border-border/50">
                          <TouchableOpacity 
                            className="w-8 h-8 items-center justify-center bg-secondary"
                            onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                             <Minus size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                          </TouchableOpacity>
                          <View className="w-8 h-8 items-center justify-center">
                             <Text className="text-foreground font-bold text-sm">{item.quantity}</Text>
                          </View>
                          <TouchableOpacity 
                             className="w-8 h-8 items-center justify-center bg-[#6366f1]"
                             onPress={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                             <Plus size={14} color="white" />
                          </TouchableOpacity>
                       </View>
                    </View>
                 </View>
               </View>
             ))}
           </View>

        </ScrollView>
      </SafeAreaView>

       <View className="absolute bottom-0 left-0 right-0 bg-background rounded-t-[32px] p-6 pb-10 border-t border-border shadow-2xl">
          <View className="flex-row justify-between mb-2">
             <Text className="text-muted-foreground text-sm">Subtotal</Text>
             <Text className="text-foreground font-bold text-sm">${subtotal.toFixed(2)}</Text>
          </View>
         <View className="flex-row justify-between mb-6">
            <Text className="text-muted-foreground text-sm">Shipping</Text>
            <Text className="text-green-500 font-bold text-sm">FREE</Text>
         </View>
                  <View className="flex-row justify-between items-center mb-6 pt-4 border-t border-border/50">
              <Text className="text-foreground text-xl font-bold">Total</Text>
              <Text className="text-primary text-2xl font-black">${subtotal.toFixed(2)}</Text>
          </View>

          <Button
            title="Proceed to Checkout"
            onPress={() => Alert.alert("Checkout", "Process started...")}
            variant="primary"
            className="h-14 rounded-2xl"
            icon={<ArrowRight size={20} color="white" />}
          />
      </View>
    </View>
  );
}
