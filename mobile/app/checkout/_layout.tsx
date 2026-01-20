import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stack, useRouter, usePathname, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Check } from "lucide-react-native";
import { useTheme } from "../../contexts/theme-context";
import { CheckoutProvider } from "../../contexts/checkout-context";
import { useIntl } from "react-intl";

export default function CheckoutLayout() {
  const { isDark } = useTheme();
  const pathname = usePathname();
  const intl = useIntl();

  const getStep = () => {
    if (pathname.includes("thank-you")) return 4;
    if (pathname.includes("review")) return 3;
    if (pathname.includes("payment")) return 2;
    return 1;
  };

  const step = getStep();
  const isSuccess = step === 4;

  const steps = [
    { id: 1, label: intl.formatMessage({ id: "checkout.steps.shipping" }) },
    { id: 2, label: intl.formatMessage({ id: "checkout.steps.payment" }) },
    { id: 3, label: intl.formatMessage({ id: "checkout.steps.review" }) },
  ];

  return (
    <CheckoutProvider>
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1" edges={["top"]}>
          {!isSuccess && (
            <>
              {/* Header */}
              <View className="flex-row items-center px-6 py-4">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
                >
                  <ChevronLeft size={20} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-bold text-foreground mr-10">
                  {step === 1
                    ? intl.formatMessage({ id: "checkout.title.step1" })
                    : step === 2
                      ? intl.formatMessage({ id: "checkout.title.step2" })
                      : intl.formatMessage({ id: "checkout.title.step3" })}
                </Text>
              </View>

              {/* Step Indicator */}
              <View className="flex-row items-center justify-center px-10 py-6">
                {steps.map((s, index) => (
                  <React.Fragment key={s.id}>
                    <View className="items-center">
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                          step > s.id
                            ? "bg-green-500 border-green-500"
                            : step === s.id
                              ? "bg-primary border-primary"
                              : "bg-card border-border"
                        }`}
                      >
                        {step > s.id ? (
                          <Check size={18} color="white" />
                        ) : (
                          <Text
                            className={`font-bold ${
                              step === s.id
                                ? "text-white"
                                : "text-muted-foreground"
                            }`}
                          >
                            {s.id}
                          </Text>
                        )}
                      </View>
                      <Text
                        className={`text-[10px] font-bold mt-2 tracking-widest ${
                          step === s.id
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </Text>
                    </View>
                    {index < steps.length - 1 && (
                      <View
                        className={`flex-1 h-[2px] mx-2 -mt-6 ${
                          step > s.id ? "bg-green-500" : "bg-border"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </>
          )}

          <View className="flex-1">
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </SafeAreaView>
      </View>
    </CheckoutProvider>
  );
}
