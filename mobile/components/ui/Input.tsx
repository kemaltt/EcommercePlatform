import { View, TextInput, Text } from "react-native";
import { ReactNode } from "react";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  icon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  error, 
  className = "",
  autoCapitalize = "none",
  icon,
  rightIcon
}: InputProps) {
  return (
    <View className={`mb-5 ${className}`}>
      {label && (
        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">
          {label}
        </Text>
      )}
      <View 
        className={`flex-row items-center bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${
          error 
            ? "border-destructive/50 bg-destructive/5" 
            : "border-border hover:border-primary/50 focus:border-primary focus:bg-primary/5"
        }`}
      >
        {icon && (
          <View className="pl-4">
            {icon}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          className="flex-1 p-4 text-base text-foreground font-medium h-14"
          placeholderTextColor="#64748b"
        />
        {rightIcon && (
          <View className="pr-4">
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text className="text-xs text-destructive font-medium mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
