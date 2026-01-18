import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/theme-context";
import { useCheckout } from "../../contexts/checkout-context";
import { useCart } from "../../hooks/use-cart";
import { api } from "../../lib/api";
import { Address } from "@shared/schema";
import { Button } from "../../components/ui/Button";
import { useIntl, FormattedMessage } from "react-intl";

// Shipping methods will be localized in the component to use the hook
const getShippingMethods = (intl: any) => [
  {
    id: "priority",
    name: intl.formatMessage({ id: "checkout.shipping.priority" }),
    price: 12.0,
    days: intl.formatMessage({ id: "checkout.shipping.days.priority" }),
  },
  {
    id: "standard",
    name: intl.formatMessage({ id: "checkout.shipping.standard" }),
    price: 0,
    days: intl.formatMessage({ id: "checkout.shipping.days.standard" }),
  },
];

export default function ShippingStep() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { state, setShippingAddress, setShippingMethod, setItems } =
    useCheckout();
  const { cartItems } = useCart();
  const intl = useIntl();
  const shippingMethods = getShippingMethods(intl);

  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    queryFn: async () => {
      const res = await api.get("/addresses");
      return res.data;
    },
  });

  // Set initial default address if available
  useEffect(() => {
    if (addresses && addresses.length > 0 && !state.shippingAddress) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setShippingAddress(defaultAddr);
    }
  }, [addresses]);

  // Sync items from cart to checkout on entry
  useEffect(() => {
    if (cartItems.length > 0) {
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        quantity: item.quantity,
        price: item.product.price,
        options: null, // Size/color could be added here if available in cart item
      }));
      setItems(orderItems as any);
    }
  }, [cartItems]);

  const handleNext = () => {
    if (!state.shippingAddress) {
      // Alert or show error
      return;
    }
    router.push("/checkout/payment");
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Shipping Address Section */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
            <FormattedMessage id="checkout.shipping.address" />
          </Text>
          <TouchableOpacity onPress={() => router.push("/addresses")}>
            <Text className="text-primary font-bold text-sm">
              <FormattedMessage id="common.edit" />
            </Text>
          </TouchableOpacity>
        </View>

        {state.shippingAddress ? (
          <View className="bg-card border border-border rounded-3xl p-5 mb-8 flex-row items-center gap-4">
            <View className="bg-primary/10 w-12 h-12 rounded-2xl items-center justify-center">
              <MapPin size={24} color={isDark ? "#818cf8" : "#4f46e5"} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-bold text-lg">
                {state.shippingAddress.fullName}
              </Text>
              <Text
                className="text-muted-foreground text-sm mt-1"
                numberOfLines={2}
              >
                {state.shippingAddress.addressLine1},{" "}
                {state.shippingAddress.city}, {state.shippingAddress.zipCode}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/addresses/manage")}
            className="bg-card border border-dashed border-border rounded-3xl p-8 mb-8 items-center justify-center"
          >
            <Text className="text-muted-foreground font-medium">
              <FormattedMessage id="checkout.shipping.addAddress" />
            </Text>
          </TouchableOpacity>
        )}

        {/* Shipping Method Section */}
        <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-4">
          <FormattedMessage id="checkout.shipping.method" />
        </Text>

        {shippingMethods.map((method) => {
          const isSelected = state.shippingMethod?.id === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              onPress={() => setShippingMethod(method)}
              className={`bg-card border rounded-3xl p-5 mb-4 flex-row items-center gap-4 ${
                isSelected ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  isSelected ? "border-primary" : "border-muted-foreground/30"
                }`}
              >
                {isSelected && (
                  <View className="w-3 h-3 rounded-full bg-primary" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-base">
                  {method.name}
                </Text>
                <Text className="text-muted-foreground text-xs mt-1">
                  {method.days}
                </Text>
              </View>
              <Text
                className={`font-bold text-base ${
                  method.price === 0 ? "text-green-500" : "text-foreground"
                }`}
              >
                {method.price === 0
                  ? intl.formatMessage({ id: "cart.shipping.free" })
                  : `$${method.price.toFixed(2)}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer Summary */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-8 pt-6 pb-10">
        <View className="flex-row justify-between items-end mb-6">
          <Text className="text-muted-foreground font-medium">
            <FormattedMessage id="checkout.footer.orderTotal" />
          </Text>
          <View className="items-end">
            <Text className="text-3xl font-extrabold text-[#818cf8]">
              ${state.total.toFixed(2)}
            </Text>
            <Text className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
              <FormattedMessage id="checkout.footer.includingTaxes" />
            </Text>
          </View>
        </View>

        <Button
          title={intl.formatMessage({
            id: "checkout.payment.continueToReview",
          })}
          onPress={handleNext}
          variant="primary"
          className="h-16 rounded-3xl shadow-xl shadow-primary/30"
          icon={<ChevronRight size={20} color="white" />}
        />
      </View>
    </View>
  );
}
