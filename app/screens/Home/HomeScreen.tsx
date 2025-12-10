/**
 * HomeScreen
 * Main dashboard/home screen
 * TODO: Implement dashboard with stats, recent activity, quick actions
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { PlaceholderChart } from '../../components/charts/PlaceholderChart';

export default function HomeScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Home</Text>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-2">Quick Stats</Text>
          <Text className="text-gray-600">TODO: Display user stats</Text>
        </Card>

        <PlaceholderChart title="Progress This Month" height={200} />

        <Card className="mt-4">
          <Text className="text-lg font-semibold mb-2">Recent Activity</Text>
          <Text className="text-gray-600">TODO: Display recent swings, scores</Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}
