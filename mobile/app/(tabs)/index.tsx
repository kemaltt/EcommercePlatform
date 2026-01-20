import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import { Product, Notification } from "@shared/schema";
import { Input } from "../../components/ui/Input";
import {
  Search,
  Bell,
  Heart,
  SlidersHorizontal,
  ChevronRight,
  User,
  X,
  Star,
} from "lucide-react-native";
import { FormattedMessage, useIntl } from "react-intl";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/use-auth";
import { useFavorites } from "../../hooks/use-favorites";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/theme-context";
import * as Haptics from "expo-haptics";
import { FilterModal } from "../../components/FilterModal";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // px-6 is 24px each side -> 48px total

// Categories will be localized dynamically

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const { user } = useAuth();
  const router = useRouter();
  const { isDark } = useTheme();

  // Filter state
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    minRating: undefined as number | undefined,
    sortBy: "newest",
  });

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory, searchQuery, activeFilters],
    queryFn: async () => {
      const params: any = {
        ...activeFilters,
      };
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get("/products", { params });
      return res.data;
    },
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data;
    },
    enabled: !!user,
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const { toggleFavorite, isFavorite } = useFavorites();

  const handleAuthProtectedAction = (product: Product) => {
    if (!user) {
      Alert.alert(
        intl.formatMessage({ id: "home.loginRequired.title" }),
        intl.formatMessage({ id: "home.loginRequired.message" }),
        [
          {
            text: intl.formatMessage({ id: "common.cancel" }),
            style: "cancel",
          },
          {
            text: intl.formatMessage({ id: "auth.register.login" }),
            onPress: () => router.push("/(auth)/login"),
          },
        ],
      );
    } else {
      toggleFavorite(product);
    }
  };

  const renderProductCard = ({
    item,
    index,
  }: {
    item: Product;
    index: number;
  }) => (
    <TouchableOpacity
      className="bg-card rounded-3xl overflow-hidden mb-6 shadow-sm border border-border/50"
      style={{ width: CARD_WIDTH }}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View className="h-48 bg-muted relative">
        <Image
          source={item.imageUrl}
          placeholder={{
            uri: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=10&w=200",
          }} // Low-res blur placeholder
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={300}
          recyclingKey={item.id.toString()}
          priority="high"
          onLoad={() => {
            if (__DEV__ && !item.imageUrl) {
              console.warn(
                `[ImageLoad] Missing imageUrl for product: ${item.name}`,
              );
            }
          }}
          onError={() => {
            if (__DEV__) {
              console.warn(
                `[ImageLoad] Failed to load image for: ${item.name}, URL: ${item.imageUrl}`,
              );
            }
          }}
        />
        <TouchableOpacity
          className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full items-center justify-center"
          onPress={() => handleAuthProtectedAction(item)}
        >
          <Heart
            size={16}
            color={isFavorite(item.id) ? "#ef4444" : "#cbd5e1"}
            fill={isFavorite(item.id) ? "#ef4444" : "transparent"}
          />
        </TouchableOpacity>
        {/* NEW Badge Logic - Optional */}
        {index % 3 === 0 && (
          <View className="absolute bottom-3 left-3 bg-[#6366f1] px-2 py-1 rounded-md">
            <Text className="text-white text-[10px] font-bold">
              {intl.formatMessage({ id: "home.newBadge" })}
            </Text>
          </View>
        )}
      </View>

      <View className="p-4">
        <Text className="text-[#fbbf24] font-bold text-base mb-1">
          ${Number(item.price).toFixed(2)}
        </Text>
        <View className="flex-row items-center gap-2 mb-2">
          <View
            className={`w-1.5 h-1.5 rounded-full ${item.stock > 5 ? "bg-green-500" : item.stock > 0 ? "bg-orange-500" : "bg-red-500"}`}
          />
          <Text
            className={`text-[10px] font-bold ${item.stock > 0 ? "text-muted-foreground/60" : "text-red-500"}`}
          >
            {item.stock > 0 ? (
              <FormattedMessage
                id="product.stock.available"
                values={{ count: item.stock }}
              />
            ) : (
              <FormattedMessage id="product.details.outOfStock" />
            )}
          </Text>
        </View>
        <Text className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
          {item.category?.toUpperCase() || "COLLECTION"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center">
          <View>
            <Text className="text-foreground text-3xl font-bold">
              {intl.formatMessage({ id: "home.catalog" })}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border relative"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/notifications");
              }}
            >
              <Bell size={20} color={isDark ? "white" : "black"} />
              {unreadCount > 0 && (
                <View
                  className="absolute top-0 right-0 bg-red-500 rounded-full items-center justify-center border-2"
                  style={{
                    borderColor: isDark ? "#1e2029" : "#ffffff",
                    width: 14,
                    height: 14,
                  }}
                >
                  <View className="w-1.5 h-1.5 rounded-full bg-white" />
                </View>
              )}
            </TouchableOpacity>

            {user && (
              <TouchableOpacity
                className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border overflow-hidden"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/profile");
                }}
              >
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <User size={20} color={isDark ? "white" : "black"} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6">
          {/* Custom Search Input Appearance matching Image 1 */}
          <View
            className="flex-row items-center bg-card rounded-2xl px-4 border border-border/50"
            style={{ height: 56 }}
          >
            <Search size={22} color={isDark ? "#94a3b8" : "#64748b"} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={intl.formatMessage({
                id: "home.search.placeholder",
              })}
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              className="flex-1 ml-3 px-2 text-base text-foreground font-medium"
              style={{ paddingVertical: 12 }}
              textAlignVertical="center"
            />
            <TouchableOpacity
              className="mr-1"
              onPress={() => setIsFilterModalVisible(true)}
            >
              <SlidersHorizontal size={22} color="#6366f1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filter Tags */}
        {(activeFilters.minPrice ||
          activeFilters.maxPrice ||
          activeFilters.minRating ||
          activeFilters.sortBy !== "newest") && (
          <View className="px-6 mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              <Text
                className={`text-xs font-bold mr-2 self-center ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {intl.formatMessage({ id: "filter.active" })}:
              </Text>
              {activeFilters.minPrice && (
                <TouchableOpacity
                  onPress={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      minPrice: undefined,
                    }))
                  }
                  className="bg-primary/10 px-3 py-1 rounded-full mr-2 flex-row items-center border border-primary/20"
                >
                  <Text className="text-primary text-[10px] font-bold">
                    Min: ${activeFilters.minPrice}
                  </Text>
                  <X size={12} color="#6366f1" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
              {activeFilters.maxPrice && (
                <TouchableOpacity
                  onPress={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      maxPrice: undefined,
                    }))
                  }
                  className="bg-primary/10 px-3 py-1 rounded-full mr-2 flex-row items-center border border-primary/20"
                >
                  <Text className="text-primary text-[10px] font-bold">
                    Max: ${activeFilters.maxPrice}
                  </Text>
                  <X size={12} color="#6366f1" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
              {activeFilters.minRating && (
                <TouchableOpacity
                  onPress={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      minRating: undefined,
                    }))
                  }
                  className="bg-primary/10 px-3 py-1 rounded-full mr-2 flex-row items-center border border-primary/20"
                >
                  <Star
                    size={10}
                    fill="#6366f1"
                    color="#6366f1"
                    style={{ marginRight: 2 }}
                  />
                  <Text className="text-primary text-[10px] font-bold">
                    {activeFilters.minRating}+
                  </Text>
                  <X size={12} color="#6366f1" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
              {activeFilters.sortBy !== "newest" && (
                <TouchableOpacity
                  onPress={() =>
                    setActiveFilters((prev) => ({ ...prev, sortBy: "newest" }))
                  }
                  className="bg-primary/10 px-3 py-1 rounded-full mr-2 flex-row items-center border border-primary/20"
                >
                  <Text className="text-primary text-[10px] font-bold">
                    {intl.formatMessage({
                      id: `filter.sort.${activeFilters.sortBy}`,
                    })}
                  </Text>
                  <X size={12} color="#6366f1" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {["all", "electronics", "fashion", "home", "books"].map(
              (categoryId) => (
                <TouchableOpacity
                  key={categoryId}
                  onPress={() => setSelectedCategory(categoryId)}
                  className={`mr-3 px-5 py-2.5 rounded-full ${
                    selectedCategory === categoryId
                      ? "bg-[#6366f1]" // Indigo-500
                      : "bg-card border border-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selectedCategory === categoryId
                        ? "text-white"
                        : "text-muted-foreground"
                    }`}
                  >
                    {intl.formatMessage({ id: `category.${categoryId}` })}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </ScrollView>
        </View>

        {/* New Arrivals & List */}
        <View className="flex-1 px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-foreground text-lg font-bold">
              {intl.formatMessage({ id: "home.section.newArrivals" })}
            </Text>
            <TouchableOpacity>
              <Text className="text-[#6366f1] text-xs font-bold">
                {intl.formatMessage({ id: "home.viewAll" })}
              </Text>
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
                  <Text className="text-muted-foreground">
                    {intl.formatMessage({ id: "home.noProducts" })}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        currentFilters={activeFilters}
        onApply={(filters) => {
          setActiveFilters((prev) => ({
            ...prev,
            ...filters,
          }));
        }}
      />
    </View>
  );
}
