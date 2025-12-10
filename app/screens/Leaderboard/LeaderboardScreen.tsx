/**
 * LeaderboardScreen
 * Global and friends leaderboard
 * TODO: Implement leaderboard with ranking and filters
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';

export default function LeaderboardScreen() {
  return (
    <ScreenContainer scrollable>
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Leaderboard</Text>

        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold">1. John Doe</Text>
            <Text className="text-blue-600 font-semibold">2,450 pts</Text>
          </View>
          <Text className="text-gray-500 text-sm">TODO: Display actual leaderboard data</Text>
        </Card>

        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold">2. Jane Smith</Text>
            <Text className="text-blue-600 font-semibold">2,380 pts</Text>
          </View>
        </Card>

        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold">3. Mike Johnson</Text>
            <Text className="text-blue-600 font-semibold">2,290 pts</Text>
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}
