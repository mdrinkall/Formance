/**
 * FormSuccess Component
 * Displays success messages in auth forms
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

interface FormSuccessProps extends ViewProps {
  message?: string;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({ message, style, ...props }) => {
  if (!message) return null;

  return (
    <View style={[styles.container, style]} {...props}>
      <Ionicons name="checkmark-circle" size={16} color={palette.success} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${palette.success}15`,
    borderLeftWidth: 3,
    borderLeftColor: palette.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: 8,
    gap: spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    color: palette.success,
    flex: 1,
  },
});
