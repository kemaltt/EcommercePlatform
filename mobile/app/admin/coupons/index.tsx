import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Tag,
  Calendar,
  Percent,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { useTheme } from "../../../contexts/theme-context";
import { useIntl } from "react-intl";
import { format } from "date-fns";
import { Coupon } from "../../../../shared/schema";

export default function CouponListScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: coupons,
    isLoading,
    refetch,
  } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
    queryFn: async () => {
      const res = await api.get("/admin/coupons");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleDelete = (id: string) => {
    // Ideally add confirmation dialog here
    deleteMutation.mutate(id);
  };

  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    <View className="bg-card p-4 rounded-2xl mb-3 border border-border/50 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${coupon.isActive ? "bg-green-500/10" : "bg-red-500/10"}`}
          >
            <Tag size={20} color={coupon.isActive ? "#22c55e" : "#ef4444"} />
          </View>
          <View>
            <Text className="text-foreground font-bold text-lg">
              {coupon.code}
            </Text>
            <View className="flex-row items-center">
              <Text
                className={`text-xs font-bold ${coupon.isActive ? "text-green-500" : "text-red-500"}`}
              >
                {coupon.isActive
                  ? intl.formatMessage({ id: "admin.coupons.active" })
                  : intl.formatMessage({ id: "admin.coupons.inactive" })}
              </Text>
              <Text className="text-muted-foreground text-xs mx-1">•</Text>
              <Text className="text-muted-foreground text-xs">
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}%`
                  : `$${coupon.discountValue}`}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(coupon.id)}
          className="p-2 bg-red-500/10 rounded-full"
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap gap-2 mt-2">
        {coupon.minPurchaseAmount > 0 && (
          <View className="bg-secondary px-2 py-1 rounded-md flex-row items-center">
            <Text className="text-secondary-foreground text-xs">
              Min: ${coupon.minPurchaseAmount}
            </Text>
          </View>
        )}
        {coupon.expirationDate && (
          <View className="bg-secondary px-2 py-1 rounded-md flex-row items-center">
            <Calendar
              size={10}
              color={isDark ? "#94a3b8" : "#64748b"}
              className="mr-1"
            />
            <Text className="text-secondary-foreground text-xs">
              {format(new Date(coupon.expirationDate), "MMM d, yyyy")}
            </Text>
          </View>
        )}
        {coupon.usageLimit && (
          <View className="bg-secondary px-2 py-1 rounded-md">
            <Text className="text-secondary-foreground text-xs">
              {coupon.usedCount} / {coupon.usageLimit}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

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
            <View>
              <Text className="text-foreground text-lg font-bold">
                {intl.formatMessage({ id: "admin.coupons.title" })}
              </Text>
              <Text className="text-muted-foreground text-xs font-bold">
                {intl.formatMessage({ id: "admin.coupons.manage" })}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/admin/coupons/create")}
            className="w-10 h-10 bg-primary rounded-full items-center justify-center shadow-md shadow-primary/30"
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" className="mt-10" />
          ) : coupons && coupons.length > 0 ? (
            coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))
          ) : (
            <View className="items-center justify-center mt-20">
              <View className="w-20 h-20 bg-card rounded-full items-center justify-center mb-4 border border-border">
                <Tag size={40} color={isDark ? "#475569" : "#cbd5e1"} />
              </View>
              <Text className="text-muted-foreground font-bold text-lg">
                No coupons found
              </Text>
              <Text className="text-muted-foreground text-sm text-center px-10 mt-2">
                Create a new coupon to get started.
              </Text>
            </View>
          )}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
