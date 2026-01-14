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
  // Check if it's being used as a simple input (like in SearchBar) without container styles
  // If "border-0" is passed in className, we might want to skip the container styling or handle it differently.
  // BUT for now in index.tsx I used a raw implementation. 
  // Wait, I used <Input /> in index.tsx inside a styled view. 
  // The current Input implementation enforces a container with border and background. 
  // Let's make it flexible.

  return (
    <View className={`mb-5 ${className.includes('mb-0') ? 'mb-0' : ''} ${className.includes('flex-1') ? 'flex-1' : ''}`}>
      {label && (
        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">
          {label}
        </Text>
      )}
      <View 
        className={`flex-row items-center bg-card rounded-2xl overflow-hidden transition-all duration-200 ${
          // Allow overriding border/bg via parents or strict props? 
          // For simplicity, if className implies special handling we reduce default styles.
          // Actually, let's just keep the default robust style unless explicitly disabled?
          // The search bar in index.tsx wraps this. Double nesting might look bad.
          // Let's just render the TextInput if no wrapper is needed?
          // No, consistent internal structure is better.
          // Let's make the container style overridable.
             
          error 
            ? "border border-destructive/50 bg-destructive/5 " 
            : className.includes('border-0') ? "" : "border border-border hover:border-primary/50 focus:border-primary focus:bg-primary/5"
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
