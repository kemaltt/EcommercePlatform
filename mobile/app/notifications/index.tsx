import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react-native";
import { useTheme } from "../../contexts/theme-context";
import { api } from "../../lib/api";
import { Notification } from "@shared/schema";
import { format } from "date-fns";
import { tr, de, enUS } from "date-fns/locale";

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const intl = useIntl();
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const getDateLocale = () => {
    const locale = intl.locale.split("-")[0];
    switch (locale) {
      case "tr":
        return tr;
      case "de":
        return de;
      default:
        return enUS;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_status":
        return (
          <CheckCircle2 size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
        );
      case "promotion":
        return <Bell size={20} color={isDark ? "#fbbf24" : "#d97706"} />;
      default:
        return <Bell size={20} color={isDark ? "#94a3b8" : "#64748b"} />;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 py-4 flex-row items-center border-b border-border/10 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card items-center justify-center mr-4"
          >
            <ChevronLeft size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">
            <FormattedMessage id="notifications.title" />
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={isDark ? "#818cf8" : "#4f46e5"}
            />
          }
        >
          {isLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator
                size="large"
                color={isDark ? "#818cf8" : "#4f46e5"}
              />
            </View>
          ) : notifications && notifications.length > 0 ? (
            <View className="gap-4">
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => {
                    if (!notification.isRead) {
                      markAsReadMutation.mutate(notification.id);
                    }
                  }}
                  className={`bg-card border ${
                    notification.isRead
                      ? "border-border/30 opacity-70"
                      : "border-primary/30"
                  } rounded-3xl p-5 mb-2 active:opacity-90 transition-opacity`}
                >
                  <View className="flex-row items-start gap-4">
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center ${
                        notification.isRead
                          ? "bg-secondary/50"
                          : "bg-primary/10"
                      }`}
                    >
                      {getNotificationIcon(
                        (notification.data as any)?.type || "default",
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text
                          className={`font-bold text-base ${
                            notification.isRead
                              ? "text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <View className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </View>
                      <Text
                        className={`text-sm mb-2 ${
                          notification.isRead
                            ? "text-muted-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notification.body}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Clock
                          size={12}
                          color={isDark ? "#94a3b8" : "#64748b"}
                        />
                        <Text className="text-[10px] text-muted-foreground font-medium">
                          {format(
                            new Date(notification.createdAt),
                            "dd MMM, HH:mm",
                            {
                              locale: getDateLocale(),
                            },
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-20 opacity-70">
              <View className="w-24 h-24 bg-secondary rounded-full items-center justify-center mb-6">
                <Bell size={40} color={isDark ? "#94a3b8" : "#64748b"} />
              </View>
              <Text className="text-foreground font-bold text-xl mb-2 text-center">
                <FormattedMessage id="notifications.title" />
              </Text>
              <Text className="text-muted-foreground text-center px-10 leading-6">
                <FormattedMessage id="notifications.empty" />
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
