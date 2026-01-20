import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { X } from "lucide-react-native";
import { StarRating } from "./StarRating";
import { Button } from "./ui/Button";
import { useIntl } from "react-intl";
import { useTheme } from "../contexts/theme-context";

interface AddReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isLoading?: boolean;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const intl = useIntl();
  const { isDark } = useTheme();

  const handleSubmit = async () => {
    await onSubmit(rating, comment);
    setComment("");
    setRating(5);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="bg-background rounded-t-[32px] p-6 pb-10 border-t border-border"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-foreground">
                  {intl.formatMessage({ id: "review.write.title" })}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
                >
                  <X size={16} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
              </View>

              <View className="items-center mb-6">
                <Text className="text-muted-foreground text-sm mb-3">
                  {intl.formatMessage({ id: "review.write.rating" })}
                </Text>
                <StarRating
                  rating={rating}
                  maxStars={5}
                  size={32}
                  editable
                  onRatingChange={setRating}
                />
              </View>

              <View className="mb-6">
                <Text className="text-muted-foreground text-sm mb-2">
                  {intl.formatMessage({ id: "review.write.comment" })}
                </Text>
                <TextInput
                  className="bg-card border border-border rounded-2xl p-4 min-h-[120px] text-foreground text-base"
                  textAlignVertical="top"
                  multiline
                  placeholder={intl.formatMessage({
                    id: "review.write.placeholder",
                  })}
                  placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
                  value={comment}
                  onChangeText={setComment}
                />
              </View>

              <Button
                title={intl.formatMessage({ id: "review.submit" })}
                onPress={handleSubmit}
                loading={isLoading}
                className="h-14 rounded-2xl"
              />
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
