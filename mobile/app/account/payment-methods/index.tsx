import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormattedMessage, useIntl } from "react-intl";
import {
  ChevronLeft,
  Plus,
  CreditCard,
  ShieldCheck,
  Apple,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react-native";
import { useTheme } from "../../../contexts/theme-context";
import { Button } from "../../../components/ui/Button";

// Mock data type
type PaymentMethodType =
  | "visa"
  | "mastercard"
  | "amex"
  | "apple_pay"
  | "paypal"
  | "klarna";

type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  last4?: string;
  expiry?: string;
  holderName?: string;
  email?: string;
  isPrimary?: boolean;
};

// Initial mock data
const INITIAL_METHODS: PaymentMethod[] = [
  {
    id: "1",
    type: "visa",
    last4: "4242",
    expiry: "12/26",
    holderName: "Kemal Tütüncü",
    isPrimary: true,
  },
  {
    id: "2",
    type: "apple_pay",
    isPrimary: false,
  },
  {
    id: "3",
    type: "paypal",
    email: "m***e@design.com",
    isPrimary: false,
  },
  {
    id: "4",
    type: "klarna",
    isPrimary: false,
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
      intl.formatMessage({ id: "address.delete.confirm" }),
      [
        { text: intl.formatMessage({ id: "common.cancel" }), style: "cancel" },
        {
          text: intl.formatMessage({ id: "common.delete" }),
          style: "destructive",
          onPress: () => setMethods(methods.filter((m) => m.id !== id)),
        },
      ],
    );
  };

  const handleEdit = (id: string) => {
    Alert.alert(
      intl.formatMessage({ id: "common.edit" }),
      "Edit functionality would open here.",
    );
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case "visa":
        return (
          <View className="bg-[#1a1f71] w-full h-full items-center justify-center">
            <Text className="font-bold text-white text-[10px] italic">
              VISA
            </Text>
          </View>
        );
      case "mastercard":
        return (
          <View className="bg-black w-full h-full items-center justify-center">
            <Text className="font-bold text-white text-[8px]">Master</Text>
          </View>
        );
      case "apple_pay":
        return <Apple size={24} color="white" fill="white" />;
      case "paypal":
        return (
          <Text className="font-bold text-[#003087] text-xl italic">P</Text>
        );
      case "klarna":
        return (
          <Image
            source={require("../../../assets/klarna-icon.png")}
            style={{ width: 40, height: 40, resizeMode: "contain" }}
          />
        );
      default:
        return <CreditCard size={24} color={isDark ? "white" : "black"} />;
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method.type) {
      case "visa":
      case "mastercard":
      case "amex":
        return `•••• ${method.last4}`;
      case "apple_pay":
        return "Apple Pay";
      case "paypal":
        return method.email || "PayPal Wallet";
      case "klarna":
        return "Klarna";
      default:
        return "Payment Method";
    }
  };

  const getMethodSubLabel = (method: PaymentMethod) => {
    switch (method.type) {
      case "visa":
      case "mastercard":
      case "amex":
        return `Expires ${method.expiry}`;
      case "apple_pay":
        return "Device Account";
      case "paypal":
        return "PayPal Wallet";
      case "klarna":
        return "Pay in 30 days";
      default:
        return "";
    }
  };

  const MethodItem = ({
    method,
    isPrimary = false,
  }: {
    method: PaymentMethod;
    isPrimary?: boolean;
  }) => (
    <View className="bg-[#1e2029] p-4 rounded-2xl mb-4 flex-row items-center justify-between border border-white/5">
      <View className="flex-row items-center flex-1">
        {/* Icon Container */}
        <View
          className={`w-12 h-10 rounded-md items-center justify-center mr-4 overflow-hidden ${method.type === "apple_pay" ? "bg-black" : method.type === "klarna" ? "bg-[#FFB3C7]" : method.type === "visa" ? "bg-[#1a1f71]" : "bg-white/10"}`}
        >
          {getMethodIcon(method.type)}
        </View>

        <View>
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-bold text-base">
              {getMethodLabel(method)}
            </Text>
            {isPrimary && (
              <View className="bg-[#3b3589] px-2 py-0.5 rounded-md">
                <Text className="text-[#818cf8] text-[10px] font-bold uppercase">
                  Default
                </Text>
              </View>
            )}
          </View>
          <Text className="text-muted-foreground text-sm">
            {getMethodSubLabel(method)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-4">
        <TouchableOpacity onPress={() => handleEdit(method.id)}>
          <Pencil size={18} color="#94a3b8" />
        </TouchableOpacity>
        {!isPrimary && (
          <TouchableOpacity onPress={() => handleDelete(method.id)}>
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const primaryMethod = methods.find((m) => m.isPrimary);
  const otherMethods = methods.filter((m) => !m.isPrimary);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card/50 items-center justify-center border border-white/5"
          >
            <ChevronLeft size={20} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-foreground">
            <FormattedMessage id="paymentMethods.title" />
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1 px-6 pt-2"
          showsVerticalScrollIndicator={false}
        >
          {/* Primary Method Section */}
          {primaryMethod && (
            <View className="mb-6">
              <Text className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3">
                Primary Method
              </Text>
              <MethodItem method={primaryMethod} isPrimary />
            </View>
          )}

          {/* Other Methods Section */}
          <View className="mb-8">
            <Text className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3">
              Other Methods
            </Text>
            {otherMethods.map((method) => (
              <MethodItem key={method.id} method={method} />
            ))}
          </View>

          {/* Secure Payments Footer */}
          <View className="border border-dashed border-white/10 rounded-3xl p-6 items-center mb-32 bg-white/5">
            <View className="mb-3">
              <ShieldCheck size={28} color="#6366f1" />
            </View>
            <Text className="text-white font-bold text-base mb-2 text-center">
              Secure Payments
            </Text>
            <Text className="text-muted-foreground text-xs text-center leading-5 px-4">
              Your payment details are encrypted and securely stored. We never
              share your full card info.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View className="absolute bottom-10 left-6 right-6">
          <Button
            title={intl.formatMessage({ id: "paymentMethods.add" })}
            onPress={() => router.push("/account/payment-methods/add")}
            variant="primary"
            className="w-full h-14 rounded-xl shadow-xl shadow-indigo-500/20"
            icon={<Plus size={24} color="white" />}
            textStyle={{ fontSize: 16, fontWeight: "700", letterSpacing: 0.5 }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
