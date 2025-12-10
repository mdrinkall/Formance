/**
 * FriendProfileScreen
 * View friend's profile and stats
 * TODO: Implement friend profile display
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function FriendProfileScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-gray-300 rounded-full mb-4" />
          <Text className="text-2xl font-bold text-gray-900">Friend Name</Text>
          <Text className="text-gray-600">Handicap: 14.8</Text>
        </View>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Stats</Text>
          <Text className="text-gray-600">TODO: Display friend's stats</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Recent Activity</Text>
          <Text className="text-gray-600">TODO: Display friend's activity</Text>
        </Card>

        <Button title="Challenge" className="mt-4 bg-blue-600 py-3" />
        <Button title="Remove Friend" variant="outline" className="mt-2" />
      </View>
    </ScreenContainer>
  );
}
