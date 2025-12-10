/**
 * Divider Component
 * Visual separator with optional text (e.g., "or")
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

interface DividerProps extends ViewProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text, style, ...props }) => {
  if (text) {
    return (
      <View style={[styles.containerWithText, style]} {...props}>
        <View style={styles.line} />
        <Text style={styles.text}>{text}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={[styles.line, style]} {...props} />;
};

const styles = StyleSheet.create({
  containerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border.light,
    opacity: 0.3,
  },
  text: {
    ...typography.bodySmall,
    color: palette.accent.white,
    opacity: 0.7,
    marginHorizontal: spacing.base,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
