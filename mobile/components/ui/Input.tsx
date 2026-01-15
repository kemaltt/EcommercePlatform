import { View, TextInput, Text } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../../contexts/theme-context";

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
  style?: any;
  labelStyle?: any;
  multiline?: boolean;
  numberOfLines?: number;
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
  rightIcon,
  style,
  labelStyle,
  multiline,
  numberOfLines
}: InputProps) {
  const { isDark } = useTheme();

  return (
    <View className={`mb-5 ${className.includes('mb-0') ? 'mb-0' : ''} ${className.includes('flex-1') ? 'flex-1' : ''}`} style={style}>
      {label && (
        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1" style={labelStyle}>
          {label}
        </Text>
      )}
      <View 
        className={`flex-row items-center bg-card rounded-xl overflow-hidden transition-all duration-200 ${
          error 
            ? "border border-destructive/50 bg-destructive/5 " 
            : className.includes('border-0') ? "" : "border border-border"
        }`}
        style={multiline ? { alignItems: 'flex-start', height: 'auto', minHeight: 100 } : undefined}
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
          className={`flex-1 p-4 text-base text-foreground font-medium ${multiline ? 'text-top pt-4' : 'h-14'}`}
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          multiline={multiline}
          numberOfLines={numberOfLines}
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
