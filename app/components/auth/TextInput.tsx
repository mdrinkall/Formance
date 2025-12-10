/**
 * TextInput Component
 * Reusable text input for auth forms with consistent styling
 */

import React from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet, TextInputProps, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  icon,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? palette.error : palette.primary[900]}
            style={styles.icon}
          />
        )}
        <RNTextInput
          style={[styles.input, !icon && styles.inputNoIcon]}
          placeholderTextColor={palette.text.dark.disabled}
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
    minHeight: 52,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
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
    minHeight: 52,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  inputNoIcon: {
    paddingLeft: 0,
  },
  errorText: {
    ...typography.caption,
    color: palette.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
