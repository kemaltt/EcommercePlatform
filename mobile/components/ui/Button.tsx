import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success";
  className?: string;
  icon?: React.ReactNode;
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
  style,
  textStyle
}: ButtonProps) {
  const isDisabled = loading || disabled;

  const baseContainerStyles = "rounded-2xl overflow-hidden active:opacity-90 transition-opacity";
  const baseContentStyles = "flex-row items-center justify-center py-4 px-6";

  const variants = {
    primary: "bg-primary shadow-lg shadow-primary/30",
    secondary: "bg-secondary",
    outline: "bg-transparent border-2 border-primary/20",
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

  const Content = () => (
    <View className={baseContentStyles}>
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#6366f1" : "white"} className="mr-2" />
      ) : icon ? (
        <View className="mr-2">{icon}</View>
      ) : null}
      <Text className={`text-base ${textStyles[variant]}`} style={textStyle}>
        {title}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseContainerStyles} ${variants[variant]} ${isDisabled ? "opacity-60" : ""} ${className}`}
      style={style}
    >
        <Content />
    </TouchableOpacity>
  );
}
