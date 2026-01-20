import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { useIntl } from "react-intl";
import { X, Star, ChevronDown, Check } from "lucide-react-native";
import { Button } from "./ui/Button";
import { useTheme } from "../contexts/theme-context";

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
    category?: string;
  }) => void;
  currentFilters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
    category?: string;
  };
}

export const FilterModal = ({
  isVisible,
  onClose,
  onApply,
  currentFilters,
}: FilterModalProps) => {
  const intl = useIntl();
  const { isDark } = useTheme();
  const [minPrice, setMinPrice] = useState(
    currentFilters.minPrice?.toString() || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    currentFilters.maxPrice?.toString() || "",
  );
  const [minRating, setMinRating] = useState(currentFilters.minRating || 0);
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || "newest");

  const sortOptions = [
    { id: "newest", label: "filter.sort.newest" },
    { id: "price_asc", label: "filter.sort.price_asc" },
    { id: "price_desc", label: "filter.sort.price_desc" },
    { id: "rating_desc", label: "filter.sort.rating_desc" },
  ];

  const handleApply = () => {
    onApply({
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating || undefined,
      sortBy,
    });
    onClose();
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setSortBy("newest");
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          <TouchableWithoutFeedback>
            <View
              className={`h-[80%] rounded-t-3xl p-6 ${isDark ? "bg-[#1C1C1E]" : "bg-white"}`}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <Text
                  className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {intl.formatMessage({ id: "filter.title" })}
                </Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <X size={24} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Sort By */}
                <View className="mb-6">
                  <Text
                    className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {intl.formatMessage({ id: "filter.sort_by" })}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => setSortBy(option.id)}
                        className={`px-4 py-2 rounded-full border ${
                          sortBy === option.id
                            ? "bg-primary border-primary"
                            : isDark
                              ? "border-gray-700 bg-gray-800"
                              : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            sortBy === option.id
                              ? "text-white font-bold"
                              : isDark
                                ? "text-gray-300"
                                : "text-gray-700"
                          }`}
                        >
                          {intl.formatMessage({ id: option.label })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price Range */}
                <View className="mb-6">
                  <Text
                    className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {intl.formatMessage({ id: "filter.price_range" })}
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-1">
                      <TextInput
                        placeholder={intl.formatMessage({
                          id: "filter.min_price",
                        })}
                        placeholderTextColor={isDark ? "#666" : "#999"}
                        value={minPrice}
                        onChangeText={setMinPrice}
                        keyboardType="numeric"
                        className={`h-12 px-4 rounded-xl border ${
                          isDark
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                    </View>
                    <View
                      className={`w-4 h-[1px] ${isDark ? "bg-gray-700" : "bg-gray-300"}`}
                    />
                    <View className="flex-1">
                      <TextInput
                        placeholder={intl.formatMessage({
                          id: "filter.max_price",
                        })}
                        placeholderTextColor={isDark ? "#666" : "#999"}
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                        keyboardType="numeric"
                        className={`h-12 px-4 rounded-xl border ${
                          isDark
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                    </View>
                  </View>
                </View>

                {/* Minimum Rating */}
                <View className="mb-6">
                  <Text
                    className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {intl.formatMessage({ id: "filter.rating" })}
                  </Text>
                  <View className="flex-row gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setMinRating(star)}
                        className={`w-12 h-12 rounded-xl items-center justify-center border ${
                          minRating >= star
                            ? "bg-yellow-400 border-yellow-400"
                            : isDark
                              ? "border-gray-700 bg-gray-800"
                              : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <Star
                          size={20}
                          fill={minRating >= star ? "white" : "transparent"}
                          color={
                            minRating >= star
                              ? "white"
                              : isDark
                                ? "#666"
                                : "#ADADAD"
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Footer Actions */}
              <View className="flex-row gap-4 mt-4">
                <View className="flex-1">
                  <Button
                    title={intl.formatMessage({ id: "filter.reset" })}
                    variant="outline"
                    onPress={handleReset}
                  />
                </View>
                <View className="flex-[2]">
                  <Button
                    title={intl.formatMessage({ id: "filter.apply" })}
                    onPress={handleApply}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
