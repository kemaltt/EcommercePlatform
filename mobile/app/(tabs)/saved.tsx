
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFavorites } from "../../hooks/use-favorites";
import { useCart } from "../../hooks/use-cart";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ShoppingCart, Heart, ArrowLeft, ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Button } from "../../components/ui/Button";

export default function SavedScreen() {
  const { favorites, isLoading, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View className="flex-1 bg-background px-6 pt-12">
        <View className="flex-1 justify-center items-center">
            <View className="bg-card w-24 h-24 rounded-full items-center justify-center mb-6 border border-border">
            <Heart size={40} color="#6366f1" />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">
            Your Wishlist is Empty
            </Text>
            <Text className="text-muted-foreground text-center mb-8 max-w-[250px]">
            Start exploring and add items to your wishlist.
            </Text>
            <Button 
            title="Start Exploring"
            onPress={() => router.push("/(tabs)")} 
            className="w-full max-w-xs h-14 rounded-2xl"
            />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-background z-10">
           <TouchableOpacity 
             onPress={() => router.back()}
             className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border"
           >
              <ChevronLeft size={20} color="#94a3b8" />
           </TouchableOpacity>
           
           <Text className="text-xl font-bold text-foreground">Your Wishlist</Text>

           <View className="w-10 h-10 items-center justify-center">
              <Heart size={24} color="white" fill="white" />
              <View className="absolute top-0 right-0 bg-[#6366f1] w-4 h-4 rounded-full items-center justify-center border border-background">
                 <Text className="text-[9px] font-bold text-white">{favorites.length}</Text>
              </View>
           </View>
        </View>

        <View className="px-6 py-2 flex-row justify-between items-center">
           <Text className="text-muted-foreground text-sm">{favorites.length} Items in Wishlist</Text>
           {/* "Move all to cart" button explicitly removed as per request */}
        </View>

        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
                onPress={() => router.push(`/product/${item.id}`)}
                className="flex-row bg-card rounded-3xl p-3 border border-border mb-4"
            >
              {/* Image */}
              <View className="bg-background rounded-2xl h-24 w-24 overflow-hidden mr-4 relative">
                 <Image
                   source={item.imageUrl ? { uri: item.imageUrl } : undefined}
                   style={{ width: "100%", height: "100%" }}
                   contentFit="cover"
                 />
              </View>

              {/* Details */}
              <View className="flex-1 justify-between py-1">
                 <View>
                     <View className="flex-row justify-between items-start">
                        <Text className="text-white font-bold text-base flex-1 mr-2" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => toggleFavorite(item)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                           <Heart size={18} color="#6366f1" fill="#6366f1" />
                        </TouchableOpacity>
                     </View>
                     <Text className="text-muted-foreground text-xs mt-1">
                        {item.category}
                     </Text>
                 </View>
                 
                 <View className="flex-row justify-between items-end mt-2">
                    <Text className="text-white text-lg font-bold">
                       ${Number(item.price).toFixed(2)}
                    </Text>
                    
                    <TouchableOpacity 
                       className="bg-[#334155] flex-row items-center px-3 py-2 rounded-xl"
                       onPress={() => addToCart(item)}
                    >
                        <ShoppingCart size={14} color="white" className="mr-2" />
                        <Text className="text-white text-xs font-bold ml-1">Add</Text>
                    </TouchableOpacity>
                 </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </View>
  );
}
