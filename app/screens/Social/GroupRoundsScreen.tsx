/**
 * GroupRoundsScreen
 * View and create group rounds/meetups
 * TODO: Implement group round management
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function GroupRoundsScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Group Rounds</Text>

        <Button title="Create New Round" className="mb-4 bg-blue-600 py-3" />

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Weekend Round</Text>
          <Text className="text-gray-600 mb-1">Saturday, March 16 - 9:00 AM</Text>
          <Text className="text-gray-600 mb-2">Pebble Beach Golf Course</Text>
          <Text className="text-blue-600 text-sm">4/4 players</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Practice Session</Text>
          <Text className="text-gray-600 mb-1">Sunday, March 17 - 2:00 PM</Text>
          <Text className="text-gray-600 mb-2">Local Driving Range</Text>
          <Text className="text-blue-600 text-sm">2/4 players</Text>
        </Card>

        <Text className="text-gray-500 text-sm mt-4">TODO: Implement group rounds functionality</Text>
      </View>
    </ScreenContainer>
  );
}
