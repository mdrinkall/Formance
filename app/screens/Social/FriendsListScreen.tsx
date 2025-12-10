/**
 * FriendsListScreen
 * Display list of friends
 * TODO: Implement friends list with actions
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function FriendsListScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Friends</Text>

        <Button title="Add Friends" className="mb-4 bg-blue-600 py-3" />

        <Card className="mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
            <View className="flex-1">
              <Text className="text-lg font-semibold">John Doe</Text>
              <Text className="text-gray-600 text-sm">Handicap: 12.5</Text>
            </View>
          </View>
        </Card>

        <Card className="mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
            <View className="flex-1">
              <Text className="text-lg font-semibold">Jane Smith</Text>
              <Text className="text-gray-600 text-sm">Handicap: 18.3</Text>
            </View>
          </View>
        </Card>

        <Text className="text-gray-500 text-sm mt-4">TODO: Display actual friends list</Text>
      </View>
    </ScreenContainer>
  );
}
