import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Package,
  Calendar,
  DollarSign,
} from "lucide-react-native";
import { useTheme } from "../../../../contexts/theme-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import { Order } from "@shared/schema";
import { Button } from "../../../../components/ui/Button";
import { FormattedMessage, useIntl } from "react-intl";
import DateTimePicker from "@react-native-community/datetimepicker";

type OrderDetail = Order & {
  items: any[];
  customer?: {
    id: string;
    fullName: string;
    email: string;
    username: string;
  };
};

export default function ManageOrderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [shippingDate, setShippingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "api">("manual");

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: [`/api/admin/orders/${id}`],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/admin/orders/${id}`);
      return res.data;
    },
  });

  // Set initial values when order data is loaded
  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setShippingCost(order.shippingCost?.toString() || "0");
      if (order.shippedAt) {
        setShippingDate(new Date(order.shippedAt));
      }
      if (order.trackingNumber) {
        setTrackingNumber(order.trackingNumber);
      }
      if (order.shippingCarrier) {
        setShippingCarrier(order.shippingCarrier);
      }
    }
  }, [order]);

  const updateMutation = useMutation({
    mutationFn: async (data: {
      status?: string;
      trackingNumber?: string;
      shippingCarrier?: string;
      shippedAt?: string;
    }) => {
      const res = await api.patch(`/admin/orders/${id}/status`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/orders/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      Alert.alert(
        intl.formatMessage({ id: "common.success" }),
        intl.formatMessage({ id: "admin.orders.manage.updateSuccess" }),
      );
      router.back();
    },
    onError: (error: any) => {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        error.response?.data?.message ||
          intl.formatMessage({ id: "admin.orders.manage.updateError" }),
      );
    },
  });

  const handleUpdateStatus = () => {
    updateMutation.mutate({
      status: selectedStatus,
    });
  };

  const handleCreateLabel = () => {
    if (!trackingNumber.trim()) {
      Alert.alert(
        intl.formatMessage({ id: "common.error" }),
        intl.formatMessage({ id: "admin.orders.manage.trackingRequired" }),
      );
      return;
    }

    updateMutation.mutate({
      status: "shipped",
      trackingNumber: trackingNumber.trim(),
      shippingCarrier: shippingCarrier || undefined,
      shippedAt: shippingDate.toISOString(),
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator
          size="large"
          color={isDark ? "#818cf8" : "#4f46e5"}
        />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">
          <FormattedMessage
            id="admin.orders.manage.notFound"
            defaultMessage="Order not found"
          />
        </Text>
      </View>
    );
  }

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

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
          <View>
            <Text className="text-xl font-bold text-foreground">
              <FormattedMessage
                id="admin.orders.manage.title"
                defaultMessage="Manage Order"
              />
            </Text>
            <Text className="text-xs text-muted-foreground">
              #{order.orderNumber}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          {/* Status Update Section */}
          <View className="bg-card p-5 rounded-3xl border border-border/50 mb-4">
            <View className="flex-row items-center mb-4">
              <Package size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
              <Text className="text-foreground font-bold text-lg ml-2">
                <FormattedMessage
                  id="admin.orders.manage.updateStatus"
                  defaultMessage="Update Status"
                />
              </Text>
            </View>

            <View className="gap-2">
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  onPress={() => setSelectedStatus(status.value)}
                  className={`p-4 rounded-2xl border ${
                    selectedStatus === status.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      selectedStatus === status.value
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={intl.formatMessage({
                id: "admin.orders.manage.updateStatusButton",
              })}
              onPress={handleUpdateStatus}
              variant="primary"
              className="mt-4"
              disabled={updateMutation.isPending}
            />
          </View>

          {/* Label Creation Section */}
          <View className="bg-card p-5 rounded-3xl border border-border/50 mb-4">
            <Text className="text-foreground font-bold text-lg mb-4">
              <FormattedMessage
                id="admin.orders.manage.createLabel"
                defaultMessage="Create Shipping Label"
              />
            </Text>

            {/* Tabs */}
            <View className="flex-row bg-background rounded-2xl p-1 mb-4">
              <TouchableOpacity
                onPress={() => setActiveTab("manual")}
                className={`flex-1 py-3 rounded-xl ${
                  activeTab === "manual" ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-center font-bold ${
                    activeTab === "manual"
                      ? "text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  <FormattedMessage
                    id="admin.orders.manage.manual"
                    defaultMessage="Manual"
                  />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("api")}
                className={`flex-1 py-3 rounded-xl ${
                  activeTab === "api" ? "bg-primary" : "bg-transparent"
                } opacity-50`}
                disabled
              >
                <Text
                  className={`text-center font-bold ${
                    activeTab === "api" ? "text-white" : "text-muted-foreground"
                  }`}
                >
                  <FormattedMessage
                    id="admin.orders.manage.api"
                    defaultMessage="API (Coming Soon)"
                  />
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === "manual" && (
              <View className="gap-4">
                {/* Tracking Number */}
                <View>
                  <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase">
                    <FormattedMessage
                      id="admin.orders.manage.trackingNumber"
                      defaultMessage="Tracking Number"
                    />
                  </Text>
                  <TextInput
                    value={trackingNumber}
                    onChangeText={setTrackingNumber}
                    placeholder={intl.formatMessage({
                      id: "admin.orders.manage.trackingPlaceholder",
                    })}
                    placeholderTextColor="#94a3b8"
                    className="bg-background border border-border rounded-2xl px-4 py-3 text-foreground"
                  />
                </View>

                {/* Shipping Carrier */}
                <View>
                  <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase">
                    <FormattedMessage
                      id="admin.orders.manage.shippingCarrier"
                      defaultMessage="Shipping Carrier"
                    />
                  </Text>
                  <View className="gap-2">
                    {["DHL", "DPD", "UPS", "FedEx", "Hermes", "GLS"].map(
                      (carrier) => (
                        <TouchableOpacity
                          key={carrier}
                          onPress={() => setShippingCarrier(carrier)}
                          className={`p-3 rounded-2xl border flex-row items-center ${
                            shippingCarrier === carrier
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background"
                          }`}
                        >
                          <View
                            className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                              shippingCarrier === carrier
                                ? "border-primary"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {shippingCarrier === carrier && (
                              <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </View>
                          <Text
                            className={`font-bold ${
                              shippingCarrier === carrier
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {carrier}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                {/* Shipping Cost */}
                <View>
                  <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase">
                    <FormattedMessage
                      id="admin.orders.manage.shippingCost"
                      defaultMessage="Shipping Cost"
                    />
                  </Text>
                  <View className="flex-row items-center bg-background border border-border rounded-2xl px-4">
                    <DollarSign size={20} color="#94a3b8" />
                    <TextInput
                      value={shippingCost}
                      onChangeText={setShippingCost}
                      placeholder="0.00"
                      placeholderTextColor="#94a3b8"
                      keyboardType="decimal-pad"
                      className="flex-1 py-3 text-foreground ml-2"
                    />
                  </View>
                </View>

                {/* Shipping Date */}
                <View>
                  <Text className="text-muted-foreground text-xs font-bold mb-2 uppercase">
                    <FormattedMessage
                      id="admin.orders.manage.shippingDate"
                      defaultMessage="Shipping Date"
                    />
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="flex-row items-center bg-background border border-border rounded-2xl px-4 py-3"
                  >
                    <Calendar size={20} color="#94a3b8" />
                    <Text className="text-foreground ml-2 flex-1">
                      {shippingDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={shippingDate}
                      mode="date"
                      display="default"
                      onChange={(event: any, selectedDate?: Date) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setShippingDate(selectedDate);
                        }
                      }}
                    />
                  )}
                </View>

                <Button
                  title={intl.formatMessage({
                    id: "admin.orders.manage.createLabelButton",
                  })}
                  onPress={handleCreateLabel}
                  variant="primary"
                  className="mt-2"
                  disabled={updateMutation.isPending}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
