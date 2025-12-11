/**
 * Header - Reusable header component
 * Transparent header with PFP, title, and action icons
 * Does not show on Record Swing screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ViewProps, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '@/styles';
import { palette } from '@/theme/palette';
import { useNotifications } from '../context/NotificationsContext';
import { NotificationsModal } from './NotificationsModal';

interface HeaderProps extends ViewProps {
  title?: string;
  showLogo?: boolean;
  backgroundColor?: string;
  leftAction?: React.ReactNode;
  rightActions?: React.ReactNode;
  showNotifications?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showLogo = true,
  backgroundColor = 'transparent',
  leftAction,
  rightActions,
  showNotifications = true,
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);

  const handleNotifications = () => {
    setNotificationsModalVisible(true);
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
        {/* Left: Custom Action, FORMANCE Logo, or Title */}
        {leftAction ? (
          leftAction
        ) : showLogo ? (
          <Text style={styles.logoText}>FORMANCE</Text>
        ) : title ? (
          <Text style={styles.titleText}>{title}</Text>
        ) : (
          <View />
        )}

        {/* Center: Spacer */}
        <View style={styles.centerContent} />

        {/* Right: Custom Actions or Default Icons */}
        {rightActions ? (
          rightActions
        ) : showNotifications ? (
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
              {unreadCount > 0 && <View style={styles.badge} />}
            </TouchableOpacity>
          </View>
        ) : (
          <View />
        )}
      </View>
      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
      />
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
  titleText: {
    ...typography.h4,
    color: palette.accent.white,
    fontWeight: '300',
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
    position: 'relative',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: palette.error,
    borderRadius: 8,
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: palette.primary[900],
  },
});
