import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Check, Mail, Truck, Compass } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../contexts/theme-context";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/use-auth";
import { useIntl, FormattedMessage } from "react-intl";

export default function ThankYouScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const intl = useIntl();
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();

  // Use current date house + 4 days for estimated delivery
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);
  const formattedDelivery = estimatedDelivery.toLocaleDateString(
    intl.locale === "de" ? "de-DE" : intl.locale === "tr" ? "tr-TR" : "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "short",
    },
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          alignItems: "center",
          paddingTop: 60,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View className="relative mb-10">
          <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center">
            <View className="w-16 h-16 bg-primary rounded-full items-center justify-center shadow-2xl shadow-primary">
              <Check size={32} color="white" strokeWidth={3} />
            </View>
          </View>
          {/* Decorative elements */}
          <View className="absolute -top-4 -left-4 w-8 h-8 bg-primary/10 rounded-lg rotate-45" />
          <View className="absolute bottom-0 -right-4 w-6 h-6 bg-primary/10 rounded-full" />
        </View>

        <Text className="text-foreground text-4xl font-extrabold mb-4 text-center">
          <FormattedMessage id="checkout.success.title" />
        </Text>
        <Text className="text-muted-foreground text-lg text-center mb-12 px-10">
          <FormattedMessage id="checkout.success.subtitle" />
        </Text>

        {/* Order Details Card */}
        <View className="w-full bg-card border border-border rounded-[32px] p-6 mb-4">
          <View className="flex-row justify-between items-center mb-6 pb-6 border-b border-border/50">
            <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              <FormattedMessage id="checkout.success.orderNumber" />
            </Text>
            <Text className="text-foreground font-extrabold text-base">
              #{orderNumber || "AG-849204"}
            </Text>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="bg-secondary w-12 h-12 rounded-2xl items-center justify-center">
              <Truck size={24} color={isDark ? "#818cf8" : "#4f46e5"} />
            </View>
            <View>
              <Text className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                <FormattedMessage id="checkout.success.deliveryEstimated" />
              </Text>
              <Text className="text-foreground font-bold text-base mt-0.5">
                {formattedDelivery}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View className="w-full bg-card/40 border border-border/30 rounded-2xl p-4 flex-row items-center gap-3 mb-12">
          <Mail size={16} color={isDark ? "#818cf8" : "#4f46e5"} />
          <Text className="text-muted-foreground text-xs font-medium">
            <FormattedMessage
              id="checkout.success.confirmationSent"
              values={{ email: user?.email }}
            />
          </Text>
        </View>

        {/* Actions */}
        <View className="w-full gap-4">
          <Button
            title={intl.formatMessage({ id: "checkout.success.trackOrder" })}
            variant="primary"
            className="h-16 rounded-3xl"
            icon={<Compass size={20} color="white" />}
            onPress={() => router.push("/(tabs)/profile" as any)} // For now redirect to profile where orders will be
          />
          <Button
            title={intl.formatMessage({
              id: "checkout.success.continueShopping",
            })}
            variant="secondary"
            className="h-16 rounded-3xl border border-border"
            onPress={() => router.push("/")}
          />
        </View>
      </ScrollView>
    </View>
  );
}
