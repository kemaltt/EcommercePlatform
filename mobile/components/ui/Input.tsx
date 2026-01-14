import { View, TextInput, Text } from "react-native";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export function Input({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  error, 
  className = "",
  autoCapitalize = "none"
}: InputProps) {
  return (
    <View className={`mb-5 ${className}`}>
      {label && (
        <Text className="text-sm font-semibold text-foreground/80 mb-2 ml-1">
          {label}
        </Text>
      )}
      <View 
        className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${
          error 
            ? "border-destructive/50 bg-destructive/5" 
            : "border-border hover:border-primary/50 focus:border-primary focus:bg-primary/5 focus:ring-2 focus:ring-primary/20"
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          className="p-4 text-base text-foreground font-medium w-full"
          placeholderTextColor="#a1a1aa"
        />
      </View>
      {error && (
        <Text className="text-xs text-destructive font-medium mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
