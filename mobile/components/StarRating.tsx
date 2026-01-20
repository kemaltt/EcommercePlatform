import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Star } from "lucide-react-native";
import { useTheme } from "../contexts/theme-context";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  onRatingChange,
  editable = false,
}) => {
  const { isDark } = useTheme();

  return (
    <View className="flex-row">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <TouchableOpacity
            key={index}
            disabled={!editable}
            onPress={() => onRatingChange && onRatingChange(starValue)}
            activeOpacity={0.7}
          >
            <Star
              size={size}
              color="#fbbf24"
              fill={isFilled ? "#fbbf24" : "transparent"}
              style={{ marginRight: index < maxStars - 1 ? 2 : 0 }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
