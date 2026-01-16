import React from 'react';
import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../contexts/theme-context';
import { useIntl } from 'react-intl';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export function PasswordStrengthIndicator({ password = '' }: PasswordStrengthIndicatorProps) {
  const { isDark } = useTheme();
  const intl = useIntl();

  const requirements = [
    { label: intl.formatMessage({ id: 'validation.password.req.length' }), valid: password.length >= 8 },
    { label: intl.formatMessage({ id: 'validation.password.req.upper' }), valid: /[A-Z]/.test(password) },
    { label: intl.formatMessage({ id: 'validation.password.req.lower' }), valid: /[a-z]/.test(password) },
    { label: intl.formatMessage({ id: 'validation.password.req.number' }), valid: /\d/.test(password) },
    { label: intl.formatMessage({ id: 'validation.password.req.special' }), valid: /[@$!%*?&.]/.test(password) },
  ];

  return (
    <View className="mt-2 mb-4">
      {requirements.map((req, index) => (
        <View key={index} className="flex-row items-center mb-1">
          {req.valid ? (
            <Check size={14} color="#22c55e" />
          ) : (
            <View className={`w-3.5 h-3.5 rounded-full border border-muted-foreground/30 mr-[2px]`} />
          )}
          <Text 
            className={`text-xs ml-2 ${req.valid ? "text-green-500 font-medium" : "text-muted-foreground"}`}
          >
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
