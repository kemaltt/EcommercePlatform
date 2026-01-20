import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, Stack } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { ChevronLeft, Calendar } from "lucide-react-native";
import { useTheme } from "../../../contexts/theme-context";
import { useIntl } from "react-intl";
import { Controller, useForm } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";

type CouponFormData = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minPurchaseAmount: string;
  usageLimit: string;
  expirationDate: Date | null;
  isActive: boolean;
};

export default function CreateCouponScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: "",
      minPurchaseAmount: "",
      usageLimit: "",
      expirationDate: null,
      isActive: true,
    },
  });

  const expirationDate = watch("expirationDate");
  const discountType = watch("discountType");

  const createMutation = useMutation({
    mutationFn: async (data: CouponFormData) => {
      const payload = {
        ...data,
        discountValue: Number(data.discountValue), // Convert to number
        minPurchaseAmount: data.minPurchaseAmount
          ? Number(data.minPurchaseAmount)
          : undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
        // Ensure date is properly formatted if needed, or just send date object
      };
      const res = await api.post("/admin/coupons", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      router.back();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to create coupon");
    },
  });

  const onSubmit = (data: CouponFormData) => {
    createMutation.mutate(data);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setValue("expirationDate", selectedDate);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-background border-b border-border/50">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-card rounded-full items-center justify-center border border-border mr-4"
            >
              <ChevronLeft size={20} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
            <Text className="text-foreground text-lg font-bold">
              {intl.formatMessage({ id: "admin.coupons.create" })}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          {/* Code */}
          <View className="mb-4">
            <Text className="text-foreground font-bold mb-2">
              {intl.formatMessage({ id: "admin.coupons.code" })} *
            </Text>
            <Controller
              control={control}
              rules={{ required: true }}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-card text-foreground p-4 rounded-xl border border-border/50 font-bold uppercase"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="SUMMER2024"
                  placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
                  autoCapitalize="characters"
                />
              )}
            />
            {errors.code && (
              <Text className="text-red-500 text-xs mt-1">Required</Text>
            )}
          </View>

          {/* Discount Type */}
          <View className="mb-4">
            <Text className="text-foreground font-bold mb-2">
              {intl.formatMessage({ id: "admin.coupons.discountType" })}
            </Text>
            <View className="flex-row bg-card rounded-xl p-1 border border-border/50">
              <TouchableOpacity
                className={`flex-1 p-3 rounded-lg items-center justify-center ${discountType === "percentage" ? "bg-primary" : "bg-transparent"}`}
                onPress={() => setValue("discountType", "percentage")}
              >
                <Text
                  className={`font-bold ${discountType === "percentage" ? "text-white" : "text-muted-foreground"}`}
                >
                  {intl.formatMessage({ id: "admin.coupons.percentage" })} (%)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-3 rounded-lg items-center justify-center ${discountType === "fixed" ? "bg-primary" : "bg-transparent"}`}
                onPress={() => setValue("discountType", "fixed")}
              >
                <Text
                  className={`font-bold ${discountType === "fixed" ? "text-white" : "text-muted-foreground"}`}
                >
                  {intl.formatMessage({ id: "admin.coupons.fixed" })} ($)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Value */}
          <View className="mb-4">
            <Text className="text-foreground font-bold mb-2">
              {intl.formatMessage({ id: "admin.coupons.discountValue" })} *
            </Text>
            <Controller
              control={control}
              rules={{ required: true, pattern: /^[0-9.]+$/ }}
              name="discountValue"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-card text-foreground p-4 rounded-xl border border-border/50"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="numeric"
                  placeholder="20"
                  placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
                />
              )}
            />
            {errors.discountValue && (
              <Text className="text-red-500 text-xs mt-1">Invalid number</Text>
            )}
          </View>

          {/* Min Purchase */}
          <View className="mb-4">
            <Text className="text-foreground font-bold mb-2">
              {intl.formatMessage({ id: "admin.coupons.minPurchase" })}
            </Text>
            <Controller
              control={control}
              name="minPurchaseAmount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-card text-foreground p-4 rounded-xl border border-border/50"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
                />
              )}
            />
          </View>

          {/* Usage Limit */}
          <View className="mb-4">
            <Text className="text-foreground font-bold mb-2">
              {intl.formatMessage({ id: "admin.coupons.usageLimit" })}
            </Text>
            <Controller
              control={control}
              name="usageLimit"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-card text-foreground p-4 rounded-xl border border-border/50"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="numeric"
                  placeholder="Unlimited"
                  placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
                />
              )}
            />
          </View>

          {/* Expiration Date */}
          <View className="mb-6">
            <Text className="text-foreground font-bold mb-2">
              {intl.formatMessage({ id: "admin.coupons.expiryDate" })}
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-card p-4 rounded-xl border border-border/50 flex-row justify-between items-center"
            >
              <Text className="text-foreground">
                {expirationDate
                  ? expirationDate.toDateString()
                  : "No Expiration"}
              </Text>
              <Calendar size={20} color={isDark ? "#cbd5e1" : "#475569"} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={expirationDate || new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Is Active Switch */}
          <View className="mb-8 flex-row justify-between items-center bg-card p-4 rounded-xl border border-border/50">
            <Text className="text-foreground font-bold">
              {intl.formatMessage({ id: "admin.coupons.active" })}
            </Text>
            <Controller
              control={control}
              name="isActive"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: "#767577", true: "#6366f1" }}
                  thumbColor={value ? "#ffffff" : "#f4f3f4"}
                />
              )}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={createMutation.isPending}
            className={`w-full bg-[#6366f1] p-4 rounded-xl items-center justify-center mb-10 shadow-lg shadow-indigo-500/50 ${createMutation.isPending ? "opacity-50" : ""}`}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {intl.formatMessage({ id: "admin.coupons.save" })}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
