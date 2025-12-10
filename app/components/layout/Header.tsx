/**
 * Header component
 * Reusable header with back button and title
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  rightComponent,
}) => {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <View className="w-12">
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-blue-600 text-base">Back</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-lg font-semibold text-gray-900">{title}</Text>
      <View className="w-12">{rightComponent}</View>
    </View>
  );
};
