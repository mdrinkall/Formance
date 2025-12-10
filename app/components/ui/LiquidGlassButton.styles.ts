import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Base Button Styles
  button: {
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Size Variants - Button
  smallButton: {
    borderRadius: 20,
    minWidth: 80,
  },
  mediumButton: {
    borderRadius: 28,
    minWidth: 120,
  },
  largeButton: {
    borderRadius: 9999,
    minWidth: 160,
  },

  // Size Variants - Pressable
  smallPressable: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  mediumPressable: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 56,
  },
  largePressable: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 64,
  },

  // Variant Styles
  primaryButton: {
    // Tint color handles the glass effect
  },
  secondaryButton: {
    // Tint color handles the glass effect
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    // Tint color handles the glass effect
  },

  // Pressable
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },

  // Content Container
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon Styles
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Text Base
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },

  // Text Size Variants
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediumText: {
    fontSize: 16,
    lineHeight: 24,
  },
  largeText: {
    fontSize: 18,
    lineHeight: 28,
  },

  // Text Variant Colors
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#FFFFFF',
  },
  ghostText: {
    color: '#FFFFFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    opacity: 0.6,
  },
});
