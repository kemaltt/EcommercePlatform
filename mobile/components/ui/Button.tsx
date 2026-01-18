import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../contexts/theme-context";

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success";
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: any;
  textStyle?: any;
}

export function Button({
  onPress,
  title,
  loading,
  disabled,
  variant = "primary",
  className = "",
  icon,
  iconPosition = "left",
  style,
  textStyle,
}: ButtonProps) {
  const { isDark } = useTheme();
  const isDisabled = loading || disabled;

  // If h- is not provided in className, we add a default height padding
  const hasHeightClass = className.includes("h-");

  const variants = {
    primary: "bg-primary shadow-lg shadow-primary/30",
    secondary: "bg-secondary",
    outline: "bg-transparent border border-primary/20",
    ghost: "bg-transparent",
    success: "bg-green-500 shadow-lg shadow-green-500/30",
  };

  const textStyles = {
    primary: "text-primary-foreground font-bold tracking-wide",
    secondary: "text-secondary-foreground font-semibold",
    outline: "text-primary font-bold",
    ghost: "text-primary font-medium",
    success: "text-white font-bold tracking-wide",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-xl overflow-hidden active:opacity-90 transition-opacity ${variants[variant]} ${isDisabled ? "opacity-60" : ""} ${className}`}
      style={style}
    >
      <View
        className={`flex-row items-center justify-between px-6 ${hasHeightClass ? "h-full" : "py-4"}`}
        style={{ minHeight: hasHeightClass ? undefined : 56 }}
      >
        {loading ? (
          <View className="flex-1 flex-row items-center justify-center">
            <ActivityIndicator
              color={
                variant === "outline" || variant === "ghost"
                  ? isDark
                    ? "#6366f1"
                    : "#4f46e5"
                  : "white"
              }
              className="mr-2"
            />
            <Text
              className={`text-base ${textStyles[variant]}`}
              style={textStyle}
            >
              {title}
            </Text>
          </View>
        ) : (
          <>
            {/* Left Slot: 24px wide to balance the layout */}
            <View className="w-6 items-center justify-center">
              {icon && iconPosition === "left" ? icon : null}
            </View>

            {/* Middle Slot: Scalable text container */}
            <View className="flex-1 items-center justify-center px-2">
              <Text
                className={`text-base ${textStyles[variant]} text-center`}
                style={textStyle}
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>

            {/* Right Slot: 24px wide to balance the layout */}
            <View className="w-6 items-center justify-center">
              {icon && iconPosition === "right" ? icon : null}
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
