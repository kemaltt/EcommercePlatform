import { View, TextInput, Text } from "react-native";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
}

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, error, className = "" }: InputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-foreground mb-2">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        className={`bg-card text-foreground border ${error ? "border-red-500" : "border-border"} rounded-xl p-3 text-base`}
        placeholderTextColor="#9ca3af"
      />
      {error && (
        <Text className="text-xs text-red-500 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
