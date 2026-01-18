import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { CreditCard, ChevronRight, HelpCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/theme-context";
import { useCheckout } from "../../contexts/checkout-context";
import { Button } from "../../components/ui/Button";
import { useIntl, FormattedMessage } from "react-intl";

export default function PaymentStep() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { state, setPaymentMethod } = useCheckout();
  const intl = useIntl();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<
    "credit_card" | "paypal" | "klarna"
  >("credit_card");

  const handleNext = () => {
    if (selectedMethod === "credit_card") {
      if (cardNumber.length < 16) return; // Simple validation
      setPaymentMethod({
        type: "credit_card",
        last4: cardNumber.slice(-4),
        expiry: expiry,
      });
    } else {
      setPaymentMethod({ type: selectedMethod });
    }
    router.push("/checkout/review");
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-4">
          <FormattedMessage id="checkout.payment.creditCard" />
        </Text>

        {/* Credit Card Form */}
        <TouchableOpacity
          onPress={() => setSelectedMethod("credit_card")}
          className={`bg-card border rounded-[32px] p-6 mb-8 ${selectedMethod === "credit_card" ? "border-primary/50" : "border-border"}`}
        >
          <View className="space-y-6">
            <View>
              <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                <FormattedMessage id="checkout.payment.cardNumber" />
              </Text>
              <View className="bg-background/50 border border-border rounded-2xl h-14 flex-row items-center px-5">
                <TextInput
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  maxLength={19}
                  className="flex-1 text-foreground font-bold text-lg"
                />
                <Image
                  source={{
                    uri: "https://img.icons8.com/color/48/mastercard.png",
                  }}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                  <FormattedMessage id="checkout.payment.expiryDate" />
                </Text>
                <View className="bg-background/50 border border-border rounded-2xl h-14 justify-center px-5">
                  <TextInput
                    value={expiry}
                    onChangeText={setExpiry}
                    placeholder="MM/YY"
                    placeholderTextColor="#64748b"
                    keyboardType="number-pad"
                    maxLength={5}
                    className="text-foreground font-bold text-lg"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                  <FormattedMessage id="checkout.payment.cvv" />
                </Text>
                <View className="bg-background/50 border border-border rounded-2xl h-14 flex-row items-center px-5">
                  <TextInput
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    placeholderTextColor="#64748b"
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                    className="flex-1 text-foreground font-bold text-lg"
                  />
                  <HelpCircle size={18} color="#64748b" />
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSaveCard(!saveCard)}
              className="flex-row items-center gap-3 mt-2"
            >
              <View
                className={`w-5 h-5 rounded border items-center justify-center ${saveCard ? "bg-primary border-primary" : "border-border"}`}
              >
                {saveCard && <View className="w-2 h-2 bg-white rounded-full" />}
              </View>
              <Text className="text-muted-foreground text-xs font-medium">
                <FormattedMessage id="checkout.payment.saveCard" />
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <Text className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-4">
          <FormattedMessage id="checkout.payment.otherMethods" />
        </Text>

        {/* PayPal */}
        <TouchableOpacity
          onPress={() => setSelectedMethod("paypal")}
          className={`bg-card border rounded-3xl p-5 mb-4 flex-row items-center gap-4 ${selectedMethod === "paypal" ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <View className="bg-blue-500/10 w-12 h-12 rounded-2xl items-center justify-center">
            <CreditCard size={24} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-bold text-base">PayPal</Text>
            <Text className="text-muted-foreground text-xs">
              <FormattedMessage id="checkout.payment.paypal.desc" />
            </Text>
          </View>
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedMethod === "paypal" ? "border-primary" : "border-muted-foreground/30"}`}
          >
            {selectedMethod === "paypal" && (
              <View className="w-3 h-3 rounded-full bg-primary" />
            )}
          </View>
        </TouchableOpacity>

        {/* Klarna */}
        <TouchableOpacity
          onPress={() => setSelectedMethod("klarna")}
          className={`bg-card border rounded-3xl p-5 mb-4 flex-row items-center gap-4 ${selectedMethod === "klarna" ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <View className="bg-pink-500/10 w-12 h-12 rounded-2xl items-center justify-center">
            <CreditCard size={24} color="#ec4899" />
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-bold text-base">Klarna</Text>
            <Text className="text-muted-foreground text-xs">
              <FormattedMessage id="checkout.payment.klarna.desc" />
            </Text>
          </View>
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedMethod === "klarna" ? "border-primary" : "border-muted-foreground/30"}`}
          >
            {selectedMethod === "klarna" && (
              <View className="w-3 h-3 rounded-full bg-primary" />
            )}
          </View>
        </TouchableOpacity>
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
