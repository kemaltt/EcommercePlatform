import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Notification } from "@shared/schema";
import { FormattedMessage, useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/theme-context";
import { Bell, CheckCheck, ChevronLeft, Inbox } from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { enUS, tr, de } from "date-fns/locale";
import * as Haptics from "expo-haptics";

const locales: Record<string, any> = {
  en: enUS,
  tr: tr,
  de: de,
};

export default function NotificationsScreen() {
  const intl = useIntl();
  const router = useRouter();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const locale = locales[intl.locale] || enUS;

  const {
    data: notifications,
    isLoading,
    refetch,
    isRefetching,
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

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    if (notification.data && (notification.data as any).screen) {
      router.push((notification.data as any).screen);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className={`p-4 border-b border-border/50 flex-row items-center ${
        item.isRead ? "opacity-60" : "bg-primary/5"
      }`}
      onPress={() => handleNotificationPress(item)}
    >
      <View
        className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
          item.isRead ? "bg-muted" : "bg-primary/20"
        }`}
      >
        <Bell size={20} color={isDark ? "#fbbf24" : "#4f46e5"} />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-foreground font-bold flex-1 mr-2">
            {item.title}
          </Text>
          <Text className="text-muted-foreground text-[10px]">
            {formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
              locale,
            })}
          </Text>
        </View>
        <Text
          className="text-muted-foreground text-xs leading-4"
          numberOfLines={2}
        >
          {item.body}
        </Text>
      </View>
      {!item.isRead && (
        <View className="w-2 h-2 rounded-full bg-primary ml-3" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center border-b border-border/50">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 w-10 h-10 items-center justify-center rounded-full bg-muted/50"
            >
              <ChevronLeft size={24} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
            <Text className="text-foreground text-xl font-bold">
              {intl.formatMessage({ id: "notifications.title" })}
            </Text>
          </View>
          {notifications && notifications.some((n) => !n.isRead) && (
            <TouchableOpacity
              onPress={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="flex-row items-center"
            >
              <CheckCheck size={16} color="#6366f1" />
              <Text className="text-primary text-xs font-bold ml-1">
                {intl.formatMessage({ id: "notifications.markAllRead" })}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : notifications && notifications.length > 0 ? (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#6366f1"
              />
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center px-10">
            <View className="w-20 h-20 bg-muted rounded-full items-center justify-center mb-6">
              <Inbox size={40} color={isDark ? "#94a3b8" : "#64748b"} />
            </View>
            <Text className="text-foreground text-lg font-bold text-center mb-2">
              {intl.formatMessage({ id: "notifications.empty" })}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
