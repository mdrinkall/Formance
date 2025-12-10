/**
 * TabBar component
 * Custom tab bar for bottom navigation
 * TODO: Implement with actual icons and styling
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View className="flex-row bg-white border-t border-gray-200">
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

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center justify-center py-3"
          >
            {/* TODO: Add actual icons */}
            <View className="w-6 h-6 bg-gray-300 rounded mb-1" />
            <Text className={isFocused ? 'text-blue-600 text-xs' : 'text-gray-600 text-xs'}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
