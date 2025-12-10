/**
 * ProfileScreen
 * User profile and settings
 * TODO: Implement profile display and editing
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-gray-300 rounded-full mb-4" />
          <Text className="text-2xl font-bold text-gray-900">User Name</Text>
          <Text className="text-gray-600">Handicap: 15.2</Text>
        </View>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Stats</Text>
          <Text className="text-gray-600">TODO: Display user stats</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Recent Rounds</Text>
          <Text className="text-gray-600">TODO: Display recent rounds</Text>
        </Card>

        <Button title="Edit Profile" variant="outline" className="mt-4" />
        <Button title="Settings" variant="outline" className="mt-2" />
        <Button title="Sign Out" variant="outline" className="mt-2" />
      </View>
    </ScreenContainer>
  );
}
