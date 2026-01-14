import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Image as RNImage, Dimensions } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import { Product } from "@shared/schema";
import { Input } from "../../components/ui/Input";
import { Search, Bell, Heart, SlidersHorizontal } from "lucide-react-native";
import { FormattedMessage, useIntl } from "react-intl";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // px-6 is 24px each side -> 48px total

// Dummy Categories based on screenshot
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "electronics", label: "Electronics" },
  { id: "fashion", label: "Fashion" },
  { id: "home", label: "Home" },
  { id: "books", label: "Books" },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory, searchQuery],
    queryFn: async () => {
      const params: any = {};
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      
      const res = await api.get("/products", { params });
      return res.data;
    },
  });

  const renderProductCard = ({ item, index }: { item: Product, index: number }) => (
    <TouchableOpacity 
      className="bg-card rounded-3xl overflow-hidden mb-6 shadow-sm border border-border/50"
      style={{ width: CARD_WIDTH }}
    >
      <View className="h-48 bg-muted relative">
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : { uri: "https://images.unsplash.com/photo-1523275335684-37898b6baf30" }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
        <TouchableOpacity className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full items-center justify-center">
           <Heart size={16} color="#ef4444" fill="#ef4444" />
        </TouchableOpacity>
        {/* NEW Badge Logic - Optional */}
        {index % 3 === 0 && (
          <View className="absolute bottom-3 left-3 bg-[#6366f1] px-2 py-1 rounded-md">
            <Text className="text-white text-[10px] font-bold">NEW</Text>
          </View>
        )}
      </View>
      
      <View className="p-4">
        <Text className="text-foreground font-bold text-base mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-[#fbbf24] font-bold text-base mb-1">
          ${Number(item.price).toFixed(2)}
        </Text>
        <Text className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
           {item.category?.toUpperCase() || "COLLECTION"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center">
          <View>
            <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase mb-1">
              Discover
            </Text>
            <Text className="text-white text-3xl font-bold">
              Catalog
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border">
             <Bell size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6">
           <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-12">
              <Search size={20} color="#94a3b8" />
              <Input 
                 value={searchQuery}
                 onChangeText={setSearchQuery}
                 placeholder="Search for premium products..."
                 className="flex-1 mb-0 border-0 bg-transparent"
                 // @ts-ignore - passing custom style helper via className prop hack or need to refactor input
                 // Actually Input component has styles we might fight. 
                 // Let's use raw TextInput here for perfect custom look or refactor Input.
                 // Using raw TextInput for "Search" specific look as per design
              />
              <View className="w-px h-6 bg-border mx-2" />
              <SlidersHorizontal size={20} color="#6366f1" />
           </View>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`mr-3 px-5 py-2.5 rounded-full ${
                  selectedCategory === category.id
                    ? "bg-[#6366f1]" // Indigo-500
                    : "bg-card border border-border"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    selectedCategory === category.id ? "text-white" : "text-muted-foreground"
                  }`}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* New Arrivals & List */}
        <View className="flex-1 px-6">
           <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">New Arrivals</Text>
              <TouchableOpacity>
                 <Text className="text-[#6366f1] text-xs font-bold">View All</Text>
              </TouchableOpacity>
           </View>

           {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : (
            <FlatList
              data={products} // In a real app, maybe slice for "New Arrivals" or dedicated endpoint
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              showsVerticalScrollIndicator={false}
              renderItem={renderProductCard}
              ListFooterComponent={<View className="h-20" />}
              ListEmptyComponent={
                <View className="mt-10 items-center">
                  <Text className="text-muted-foreground">No products found</Text>
                </View>
              }
            />
          )}
        </View>

      </SafeAreaView>
    </View>
  );
}
