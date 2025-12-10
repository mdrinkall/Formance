/**
 * Main theme export
 * Combines all theme tokens
 */

import { palette } from './palette';
import { spacing } from './spacing';
import { typography } from './typography';

export const lightTheme = {
  palette,
  spacing,
  typography,
  colors: {
    primary: palette.primary[600],
    secondary: palette.secondary[600],
    background: palette.background.light,
    backgroundSecondary: palette.background.lightSecondary,
    text: palette.text.light.primary,
    textSecondary: palette.text.light.secondary,
    textDisabled: palette.text.light.disabled,
    border: palette.border.light,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
  },
};

export const darkTheme = {
  palette,
  spacing,
  typography,
  colors: {
    primary: palette.primary[400],
    secondary: palette.secondary[400],
    background: palette.background.dark,
    backgroundSecondary: palette.background.darkSecondary,
    text: palette.text.dark.primary,
    textSecondary: palette.text.dark.secondary,
    textDisabled: palette.text.dark.disabled,
    border: palette.border.dark,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
  },
};

export type Theme = typeof lightTheme;

export { palette, spacing, typography };
