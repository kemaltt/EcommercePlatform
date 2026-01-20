import React from "react";
import { View, Text, FlatList } from "react-native";
import { Review } from "@shared/schema";
import { StarRating } from "./StarRating";
import { useTheme } from "../contexts/theme-context";
import { User as UserIcon } from "lucide-react-native";
import { useIntl } from "react-intl";

interface ReviewListProps {
  reviews: (Review & {
    user?: {
      username: string;
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  })[];
  isLoading?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  isLoading,
}) => {
  const { isDark } = useTheme();
  const intl = useIntl();

  if (isLoading) {
    return (
      <View className="py-4">
        <Text className="text-muted-foreground text-center">
          Loading reviews...
        </Text>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View className="py-8 items-center bg-card rounded-2xl border border-dashed border-border mt-4">
        <Text className="text-muted-foreground font-medium">
          {intl.formatMessage({ id: "product.reviews.empty" })}
        </Text>
        <Text className="text-muted-foreground/60 text-xs mt-1">
          {intl.formatMessage({ id: "product.reviews.beFirst" })}
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4">
      {reviews.map((review) => (
        <View
          key={review.id}
          className="bg-card p-4 rounded-xl border border-border mb-3"
        >
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center overflow-hidden">
                {review.user?.avatarUrl ? (
                  // Ensure Image component is used if needed, or simple View placeholder
                  <View className="w-full h-full bg-primary/20 items-center justify-center">
                    <Text className="text-primary font-bold text-xs">
                      {review.user.fullName.charAt(0)}
                    </Text>
                  </View>
                ) : (
                  <UserIcon size={16} color={isDark ? "#94a3b8" : "#64748b"} />
                )}
              </View>
              <View>
                <Text className="text-foreground font-bold text-sm">
                  {review.user?.fullName || "Anonymous"}
                </Text>
                <Text className="text-muted-foreground text-[10px]">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <StarRating rating={review.rating} size={12} />
          </View>
          {review.comment && (
            <Text className="text-foreground text-sm leading-5">
              {review.comment}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};
