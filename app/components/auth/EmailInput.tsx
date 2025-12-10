/**
 * EmailInput Component
 * Specialized email input for auth forms
 */

import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

interface EmailInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  label = 'Email',
  error,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <Ionicons
          name="mail-outline"
          size={20}
          color={error ? palette.error : palette.primary[900]}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={palette.text.dark.disabled}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    ...typography.label,
    color: palette.text.dark.primary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border.light,
    borderRadius: 12,
    backgroundColor: palette.background.light,
    paddingHorizontal: spacing.base,
    height: 52,
  },
  inputWrapperError: {
    borderColor: palette.error,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    ...typography.body,
    color: '#000000',
    flex: 1,
    height: '100%',
  },
  errorText: {
    ...typography.caption,
    color: palette.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
