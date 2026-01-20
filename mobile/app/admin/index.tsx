import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import {
  ChevronLeft,
  Bell,
  User,
  Package,
  Users,
  ChevronRight,
  Plus,
  Box,
} from "lucide-react-native";
import { useAuth } from "../../hooks/use-auth";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "../../contexts/theme-context";
import { useIntl } from "react-intl";

const { width } = Dimensions.get("window");

export default function AdminConsoleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const intl = useIntl();

  const { data: stats, refetch } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Mock Data for Chart
  const lineChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 40, 95, 10],
        strokeWidth: 2, // optional
      },
    ],
  };

  const ManagementCard = ({ title, count, subtitle, icon, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-card p-5 rounded-3xl flex-1 border border-border/50"
    >
      <View className="w-10 h-10 bg-[#6366f1]/20 rounded-xl items-center justify-center mb-4">
        {icon}
      </View>
      <Text className="text-foreground font-bold text-lg mb-1">{title}</Text>
      <Text className="text-muted-foreground text-xs font-bold mb-4">
        {count} {subtitle}
      </Text>

      <View className="flex-row items-center">
        <Text className="text-[#6366f1] text-xs font-bold mr-1">
          {intl.formatMessage({ id: "admin.manage" })}
        </Text>
        <ChevronRight size={12} color="#6366f1" />
      </View>
    </TouchableOpacity>
  );

  const ActiveInventoryItem = ({ image, title, stock, price }: any) => (
    <View className="bg-card p-3 rounded-[30px] mb-3 flex-row items-center border border-border/50">
      <View className="w-16 h-16 bg-background rounded-2xl mr-4 overflow-hidden items-center justify-center p-1 border border-border/50">
        {/* Placeholder for image - using Box icon since we don't have actual asset here easily */}
        <Package size={30} color="#6366f1" />
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-bold text-base mb-1">
          {title}
        </Text>
        <Text className="text-muted-foreground text-xs">
          {intl.formatMessage({ id: "admin.stock" })}: {stock} • Ref: #7721
        </Text>
        <Text className="text-primary font-bold mt-1">${price}</Text>
      </View>
      <View className="flex-row gap-4 mr-1">
        <TouchableOpacity hitSlop={10}>
          <Plus size={20} color={isDark ? "#94a3b8" : "#64748b"} />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={10}>
          <Box size={20} color={isDark ? "#94a3b8" : "#64748b"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-background">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border mr-4"
            >
              <ChevronLeft size={20} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
            <View>
              <Text className="text-foreground text-lg font-bold">
                {intl.formatMessage({ id: "admin.console.title" })}
              </Text>
              <Text className="text-primary text-xs font-bold">
                {intl.formatMessage({ id: "admin.console.overview" })}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 items-center justify-center relative">
              <Bell size={20} color={isDark ? "#e2e8f0" : "#475569"} />
              <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-[#fbbf24] rounded-full items-center justify-center"
              onPress={() => router.back()}
            >
              <User size={20} color="#1e293b" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-foreground font-bold text-lg mb-4">
            {intl.formatMessage({ id: "admin.management" })}
          </Text>
          <View className="flex-row mb-4">
            <View className="flex-1 mr-4">
              <ManagementCard
                title={intl.formatMessage({ id: "admin.products" })}
                count={stats?.totalProducts || "0"}
                subtitle={intl.formatMessage({ id: "admin.products.total" })}
                icon={<Package size={20} color="#6366f1" />}
                onPress={() => router.push("/admin/products")}
              />
            </View>
            <View className="flex-1">
              <ManagementCard
                title={intl.formatMessage({ id: "admin.users" })}
                count={stats?.totalUsers || "0"}
                subtitle={intl.formatMessage({ id: "admin.users.count" })}
                icon={<Users size={20} color="#6366f1" />}
                onPress={() => router.push("/admin/users")}
              />
            </View>
          </View>

          <View className="mb-4 flex-row">
            <View className="flex-1 mr-4">
              <ManagementCard
                title={intl.formatMessage({ id: "admin.orders.title" })}
                count={stats?.totalOrders || "0"}
                subtitle={intl.formatMessage({ id: "admin.menu.orders" })}
                icon={<Box size={20} color="#6366f1" />}
                onPress={() => router.push("/admin/orders")}
              />
            </View>
            <View className="flex-1">
              <ManagementCard
                title={intl.formatMessage({ id: "admin.coupons.title" })}
                count={stats?.totalCoupons || "0"}
                subtitle={intl.formatMessage({ id: "admin.coupons.manage" })}
                icon={<Box size={20} color="#6366f1" />}
                onPress={() => router.push("/admin/coupons")}
              />
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-foreground font-bold text-lg">
              {intl.formatMessage({ id: "admin.salesVelocity" })}
            </Text>
            <View className="flex-row bg-card rounded-lg p-0.5 border border-border/50">
              <TouchableOpacity className="px-3 py-1 bg-background rounded-md shadow-sm">
                <Text className="text-foreground text-xs font-bold">
                  {intl.formatMessage({ id: "admin.period.week" })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-3 py-1">
                <Text className="text-muted-foreground text-xs font-bold">
                  {intl.formatMessage({ id: "admin.period.month" })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-card rounded-3xl p-4 mb-8 border border-border/50 items-center">
            <LineChart
              data={lineChartData}
              width={width - 80}
              height={180}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: isDark ? "#1f2937" : "#f8fafc",
                backgroundGradientFrom: isDark ? "#1f2937" : "#f8fafc",
                backgroundGradientTo: isDark ? "#1f2937" : "#f8fafc",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: (opacity = 1) =>
                  isDark
                    ? `rgba(148, 163, 184, ${opacity})`
                    : `rgba(71, 85, 105, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "0",
                },
                propsForBackgroundLines: {
                  strokeDasharray: "", // solid lines
                  stroke: isDark ? "#334155" : "#e2e8f0",
                  strokeWidth: 1,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              withVerticalLines={false}
              withHorizontalLines={false}
            />
            <View className="flex-row justify-between w-full px-4 mt-2">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                (day, i) => (
                  <Text
                    key={i}
                    className="text-muted-foreground text-[10px] font-bold"
                  >
                    {day}
                  </Text>
                ),
              )}
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-foreground font-bold text-lg">
              {intl.formatMessage({ id: "admin.activeInventory" })}
            </Text>
            <TouchableOpacity>
              <Text className="text-muted-foreground text-xs flex-row items-center">
                {intl.formatMessage({ id: "admin.seeAll" })}{" "}
                <ChevronRight size={10} />
              </Text>
            </TouchableOpacity>
          </View>

          <ActiveInventoryItem
            title="Leather Weekend Bag"
            stock={12}
            price="320.00"
          />
          <ActiveInventoryItem
            title="Indigo Denim Jacket"
            stock={48}
            price="185.00"
          />

          <View className="h-20" />
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          className="absolute bottom-8 right-6 w-14 h-14 bg-[#6366f1] rounded-full items-center justify-center shadow-lg shadow-indigo-500/50 z-50"
          onPress={() => router.push("/admin/manage-product")}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
