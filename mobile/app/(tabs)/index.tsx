import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import { Product } from "@shared/schema";
import { ProductCard } from "../../components/ProductCard";
import { Input } from "../../components/ui/Input";
import { Search } from "lucide-react-native";
import { FormattedMessage, useIntl } from "react-intl";

const CATEGORIES = ["all", "electronics", "clothing", "home", "books"];

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

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <View className="relative">
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={intl.formatMessage({ id: "home.search.placeholder" })}
            className="mb-0"
          />
          <View className="absolute right-4 top-4">
            <Search size={20} color="#9ca3af" />
          </View>
        </View>
      </View>

      <View className="py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`mr-3 px-6 py-2 rounded-full border ${
                selectedCategory === category
                  ? "bg-primary border-primary"
                  : "bg-transparent border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  selectedCategory === category ? "text-white" : "text-foreground"
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="w-8" />
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-muted-foreground text-lg">
                <FormattedMessage id="home.noProducts" />
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
