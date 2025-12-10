/**
 * FormError Component
 * Displays error messages in auth forms
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

interface FormErrorProps extends ViewProps {
  message?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, style, ...props }) => {
  if (!message) return null;

  return (
    <View style={[styles.container, style]} {...props}>
      <Ionicons name="alert-circle" size={16} color={palette.error} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${palette.error}15`,
    borderLeftWidth: 3,
    borderLeftColor: palette.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: 8,
    gap: spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    color: palette.error,
    flex: 1,
  },
});
