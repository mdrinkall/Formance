/**
 * Color palette for Formance
 * Brand colors: Dark Royal British Green & Cream Beige
 */

export const palette = {
  // Primary colors - Dark Royal British Green
  primary: {
    50: '#e8f5ed',
    100: '#c6e5d1',
    200: '#a0d4b3',
    300: '#79c394',
    400: '#5db67d',
    500: '#41a965',  // Base green
    600: '#3a9a5c',
    700: '#318850',
    800: '#287744',
    900: '#1A4D2E',  // Dark Royal British Green (main brand color)
    950: '#0c1f14',  // Near-black dark green
  },

  // Secondary colors - Cream Beige
  secondary: {
    50: '#fdfcfa',
    100: '#f9f7f3',
    200: '#f5f2eb',
    300: '#f1ede3',
    400: '#ede9db',
    500: '#E9E5D6',  // Cream Beige (main brand color)
    600: '#d4cec0',
    700: '#bfb5a9',
    800: '#a99d92',
    900: '#8b8074',
  },

  // Accent colors
  accent: {
    green: '#41a965',
    darkGreen: '#1A4D2E',
    cream: '#E9E5D6',
    white: '#ffffff',
    gold: '#d4af37',
  },

  // Semantic colors
  success: '#41a965',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Background colors
  background: {
    light: '#ffffff',
    dark: '#0f1419',
    lightSecondary: '#E9E5D6',  // Cream beige
    darkSecondary: '#1A4D2E',   // Dark green
  },

  // Text colors
  text: {
    light: {
      primary: '#1A4D2E',     // Dark green for light backgrounds
      secondary: '#287744',    // Medium green
      disabled: '#a0d4b3',
    },
    dark: {
      primary: '#E9E5D6',     // Cream for dark backgrounds
      secondary: '#f1ede3',
      disabled: '#8b8074',
    },
  },

  // Border colors
  border: {
    light: '#e0e0e0',
    dark: '#287744',
  },

  // Glass effect colors (for iOS-style blur)
  glass: {
    light: 'rgba(233, 229, 214, 0.8)',      // Cream with opacity
    lightBorder: 'rgba(255, 255, 255, 0.3)',
    dark: 'rgba(26, 77, 46, 0.8)',          // Dark green with opacity
    darkBorder: 'rgba(255, 255, 255, 0.1)',
  },

  // Transparent
  transparent: 'transparent',
};

export type Palette = typeof palette;
