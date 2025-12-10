/**
 * AuthFormWrapper Component
 * Wraps auth forms with consistent layout and styling
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, style]} {...props}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.formContainer}>
            {children}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xxxl,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: palette.accent.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
});
