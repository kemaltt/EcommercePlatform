import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Package,
  Clock,
  Box,
  Filter,
  Edit,
  Settings,
} from "lucide-react-native";
import { useTheme } from "../../../contexts/theme-context";
import { api } from "../../../lib/api";
import { Order } from "@shared/schema";
import { format } from "date-fns";
import { tr, de, enUS } from "date-fns/locale";

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await api.get("/admin/orders");
      return res.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-500 bg-green-500/10";
      case "shipped":
        return "text-blue-500 bg-blue-500/10";
      case "cancelled":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-yellow-500 bg-yellow-500/10";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return intl.formatMessage({ id: "orders.status.delivered" });
      case "shipped":
        return intl.formatMessage({ id: "orders.status.shipped" });
      case "cancelled":
        return intl.formatMessage({ id: "orders.status.cancelled" });
      case "paid":
        return intl.formatMessage({ id: "orders.status.paid" });
      default:
        return intl.formatMessage({ id: "orders.status.pending" });
    }
  };

  const getDateLocale = () => {
    const locale = intl.locale.split("-")[0];
    switch (locale) {
      case "tr":
        return tr;
      case "de":
        return de;
      default:
        return enUS;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-border/10 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
            >
              <ChevronLeft size={24} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">
              <FormattedMessage id="admin.orders.title" />
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-card items-center justify-center">
            <Filter size={20} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator
                size="large"
                color={isDark ? "#818cf8" : "#4f46e5"}
              />
            </View>
          ) : orders && orders.length > 0 ? (
            <View className="gap-4">
              {orders.map((order) => {
                const statusStyle = getStatusColor(order.status);
                const statusColor =
                  order.status === "delivered"
                    ? "text-green-500 bg-green-500/10"
                    : order.status === "shipped"
                      ? "text-blue-500 bg-blue-500/10"
                      : order.status === "cancelled"
                        ? "text-red-500 bg-red-500/10"
                        : "text-yellow-500 bg-yellow-500/10";

                return (
                  <View
                    key={order.id}
                    className="bg-card border border-border/50 rounded-3xl p-5 mb-4"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-base mb-1">
                          #{order.orderNumber}
                        </Text>
                        <Text className="text-muted-foreground text-xs">
                          {format(
                            new Date(order.createdAt),
                            "dd MMM yyyy, HH:mm",
                            { locale: getDateLocale() },
                          )}
                        </Text>
                      </View>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() =>
                            router.push(`/admin/orders/${order.id}`)
                          }
                          className="w-9 h-9 bg-primary/10 rounded-xl items-center justify-center"
                        >
                          <Edit
                            size={18}
                            color={isDark ? "#818cf8" : "#4f46e5"}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            router.push(`/admin/orders/manage/${order.id}`)
                          }
                          className="w-9 h-9 bg-primary/10 rounded-xl items-center justify-center"
                        >
                          <Settings
                            size={18}
                            color={isDark ? "#818cf8" : "#4f46e5"}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-3 border-t border-border/30">
                      <View
                        className={`px-3 py-1.5 rounded-full ${statusColor.split(" ")[1]}`}
                      >
                        <Text
                          className={`text-xs font-bold capitalize ${statusColor.split(" ")[0]}`}
                        >
                          <FormattedMessage
                            id={`orders.status.${order.status}`}
                            defaultMessage={order.status}
                          />
                        </Text>
                      </View>
                      <Text className="text-foreground font-bold text-lg">
                        ${Number(order.total).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center justify-center py-20 opacity-70">
              <View className="w-24 h-24 bg-secondary rounded-full items-center justify-center mb-6">
                <Box size={40} color={isDark ? "#94a3b8" : "#64748b"} />
              </View>
              <Text className="text-foreground font-bold text-xl mb-2 text-center">
                No Orders found
              </Text>
              <Text className="text-muted-foreground text-center px-10 leading-6">
                No orders have been placed yet.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
