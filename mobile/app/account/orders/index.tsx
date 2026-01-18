import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Package,
  ChevronRight,
  Clock,
  Box,
} from "lucide-react-native";
import { useTheme } from "../../../contexts/theme-context";
import { api } from "../../../lib/api";
import { Order } from "@shared/schema";
import { format } from "date-fns";
import { tr, de, enUS } from "date-fns/locale";

export default function MyOrdersScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
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
        <View className="px-6 py-4 flex-row items-center border-b border-border/10 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
          >
            <ChevronLeft size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">
            <FormattedMessage id="orders.title" />
          </Text>
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

                return (
                  <TouchableOpacity
                    key={order.id}
                    onPress={() => router.push(`/account/orders/${order.id}`)}
                    className="bg-card border border-border/50 rounded-3xl p-5 mb-2 active:opacity-90 transition-opacity"
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                          <Package
                            size={20}
                            color={isDark ? "#818cf8" : "#4f46e5"}
                          />
                        </View>
                        <View>
                          <Text className="text-foreground font-bold text-base">
                            #{order.orderNumber}
                          </Text>
                          <Text className="text-muted-foreground text-xs font-medium">
                            {format(new Date(order.createdAt), "dd MMMM yyyy", {
                              locale: getDateLocale(),
                            })}
                          </Text>
                        </View>
                      </View>
                      <View
                        className={`px-3 py-1.5 rounded-full ${statusStyle.split(" ")[1]}`}
                      >
                        <Text
                          className={`text-xs font-bold capitalize ${statusStyle.split(" ")[0]}`}
                        >
                          {getStatusLabel(order.status)}
                        </Text>
                      </View>
                    </View>

                    <View className="border-t border-border/10 pt-4 flex-row justify-between items-center">
                      <View>
                        <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">
                          TOTAL
                        </Text>
                        <Text className="text-foreground font-bold text-lg">
                          ${order.total.toFixed(2)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        className="flex-row items-center gap-1"
                        onPress={() =>
                          router.push(`/account/orders/${order.id}`)
                        }
                      >
                        <Text className="text-primary font-bold text-sm">
                          Details
                        </Text>
                        <ChevronRight
                          size={16}
                          color={isDark ? "#818cf8" : "#4f46e5"}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="items-center justify-center py-20 opacity-70">
              <View className="w-24 h-24 bg-secondary rounded-full items-center justify-center mb-6">
                <Box size={40} color={isDark ? "#94a3b8" : "#64748b"} />
              </View>
              <Text className="text-foreground font-bold text-xl mb-2 text-center">
                <FormattedMessage id="orders.empty.title" />
              </Text>
              <Text className="text-muted-foreground text-center px-10 leading-6">
                <FormattedMessage id="orders.empty.subtitle" />
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
