import { View, TextInput, Text, TextInputProps } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../../contexts/theme-context";

interface InputProps extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  className?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  style?: any;
  labelStyle?: any;
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
  numberOfLines,
  ...props
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
        className={`flex-row items-center bg-card rounded-2xl overflow-hidden transition-all duration-200 ${
          error 
            ? "border border-destructive/50 bg-destructive/5 " 
            : className.includes('border-0') ? "" : "border border-border"
        }`}
        style={multiline ? { alignItems: 'flex-start', height: 'auto', minHeight: 100 } : { height: 56 }}
      >
        {icon && (
          <View className="pl-5">
            {icon}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          className={`flex-1 px-5 text-base text-foreground font-medium ${multiline ? 'text-top pt-4 min-h-[100px]' : ''}`}
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          {...props}
          style={{ 
            paddingVertical: multiline ? 16 : 0,
            minHeight: multiline ? 100 : 56,
            textAlignVertical: multiline ? 'top' : 'center'
          }}
        />
        {rightIcon && (
          <View className="pr-5">
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
