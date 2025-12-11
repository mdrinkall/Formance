/**
 * AuthFormWrapper Component
 * Wraps auth forms with consistent layout and styling
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

interface AuthFormWrapperProps extends ViewProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({
  title,
  subtitle,
  children,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.formContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xxxl,
    alignItems: 'flex-start',
  },
  title: {
    ...typography.h2,
    color: palette.accent.white,
    textAlign: 'left',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    fontFamily: 'Inter_300Light',
    fontWeight: '300',
    color: palette.accent.white,
    opacity: 0.9,
    textAlign: 'left',
  },
  formContainer: {
    width: '100%',
  },
});
