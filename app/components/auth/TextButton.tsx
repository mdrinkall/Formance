/**
 * TextButton Component
 * Text-based button for secondary actions (e.g., "Forgot Password?")
 */

import React from 'react';
import { Text, Pressable, StyleSheet, PressableProps, Platform } from 'react-native';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme';

interface TextButtonProps extends PressableProps {
  title: string;
  align?: 'left' | 'center' | 'right';
}

export const TextButton: React.FC<TextButtonProps> = ({
  title,
  align = 'center',
  style,
  ...props
}) => {
  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.button,
        styles[`align_${align}`],
        pressed && styles.pressed,
        Platform.OS === 'web' && hovered && styles.hovered,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...props}
    >
      {({ pressed }) => (
        <Text style={[styles.text, pressed && styles.textPressed]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minHeight: 44, // Touch target requirement
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  align_left: {
    alignSelf: 'flex-start',
  },
  align_center: {
    alignSelf: 'center',
  },
  align_right: {
    alignSelf: 'flex-end',
  },
  text: {
    ...typography.body,
    color: palette.accent.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.7,
  },
  textPressed: {
    opacity: 0.7,
  },
  hovered: {
    opacity: 1,
  },
});
