import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  User,
  MapPin,
  CreditCard,
  Package,
  Calendar,
  Mail,
} from "lucide-react-native";
import { useTheme } from "../../../contexts/theme-context";
import { api } from "../../../lib/api";
import { Order, OrderItem, Product } from "@shared/schema";
import { format } from "date-fns";
import { tr, de, enUS } from "date-fns/locale";

type OrderDetail = Order & {
  items: OrderItem[];
  customer?: {
    id: string;
    fullName: string;
    email: string;
    username: string;
  };
  shippingAddress?: any;
};

export default function AdminOrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: [`/api/admin/orders/${id}`],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/admin/orders/${id}`);
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator
          size="large"
          color={isDark ? "#818cf8" : "#4f46e5"}
        />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Order not found</Text>
      </View>
    );
  }

  const statusStyle = getStatusColor(order.status);
  const address = order.shippingAddress;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-border/10 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
            >
              <ChevronLeft size={24} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-foreground">
                <FormattedMessage
                  id="admin.orders.details"
                  defaultMessage="Order Details"
                />
              </Text>
              <Text className="text-xs text-muted-foreground">
                #{order.orderNumber}
              </Text>
            </View>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full ${statusStyle.split(" ")[1]}`}
          >
            <Text
              className={`text-xs font-bold capitalize ${statusStyle.split(" ")[0]}`}
            >
              {order.status}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          {/* Customer Info Card */}
          <View className="bg-card p-5 rounded-3xl border border-border/50 mb-4">
            <View className="flex-row items-center mb-4">
              <User size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
              <Text className="text-foreground font-bold text-lg ml-2">
                <FormattedMessage
                  id="admin.orders.customer"
                  defaultMessage="Customer"
                />
              </Text>
            </View>

            <View className="ml-1">
              <Text className="text-foreground font-bold text-base mb-1">
                {order.customer?.fullName || "Guest User"}
              </Text>
              <View className="flex-row items-center mt-1">
                <Mail size={14} color="#94a3b8" />
                <Text className="text-muted-foreground ml-2 text-sm">
                  {order.customer?.email}
                </Text>
              </View>
              <View className="flex-row items-center mt-2">
                <Calendar size={14} color="#94a3b8" />
                <Text className="text-muted-foreground ml-2 text-sm">
                  {format(new Date(order.createdAt), "dd MMMM yyyy, HH:mm", {
                    locale: getDateLocale(),
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Shipping Address */}
          <View className="bg-card p-5 rounded-3xl border border-border/50 mb-4">
            <View className="flex-row items-center mb-4">
              <MapPin size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
              <Text className="text-foreground font-bold text-lg ml-2">
                <FormattedMessage
                  id="admin.orders.shipping"
                  defaultMessage="Shipping Address"
                />
              </Text>
            </View>
            <Text className="text-muted-foreground leading-6">
              {address ? (
                <>
                  <Text className="font-bold text-foreground">
                    {address.fullName}
                  </Text>
                  {"\n"}
                  {address.addressLine1}
                  {"\n"}
                  {address.addressLine2 ? `${address.addressLine2}\n` : ""}
                  {address.city}, {address.zipCode}
                  {"\n"}
                  {address.country}
                </>
              ) : (
                <Text className="italic">No shipping address provided</Text>
              )}
            </Text>
          </View>

          {/* Shipping Information */}
          {(order.trackingNumber ||
            order.shippingCarrier ||
            order.shippedAt) && (
            <View className="bg-card p-5 rounded-3xl border border-border/50 mb-4">
              <View className="flex-row items-center mb-4">
                <Package size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
                <Text className="text-foreground font-bold text-lg ml-2">
                  <FormattedMessage
                    id="admin.orders.shippingInfo"
                    defaultMessage="Shipping Information"
                  />
                </Text>
              </View>

              <View className="gap-3">
                {order.trackingNumber && (
                  <View>
                    <Text className="text-muted-foreground text-xs font-bold mb-1 uppercase">
                      <FormattedMessage
                        id="admin.orders.manage.trackingNumber"
                        defaultMessage="Tracking Number"
                      />
                    </Text>
                    <Text className="text-foreground font-medium">
                      {order.trackingNumber}
                    </Text>
                  </View>
                )}

                {order.shippingCarrier && (
                  <View>
                    <Text className="text-muted-foreground text-xs font-bold mb-1 uppercase">
                      <FormattedMessage
                        id="admin.orders.manage.shippingCarrier"
                        defaultMessage="Shipping Carrier"
                      />
                    </Text>
                    <Text className="text-foreground font-medium">
                      {order.shippingCarrier}
                    </Text>
                  </View>
                )}

                {order.shippedAt && (
                  <View>
                    <Text className="text-muted-foreground text-xs font-bold mb-1 uppercase">
                      <FormattedMessage
                        id="admin.orders.shippedDate"
                        defaultMessage="Shipped Date"
                      />
                    </Text>
                    <Text className="text-foreground font-medium">
                      {format(
                        new Date(order.shippedAt),
                        "dd MMMM yyyy, HH:mm",
                        { locale: getDateLocale() },
                      )}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Order Items (Positions) */}
          <View className="bg-card p-5 rounded-3xl border border-border/50 mb-4">
            <View className="flex-row items-center mb-4">
              <Package size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
              <Text className="text-foreground font-bold text-lg ml-2">
                <FormattedMessage
                  id="admin.orders.items"
                  defaultMessage="Order Items"
                />
              </Text>
            </View>

            {order.items?.map((item, index) => (
              <View
                key={index}
                className={`flex-row items-center py-3 ${index !== order.items.length - 1 ? "border-b border-border/30" : ""}`}
              >
                <View className="w-16 h-16 bg-background rounded-xl items-center justify-center mr-4 border border-border/30">
                  {item.productImage ? (
                    <Image
                      source={{ uri: item.productImage }}
                      className="w-full h-full rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <Package size={24} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-sm mb-1">
                    {item.productName || "Unknown Product"}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    Qty: {item.quantity} x ${Number(item.price).toFixed(2)}
                  </Text>
                </View>
                <Text className="text-foreground font-bold">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment & Totals */}
          <View className="bg-card p-5 rounded-3xl border border-border/50 mb-8">
            <View className="flex-row items-center mb-4">
              <CreditCard size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
              <Text className="text-foreground font-bold text-lg ml-2">
                <FormattedMessage
                  id="admin.orders.payment"
                  defaultMessage="Payment"
                />
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground">Payment Method</Text>
              <Text className="text-foreground font-bold capitalize">
                {order.paymentMethod || "Credit Card"}
              </Text>
            </View>

            <View className="h-[1px] bg-border/30 my-3" />

            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground">Subtotal</Text>
              <Text className="text-foreground font-medium">
                $
                {(
                  Number(order.total) -
                  Number(order.tax) -
                  Number(order.shippingCost)
                ).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground">Shipping</Text>
              <Text className="text-foreground font-medium">
                ${Number(order.shippingCost).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-muted-foreground">Tax</Text>
              <Text className="text-foreground font-medium">
                ${Number(order.tax).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between pt-3 border-t border-border/30">
              <Text className="text-foreground font-bold text-lg">Total</Text>
              <Text className="text-primary font-bold text-xl">
                ${Number(order.total).toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
