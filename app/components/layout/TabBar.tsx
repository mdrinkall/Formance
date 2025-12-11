/**
 * TabBar component
 * Simple bottom navigation with 5 equal icons
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/styles';
import { palette } from '@/theme/palette';

// Icon mapping for each tab
const TAB_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; focusedName: keyof typeof Ionicons.glyphMap }> = {
  Home: { name: 'home-outline', focusedName: 'home' },
  Community: { name: 'people-outline', focusedName: 'people' },
  Record: { name: 'radio-button-on-outline', focusedName: 'radio-button-on' },
  History: { name: 'time-outline', focusedName: 'time' },
  Profile: { name: 'person-outline', focusedName: 'person' },
};

export const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.sm },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get icon for this route
        const iconConfig = TAB_ICONS[route.name];
        const iconName = isFocused ? iconConfig?.focusedName : iconConfig?.name;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabContainer}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label as string}
          >
            {iconName ? (
              <Ionicons
                name={iconName}
                size={28}
                color={isFocused ? palette.primary[900] : palette.text.light.secondary}
              />
            ) : (
              <View style={[styles.iconPlaceholder, isFocused && styles.iconPlaceholderFocused]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: palette.background.light,
    borderTopWidth: 1,
    borderTopColor: palette.border.light,
    paddingTop: spacing.sm,
    minHeight: 60,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    minHeight: 56,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  iconPlaceholder: {
    width: 28,
    height: 28,
    backgroundColor: palette.neutral[300],
    borderRadius: 4,
  },
  iconPlaceholderFocused: {
    backgroundColor: palette.primary[700],
  },
});

