/**
 * PasswordInput Component
 * Password input with visibility toggle and optional strength indicator for auth forms
 */

import React, { useState, useMemo } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, TextInputProps, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

interface PasswordInputProps extends TextInputProps {
  label?: string;
  error?: string;
  showStrength?: boolean;
}

type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return 'weak';

  let strength = 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 3) return 'medium';
  if (strength <= 4) return 'strong';
  return 'very-strong';
};

const getStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return palette.error;
    case 'medium':
      return palette.warning;
    case 'strong':
      return palette.success;
    case 'very-strong':
      return palette.primary[900];
  }
};

const getStrengthLabel = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'medium':
      return 'Medium';
    case 'strong':
      return 'Strong';
    case 'very-strong':
      return 'Very Strong';
  }
};

const getStrengthProgress = (strength: PasswordStrength): number => {
  switch (strength) {
    case 'weak':
      return 25;
    case 'medium':
      return 50;
    case 'strong':
      return 75;
    case 'very-strong':
      return 100;
  }
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = 'Password',
  error,
  showStrength = false,
  value,
  style,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(true);

  const strength = useMemo(() => {
    return showStrength && value ? calculatePasswordStrength(value as string) : null;
  }, [value, showStrength]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={error ? palette.error : palette.primary[900]}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={palette.text.dark.disabled}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          value={value}
          {...props}
        />
        <Pressable
          onPress={() => setIsSecure(!isSecure)}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
          {...Platform.select({
            web: {
              style: { cursor: 'pointer' },
            },
          })}
        >
          <Ionicons
            name={isSecure ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={palette.primary[900]}
          />
        </Pressable>
      </View>

      {/* Password Strength Indicator */}
      {showStrength && value && strength && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBarContainer}>
            <View
              style={[
                styles.strengthBar,
                {
                  width: `${getStrengthProgress(strength)}%`,
                  backgroundColor: getStrengthColor(strength),
                },
              ]}
            />
          </View>
          <Text style={[styles.strengthText, { color: getStrengthColor(strength) }]}>
            {getStrengthLabel(strength)}
          </Text>
        </View>
      )}

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
    borderRadius: 9999,
    backgroundColor: palette.background.light,
    paddingHorizontal: spacing.base,
    minHeight: 52,
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
    outlineStyle: 'none',
  },
  iconButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPressed: {
    opacity: 0.6,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  strengthBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: `${palette.border.light}40`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    ...typography.caption,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  errorText: {
    ...typography.caption,
    color: palette.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
