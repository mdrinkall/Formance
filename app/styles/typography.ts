/**
 * Typography System
 * Standardized text styles for consistent typography
 */

import { TextStyle } from 'react-native';
import { palette } from '../theme/palette';

// Font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

// Font weights
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Line heights
export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// Typography presets - ready-to-use text styles
export const typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    color: palette.text.light.primary,
  },
  h2: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    color: palette.text.light.primary,
  },
  h3: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    color: palette.text.light.primary,
  },
  h4: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'] * lineHeight.normal,
    color: palette.text.light.primary,
  },

  // Body text
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.base * lineHeight.normal,
    color: palette.text.light.primary,
  },
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.lg * lineHeight.normal,
    color: palette.text.light.primary,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: palette.text.light.secondary,
  },

  // Special text styles
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * lineHeight.normal,
    color: palette.text.light.secondary,
  },
  button: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.base * lineHeight.tight,
    color: palette.accent.white,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: palette.text.light.primary,
  },

  // Dark variants (for dark backgrounds)
  h1Dark: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    color: palette.text.dark.primary,
  },
  h2Dark: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    color: palette.text.dark.primary,
  },
  bodyDark: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.base * lineHeight.normal,
    color: palette.text.dark.primary,
  },
};
