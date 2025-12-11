/**
 * Input component
 * Reusable text input with consistent styling
 */

import React from 'react';
import { View, TextInput, Text, TextInputProps, StyleSheet, Platform } from 'react-native';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={palette.text.light.secondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border.light,
    borderRadius: 8,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...typography.body,
    backgroundColor: palette.accent.white,
    minHeight: 44, // Touch target
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  inputError: {
    borderColor: palette.error,
  },
  errorText: {
    ...typography.caption,
    color: palette.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: palette.text.light.secondary,
    marginTop: spacing.xs,
  },
});
