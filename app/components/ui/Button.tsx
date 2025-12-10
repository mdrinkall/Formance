/**
 * Button component
 * Reusable button with consistent styling
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { palette } from '../../theme/palette';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[`${variant}Button`],
    styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? palette.accent.white : palette.primary[900]} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants
  primaryButton: {
    backgroundColor: palette.primary[900],
  },
  secondaryButton: {
    backgroundColor: palette.secondary[500],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.primary[900],
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },

  // Sizes
  smSize: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  mdSize: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  lgSize: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
  },

  // Text styles
  baseText: {
    ...typography.button,
  },
  primaryText: {
    color: palette.accent.white,
  },
  secondaryText: {
    color: palette.primary[900],
  },
  outlineText: {
    color: palette.primary[900],
  },
  ghostText: {
    color: palette.primary[900],
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
});
