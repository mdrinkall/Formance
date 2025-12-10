/**
 * Spacing System
 * Standardized spacing values for consistent layout
 */

export const spacing = {
  // Base spacing unit (4px)
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
} as const;

// Screen padding presets
export const screenPadding = {
  horizontal: spacing.base,
  vertical: spacing.lg,
} as const;

// Common spacing helpers
export const spacingHelpers = {
  // Gap between sections
  sectionGap: spacing.xl,
  // Gap between items in a list
  itemGap: spacing.md,
  // Gap between buttons
  buttonGap: spacing.base,
} as const;
