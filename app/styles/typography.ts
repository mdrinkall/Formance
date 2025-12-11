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
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '500',
  bold: '500',
} as const;

// Line heights
export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// Typography presets - ready-to-use text styles
export const typography: Record<string, TextStyle> = {
  // Headings - Modern, light, professional
  h1: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    color: palette.text.light.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    color: palette.text.light.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    color: palette.text.light.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: -0.3,
  },
  h4: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize['2xl'] * lineHeight.normal,
    color: palette.text.light.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: -0.2,
  },

  // Body text - Clean, readable
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.base * lineHeight.normal,
    color: palette.text.light.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.lg * lineHeight.normal,
    color: palette.text.light.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: palette.text.light.secondary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },

  // Special text styles
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * lineHeight.normal,
    color: palette.text.light.secondary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
  button: {
    fontSize: 15,
    fontWeight: fontWeight.normal,
    lineHeight: 15 * lineHeight.tight,
    color: palette.accent.white,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: palette.text.light.primary,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },

  // Dark variants (for dark backgrounds)
  h1Dark: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    color: palette.text.dark.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: -0.5,
  },
  h2Dark: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    color: palette.text.dark.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: -0.5,
  },
  bodyDark: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.base * lineHeight.normal,
    color: palette.text.dark.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
};
