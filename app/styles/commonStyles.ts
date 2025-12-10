/**
 * Common Styles
 * Reusable style patterns and utilities
 */

import { StyleSheet, ViewStyle } from 'react-native';
import { spacing } from './spacing';
import { palette } from '../theme/palette';

export const commonStyles = StyleSheet.create({
  // Flex layouts
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexBetween: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexStart: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  flexEnd: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  // Alignment
  alignCenter: {
    alignItems: 'center',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyAround: {
    justifyContent: 'space-around',
  },

  // Containers
  container: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: palette.background.light,
    borderRadius: 12,
    padding: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Spacing utilities
  mb0: { marginBottom: 0 },
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.base },
  mb5: { marginBottom: spacing.lg },
  mb6: { marginBottom: spacing.xl },

  mt0: { marginTop: 0 },
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.base },
  mt5: { marginTop: spacing.lg },
  mt6: { marginTop: spacing.xl },

  p0: { padding: 0 },
  p1: { padding: spacing.xs },
  p2: { padding: spacing.sm },
  p3: { padding: spacing.md },
  p4: { padding: spacing.base },
  p5: { padding: spacing.lg },
  p6: { padding: spacing.xl },

  // Borders
  rounded: {
    borderRadius: 8,
  },
  roundedLg: {
    borderRadius: 12,
  },
  roundedFull: {
    borderRadius: 9999,
  },

  // Backgrounds
  bgPrimary: {
    backgroundColor: palette.primary[900],
  },
  bgSecondary: {
    backgroundColor: palette.secondary[500],
  },
  bgWhite: {
    backgroundColor: palette.accent.white,
  },
  bgTransparent: {
    backgroundColor: 'transparent',
  },

  // Widths
  fullWidth: {
    width: '100%',
  },

  // Shadows
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});

// Helper function to combine styles
export const combineStyles = (...styles: (ViewStyle | undefined | false)[]): ViewStyle => {
  return Object.assign({}, ...styles.filter(Boolean));
};
