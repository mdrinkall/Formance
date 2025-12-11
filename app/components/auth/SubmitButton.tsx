/**
 * SubmitButton Component
 * Submit button for auth forms with loading state
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

interface SubmitButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  title,
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={palette.accent.white} size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: palette.primary[900],
    borderRadius: 9999,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    shadowColor: palette.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: palette.text.dark.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    ...typography.button,
    color: palette.accent.white,
  },
});
