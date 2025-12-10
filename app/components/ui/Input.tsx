/**
 * Input component
 * Reusable text input with NativeWind styling
 */

import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  // TODO: Implement input styling with NativeWind classes
  return (
    <View className="mb-4">
      {label && <Text className="mb-2 text-gray-700 font-medium">{label}</Text>}
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="mt-1 text-red-500 text-sm">{error}</Text>}
      {helperText && !error && <Text className="mt-1 text-gray-500 text-sm">{helperText}</Text>}
    </View>
  );
};
