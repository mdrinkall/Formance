/**
 * Card component
 * Reusable card container with consistent styling
 */

import React, { ReactNode } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { palette } from '../../theme/palette';
import { spacing } from '../../styles/spacing';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  ...props
}) => {
  return (
    <View style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: palette.background.light,
    borderRadius: 12,
    padding: spacing.base,
  },
  default: {
    // No additional styles for default
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: palette.border.light,
  },
});
