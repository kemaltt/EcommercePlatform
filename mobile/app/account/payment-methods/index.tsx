import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormattedMessage, useIntl } from "react-intl";
import { ChevronLeft, Plus, CreditCard, Trash2 } from "lucide-react-native";
import { useTheme } from "../../../contexts/theme-context";

// Mock data type
type PaymentMethod = {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  expiry: string;
  holderName: string;
};

// Initial mock data
const INITIAL_METHODS: PaymentMethod[] = [
  {
    id: "1",
    type: "visa",
    last4: "4242",
    expiry: "12/24",
    holderName: "John Doe",
  },
  {
    id: "2",
    type: "mastercard",
    last4: "8888",
    expiry: "09/25",
    holderName: "John Doe",
  },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);

  const handleDelete = (id: string) => {
    Alert.alert(
      intl.formatMessage({ id: "common.delete" }),
      intl.formatMessage({ id: "address.delete.confirm" }), // Reuse existing string or add new one
      [
        {
          text: intl.formatMessage({ id: "common.cancel" }),
          style: "cancel",
        },
        {
          text: intl.formatMessage({ id: "common.delete" }),
          style: "destructive",
          onPress: () => {
            setMethods(methods.filter((m) => m.id !== id));
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-border/10">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
            >
              <ChevronLeft size={24} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">
              <FormattedMessage id="account.paymentMethods" />
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/account/payment-methods/add")}
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          {methods.length === 0 ? (
            <View className="items-center justify-center py-10">
              <CreditCard size={64} color={isDark ? "#334155" : "#cbd5e1"} />
              <Text className="text-muted-foreground mt-4 text-center">
                <FormattedMessage id="paymentMethods.empty" />
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {methods.map((method) => (
                <View
                  key={method.id}
                  className="bg-card p-5 rounded-2xl border border-border/50 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-8 bg-secondary rounded-md items-center justify-center">
                      <CreditCard
                        size={20}
                        color={isDark ? "#94a3b8" : "#475569"}
                      />
                    </View>
                    <View>
                      <Text className="text-foreground font-bold">
                        •••• •••• •••• {method.last4}
                      </Text>
                      <Text className="text-muted-foreground text-xs mt-0.5">
                        {intl.formatMessage({ id: "paymentMethods.expires" })}:{" "}
                        {method.expiry}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(method.id)}
                    className="p-2"
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
