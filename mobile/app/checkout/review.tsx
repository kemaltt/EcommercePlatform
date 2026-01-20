import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MapPin, CreditCard, ChevronRight, Rocket } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../contexts/theme-context";
import { useCheckout } from "../../contexts/checkout-context";
import { useCart } from "../../hooks/use-cart";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { useIntl, FormattedMessage } from "react-intl";

export default function ReviewStep() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { state, resetCheckout } = useCheckout();
  const { clearCart } = useCart();
  const queryClient = useQueryClient();
  const intl = useIntl();
  const [isPlacing, setIsPlacing] = useState(false);

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/orders", {
        shippingAddress: state.shippingAddress,
        shippingMethod: state.shippingMethod?.name,
        paymentMethod: state.paymentMethod?.type,
        subtotal: state.subtotal,
        shippingCost: state.shippingCost,
        tax: state.tax,
        total: state.total,
        items: state.items,
        pointsUsed: state.pointsUsed,
      });
      return res.data;
    },
    onSuccess: (data) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      resetCheckout();
      router.push({
        pathname: "/checkout/thank-you",
        params: { orderNumber: data.orderNumber },
      });
    },
    onError: (error: any) => {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        error.response?.data?.message ||
          intl.formatMessage({ id: "checkout.review.error.failed" }),
      );
      setIsPlacing(false);
    },
  });

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    placeOrderMutation.mutate();
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Deliver To Section */}
        <View className="bg-card border border-border rounded-3xl p-5 mb-4 flex-row items-center gap-4">
          <View className="bg-primary/10 w-12 h-12 rounded-2xl items-center justify-center">
            <MapPin size={24} color={isDark ? "#818cf8" : "#4f46e5"} />
          </View>
          <View className="flex-1">
            <Text className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
              <FormattedMessage id="checkout.review.deliverTo" />
            </Text>
            <Text
              className="text-foreground font-bold text-base mt-1"
              numberOfLines={1}
            >
              {state.shippingAddress?.fullName} • {state.shippingAddress?.city}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/checkout")}>
            <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              <FormattedMessage id="common.edit" />
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Section */}
        <View className="bg-card border border-border rounded-3xl p-5 mb-8 flex-row items-center gap-4">
          <View className="bg-primary/10 w-12 h-12 rounded-2xl items-center justify-center">
            <CreditCard size={24} color={isDark ? "#818cf8" : "#4f46e5"} />
          </View>
          <View className="flex-1">
            <Text className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
              <FormattedMessage id="checkout.review.payment" />
            </Text>
            <Text className="text-foreground font-bold text-base mt-1">
              {state.paymentMethod?.type === "credit_card" ||
              state.paymentMethod?.type === "debit_card"
                ? `${state.paymentMethod.type === "credit_card" ? "Mastercard" : intl.formatMessage({ id: "checkout.payment.debitCard" })} ending in ${state.paymentMethod.last4}`
                : state.paymentMethod?.type.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/checkout/payment")}>
            <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              <FormattedMessage id="common.edit" />
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-4">
          <FormattedMessage id="checkout.review.orderSummary" />
        </Text>

        {/* Items */}
        <View className="space-y-4 mb-8">
          {state.items.map((item, index) => (
            <View
              key={index}
              className="bg-card border border-border rounded-3xl p-4 flex-row gap-4"
            >
              <View className="relative">
                <Image
                  source={{ uri: item.productImage }}
                  className="w-20 h-20 rounded-2xl bg-secondary"
                  resizeMode="cover"
                />
                <View className="absolute -top-2 -right-2 bg-foreground w-6 h-6 rounded-full items-center justify-center">
                  <Text className="text-background text-[10px] font-bold">
                    x{item.quantity}
                  </Text>
                </View>
              </View>
              <View className="flex-1 justify-center">
                <Text
                  className="text-foreground font-bold text-base"
                  numberOfLines={1}
                >
                  {item.productName}
                </Text>
                <Text className="text-muted-foreground text-xs mt-1">
                  Size: 42 • Phantom Black
                </Text>
                <Text className="text-primary font-bold text-base mt-2">
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals Breakdown */}
        <View className="space-y-3 px-2">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground font-medium">
              <FormattedMessage id="cart.subtotal" />
            </Text>
            <Text className="text-foreground font-bold">
              ${state.subtotal.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground font-medium">
              <FormattedMessage
                id="cart.shipping"
                values={{ method: state.shippingMethod?.name }}
              />{" "}
              ({state.shippingMethod?.name})
            </Text>
            <Text className="text-foreground font-bold">
              ${state.shippingCost.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground font-medium">
              <FormattedMessage id="checkout.review.estimatedTaxes" />
            </Text>
            <Text className="text-foreground font-bold">
              ${state.tax.toFixed(2)}
            </Text>
          </View>
          {state.pointsUsed > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-green-500 font-medium">
                <FormattedMessage id="cart.points.discount" />
              </Text>
              <Text className="text-green-500 font-bold">
                -${state.pointsUsed.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Summary */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-8 pt-6 pb-10">
        <View className="flex-row justify-between items-end mb-6">
          <Text className="text-muted-foreground font-bold text-lg">
            <FormattedMessage id="cart.total" />
          </Text>
          <Text className="text-3xl font-extrabold text-[#818cf8]">
            ${state.total.toFixed(2)}
          </Text>
        </View>

        <Button
          title={
            isPlacing
              ? intl.formatMessage({ id: "checkout.review.placingOrder" })
              : intl.formatMessage({ id: "checkout.button.placeOrder" })
          }
          onPress={handlePlaceOrder}
          disabled={isPlacing}
          variant="primary"
          className="h-16 rounded-3xl shadow-xl shadow-primary/30"
          icon={
            isPlacing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Rocket size={20} color="white" />
            )
          }
        />
      </View>
    </View>
  );
}
