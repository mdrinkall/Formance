/**
 * Header - Reusable header component
 * Transparent header with PFP, title, and action icons
 * Does not show on Record Swing screen
 */

import React from 'react';
import { View, Text, StyleSheet, Platform, ViewProps, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';

interface HeaderProps extends ViewProps {
  title?: string;
  showLogo?: boolean;
  backgroundColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showLogo = true,
  backgroundColor = 'transparent',
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  const handleNotifications = () => {
    console.log('Notifications pressed');
  };

  const handleMessages = () => {
    console.log('Messages pressed');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.sm,
          backgroundColor,
        },
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {/* Left: FORMANCE Logo */}
        <Text style={styles.logoText}>FORMANCE</Text>

        {/* Center: Spacer */}
        <View style={styles.centerContent} />

        {/* Right: Action Icons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleMessages}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Messages"
            {...Platform.select({
              web: { style: { cursor: 'pointer' } },
            })}
          >
            <Ionicons name="chatbubble-outline" size={24} color={palette.accent.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNotifications}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            {...Platform.select({
              web: { style: { cursor: 'pointer' } },
            })}
          >
            <Ionicons name="notifications-outline" size={24} color={palette.accent.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    minHeight: 44,
  },
  logoText: {
    ...typography.h4,
    color: palette.accent.white,
    letterSpacing: 1.5,
    fontWeight: '400',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    ...typography.h4,
    color: palette.accent.white,
    letterSpacing: 1,
  },
  title: {
    ...typography.h4,
    color: palette.accent.white,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
});
