import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormattedMessage, useIntl } from "react-intl";
import { ChevronLeft, CreditCard } from "lucide-react-native";
import { useTheme } from "../../../contexts/theme-context";
import { Button } from "../../../components/ui/Button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Moved schema inside component to use intl
type FormData = {
  cardNumber: string;
  expiry: string;
  cvv: string;
  holderName: string;
};

export default function AddPaymentMethodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;
  const { isDark } = useTheme();
  const intl = useIntl();

  const schema = z.object({
    cardNumber: z
      .string()
      .min(16, intl.formatMessage({ id: "validation.card.number" })),
    expiry: z
      .string()
      .min(5, intl.formatMessage({ id: "validation.card.expiry" })),
    cvv: z.string().min(3, intl.formatMessage({ id: "validation.card.cvv" })),
    holderName: z
      .string()
      .min(3, intl.formatMessage({ id: "validation.card.holderName" })),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cardNumber: (params.cardNumber as string) || "",
      expiry: (params.expiry as string) || "",
      cvv: "123", // Dummy CVV for edit mode as it's usually not stored/passed
      holderName: (params.holderName as string) || "",
    },
  });

  useEffect(() => {
    if (isEditing) {
      reset({
        cardNumber: (params.cardNumber as string) || "",
        expiry: (params.expiry as string) || "",
        cvv: "123",
        holderName: (params.holderName as string) || "",
      });
    }
  }, [isEditing, params, reset]);

  const onSubmit = (data: FormData) => {
    console.log(isEditing ? "Updating card:" : "Adding card:", data);
    Alert.alert(
      intl.formatMessage({ id: "common.success" }),
      intl.formatMessage({
        id: isEditing
          ? "profile.updateSuccess"
          : "paymentMethods.addParams.success",
      }),
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-border/10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
          >
            <ChevronLeft size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">
            <FormattedMessage
              id={isEditing ? "paymentMethods.edit" : "paymentMethods.add"}
            />
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          <View className="gap-4">
            {/* Card Holder Name */}
            <View>
              <Text className="text-muted-foreground text-xs font-bold uppercase mb-2 ml-1">
                <FormattedMessage id="paymentMethods.holderName" />
              </Text>
              <Controller
                control={control}
                name="holderName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-card p-4 rounded-xl text-foreground font-medium border border-border/50"
                    placeholder="John Doe"
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.holderName && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {intl.formatMessage({ id: "auth.error.required" })}
                </Text>
              )}
            </View>

            {/* Card Number */}
            <View>
              <Text className="text-muted-foreground text-xs font-bold uppercase mb-2 ml-1">
                <FormattedMessage id="paymentMethods.cardNumber" />
              </Text>
              <Controller
                control={control}
                name="cardNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-card p-4 rounded-xl text-foreground font-medium border border-border/50"
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    keyboardType="numeric"
                    maxLength={16}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.cardNumber && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {intl.formatMessage({ id: "auth.error.required" })}
                </Text>
              )}
            </View>

            <View className="flex-row gap-4">
              {/* Expiry */}
              <View className="flex-1">
                <Text className="text-muted-foreground text-xs font-bold uppercase mb-2 ml-1">
                  <FormattedMessage id="paymentMethods.expiry" />
                </Text>
                <Controller
                  control={control}
                  name="expiry"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="bg-card p-4 rounded-xl text-foreground font-medium border border-border/50"
                      placeholder="MM/YY"
                      placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                      maxLength={5}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.expiry && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {intl.formatMessage({ id: "auth.error.required" })}
                  </Text>
                )}
              </View>

              {/* CVV */}
              <View className="flex-1">
                <Text className="text-muted-foreground text-xs font-bold uppercase mb-2 ml-1">
                  <FormattedMessage id="paymentMethods.cvv" />
                </Text>
                <Controller
                  control={control}
                  name="cvv"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="bg-card p-4 rounded-xl text-foreground font-medium border border-border/50"
                      placeholder="123"
                      placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.cvv && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {intl.formatMessage({ id: "auth.error.required" })}
                  </Text>
                )}
              </View>
            </View>

            <View className="mt-8">
              <Button
                title={intl.formatMessage({ id: "paymentMethods.save" })}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
