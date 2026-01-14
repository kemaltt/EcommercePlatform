import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

export function Button({ onPress, title, loading, disabled, variant = "primary", className = "" }: ButtonProps) {
  const baseStyles = "flex-row items-center justify-center py-3 px-6 rounded-xl";
  const variants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "bg-transparent border border-primary",
  };

  const textStyles = {
    primary: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    outline: "text-primary",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      className={`${baseStyles} ${variants[variant]} ${loading || disabled ? "opacity-70" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#3b82f6" : "white"} className="mr-2" />
      ) : null}
      <Text className={`text-base font-semibold ${textStyles[variant]}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
