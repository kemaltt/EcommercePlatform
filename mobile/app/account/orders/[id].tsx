import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Package,
  Calendar,
} from "lucide-react-native";
import { useTheme } from "../../../contexts/theme-context";
import { api } from "../../../lib/api";
import { Order } from "@shared/schema";
import { format } from "date-fns";
import { tr, de, enUS } from "date-fns/locale";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: [`/api/orders/${id}`],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
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

  if (isLoading || !order) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator
          size="large"
          color={isDark ? "#818cf8" : "#4f46e5"}
        />
      </View>
    );
  }

  const shippingAddress = order.shippingAddress as any;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-border/10 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
          >
            <ChevronLeft size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-foreground">
              <FormattedMessage id="orders.details.title" />
            </Text>
            <Text className="text-muted-foreground text-xs">
              #{order.orderNumber}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View
            className={`px-6 py-4 flex-row items-center justify-between ${isDark ? "bg-card" : "bg-gray-50"}`}
          >
            <View className="flex-row items-center gap-3">
              <Calendar size={20} color={isDark ? "#94a3b8" : "#64748b"} />
              <View>
                <Text className="text-foreground font-bold text-sm">
                  {format(new Date(order.createdAt), "dd MMMM yyyy, HH:mm", {
                    locale: getDateLocale(),
                  })}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  Order Date
                </Text>
              </View>
            </View>
            <View
              className={`px-3 py-1.5 rounded-full ${getStatusColor(order.status).split(" ")[1]}`}
            >
              <Text
                className={`text-xs font-bold capitalize ${getStatusColor(order.status).split(" ")[0]}`}
              >
                {getStatusLabel(order.status)}
              </Text>
            </View>
          </View>

          <View className="p-6 gap-6">
            {/* Items */}
            <View>
              <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-4">
                <FormattedMessage id="orders.details.items" />
              </Text>
              <View className="bg-card border border-border/50 rounded-3xl p-4 gap-4">
                {order.items?.map((item, index) => (
                  <View
                    key={index}
                    className="flex-row gap-4 border-b border-border/10 pb-4 last:border-0 last:pb-0"
                  >
                    <Image
                      source={{ uri: item.productImage }}
                      className="w-16 h-16 rounded-xl bg-secondary"
                      resizeMode="cover"
                    />
                    <View className="flex-1 justify-center">
                      <Text
                        className="text-foreground font-bold text-sm"
                        numberOfLines={1}
                      >
                        {item.productName}
                      </Text>
                      <Text className="text-muted-foreground text-xs mt-1">
                        Qty: {item.quantity} • ${item.price.toFixed(2)}
                      </Text>
                    </View>
                    <View className="justify-center">
                      <Text className="text-foreground font-bold text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Shipping & Payment Info */}
            <View className="flex-row gap-4">
              {/* Shipping Info */}
              <View className="flex-1">
                <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-4">
                  <FormattedMessage id="orders.details.shipping" />
                </Text>
                <View className="bg-card border border-border/50 rounded-3xl p-4 h-full">
                  <MapPin
                    size={20}
                    color={isDark ? "#818cf8" : "#4f46e5"}
                    className="mb-2"
                  />
                  <Text className="text-foreground font-bold text-sm mb-1">
                    {shippingAddress.fullName}
                  </Text>
                  <Text className="text-muted-foreground text-xs leading-5">
                    {shippingAddress.addressLine1}
                    {shippingAddress.addressLine2
                      ? `\n${shippingAddress.addressLine2}`
                      : ""}
                    {`\n${shippingAddress.city}, ${shippingAddress.zipCode}`}
                  </Text>
                </View>
              </View>

              {/* Payment Info */}
              <View className="flex-1">
                <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-4">
                  <FormattedMessage id="orders.details.payment" />
                </Text>
                <View className="bg-card border border-border/50 rounded-3xl p-4 h-full">
                  <CreditCard
                    size={20}
                    color={isDark ? "#818cf8" : "#4f46e5"}
                    className="mb-2"
                  />
                  <Text className="text-foreground font-bold text-sm mb-1 capitalize">
                    {order.paymentMethod.replace("_", " ")}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Summary */}
            <View>
              <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-4">
                <FormattedMessage id="orders.details.summary" />
              </Text>
              <View className="bg-card border border-border/50 rounded-3xl p-5">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground">Subtotal</Text>
                  <Text className="text-foreground font-medium">
                    ${order.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground">Shipping</Text>
                  <Text className="text-foreground font-medium">
                    ${order.shippingCost.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-4">
                  <Text className="text-muted-foreground">Tax</Text>
                  <Text className="text-foreground font-medium">
                    ${order.tax.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between pt-4 border-t border-border/10">
                  <Text className="text-foreground font-bold text-lg">
                    Total
                  </Text>
                  <Text className="text-primary font-bold text-xl">
                    ${order.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
